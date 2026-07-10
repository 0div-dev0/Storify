import mongoose from "mongoose";
import connectMongo from "@/lib/dbConfig";
import { Journal } from "@/models/Journal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET /api/journals — list all journals for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const journals = await Journal.aggregate([
      { $match: { userId: session.user.id } },
      { $sort: { date: -1 } },
      {
        $project: {
          title: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
          plainText: { $substrCP: ["$plainText", 0, 150] }
        }
      }
    ]);

    return NextResponse.json({ journals }, { status: 200 });
  } catch (error) {
    console.error("GET /api/journals error:", error);
    return NextResponse.json({ error: "Failed to fetch journals" }, { status: 500 });
  }
}

// POST /api/journals — create a new journal
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, plainText, date } = await req.json();

    if (!content || !date) {
      return NextResponse.json({ error: "Content and date are required" }, { status: 400 });
    }

    await connectMongo();

    // Check if a journal already exists for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Journal.findOne({
      userId: session.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A journal entry already exists for this date. Edit it instead." },
        { status: 409 }
      );
    }

    const journal = await Journal.create({
      userId: session.user.id,
      title: title || "Untitled Entry",
      content,
      plainText: plainText || "",
      date: startOfDay,
    });

    return NextResponse.json({ journal }, { status: 201 });
  } catch (error) {
    console.error("POST /api/journals error:", error);
    return NextResponse.json({ error: "Failed to create journal" }, { status: 500 });
  }
}
