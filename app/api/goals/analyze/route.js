import connectMongo from "@/lib/dbConfig";
import { Goal } from "@/models/Goal";
import { Journal } from "@/models/Journal";
import { DayStatus } from "@/models/DayStatus";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns true if the goal applies to this specific date/period.
 * Mirrors the exact same logic used by GoalCalendar on the frontend.
 */
function isGoalApplicableForDate(goal, dateStr, weekStartStr, monthStartStr) {
  const goalStart = new Date(goal.startDate);
  goalStart.setHours(0, 0, 0, 0);
  const dateObj = new Date(dateStr + "T00:00:00");

  // Goal must have started on or before this date
  if (goalStart > dateObj) return false;

  if (goal.frequency === "daily") {
    // Daily goals apply to every day from startDate onward — match by exact startDate day
    return formatDateStr(goalStart) === dateStr;
  }
  if (goal.frequency === "weekly") {
    const gws = new Date(goal.startDate);
    gws.setHours(0, 0, 0, 0);
    gws.setDate(gws.getDate() - gws.getDay()); // snap to Sunday of goal's week
    return formatDateStr(gws) === weekStartStr;
  }
  if (goal.frequency === "monthly") {
    const gms = new Date(goal.startDate);
    gms.setHours(0, 0, 0, 0);
    gms.setDate(1);
    return formatDateStr(gms) === monthStartStr;
  }
  return false;
}

/**
 * Simple keyword text-matching: goal is "mentioned as done" if all
 * significant words from its title appear in the journal text.
 */
function isGoalMentionedInJournal(goalTitle, combinedText) {
  const text = combinedText.toLowerCase();
  const keywords = goalTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (keywords.length === 0) return false;
  return keywords.every((kw) => text.includes(kw));
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date } = await req.json(); // YYYY-MM-DD
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    await connectMongo();

    // --- 1. Get journals for this date ---
    const [y, m, d] = date.split("-").map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);

    const journals = await Journal.find({
      userId: session.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (journals.length === 0) {
      return NextResponse.json(
        { message: "No journals found for this date to analyze." },
        { status: 200 }
      );
    }

    // --- 2. Fetch all active goals ---
    const dateObj = new Date(date + "T00:00:00");
    const allGoals = await Goal.find({
      userId: session.user.id,
      startDate: { $lte: dateObj },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: dateObj } },
      ],
    });

    if (allGoals.length === 0) {
      return NextResponse.json(
        { message: "No goals set for this period." },
        { status: 200 }
      );
    }

    // --- 3. Calculate period start strings ---
    const weekStart = new Date(dateObj);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(dateObj);
    monthStart.setDate(1);
    const weekStartStr = formatDateStr(weekStart);
    const monthStartStr = formatDateStr(monthStart);

    // Filter to only goals that belong to this date's period
    const periodGoals = allGoals.filter((g) =>
      isGoalApplicableForDate(g, date, weekStartStr, monthStartStr)
    );

    if (periodGoals.length === 0) {
      return NextResponse.json({ success: true, status: "none" }, { status: 200 });
    }

    // --- 4. Text-match: update completedDates for each period goal ---
    const combinedText = journals
      .map((j) => `${j.title || ""} ${j.plainText || ""}`)
      .join(" ");

    const goalUpdates = [];
    for (const goal of periodGoals) {
      const mentioned = isGoalMentionedInJournal(goal.title, combinedText);
      if (mentioned) {
        goalUpdates.push(
          Goal.updateOne(
            { _id: goal._id, completedDates: { $ne: date } },
            { $addToSet: { completedDates: date } }
          )
        );
        // Mark it locally so we don't need to re-fetch
        if (!goal.completedDates.includes(date)) {
          goal.completedDates.push(date);
        }
      } else {
        goalUpdates.push(
          Goal.updateOne({ _id: goal._id }, { $pull: { completedDates: date } })
        );
        goal.completedDates = goal.completedDates.filter((cd) => !cd.startsWith(date));
      }
    }
    await Promise.all(goalUpdates);

    // --- 5. Count how many period goals are now completed for this date ---
    const completedCount = periodGoals.filter((g) =>
      g.completedDates.some((cd) => typeof cd === "string" && cd.startsWith(date))
    ).length;
    const totalCount = periodGoals.length;

    // --- 6. Determine and permanently store the day status ---
    let finalStatus;
    if (completedCount === totalCount) {
      finalStatus = "green";
    } else if (completedCount > 0) {
      finalStatus = "yellow";
    } else {
      finalStatus = "red";
    }

    await DayStatus.findOneAndUpdate(
      { userId: session.user.id, date },
      { status: finalStatus },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, status: finalStatus, completedCount, totalCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/goals/analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze goals" }, { status: 500 });
  }
}
