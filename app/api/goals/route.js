import connectMongo from "@/lib/dbConfig";
import { Goal } from "@/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // Optional: fetch goals for a specific date

    await connectMongo();
    let query = { userId: session.user.id };

    if (date) {
      const d = new Date(date);
      // For daily: startDate must match date
      // For weekly: startDate must be in the same week
      // For monthly: startDate must be in the same month
      // Simplified: we'll fetch all and filter in JS or do complex mongo query
      // Let's do a broader fetch for the calendar to handle coloring multiple days
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, frequency, targetDate } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectMongo();

    let startDate;
    if (targetDate) {
      const [y, m, d] = targetDate.split("-").map(Number);
      startDate = new Date(y, m - 1, d);
    } else {
      startDate = new Date();
    }
    startDate.setHours(0, 0, 0, 0);

    if (frequency === "weekly") {
      // Set to start of week (Sunday)
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
    } else if (frequency === "monthly") {
      // Set to start of month
      startDate.setDate(1);
    }

    const goal = await Goal.create({
      userId: session.user.id,
      title,
      frequency,
      startDate,
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("POST /api/goals error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await connectMongo();
    await Goal.deleteOne({ _id: id, userId: session.user.id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/goals error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}

