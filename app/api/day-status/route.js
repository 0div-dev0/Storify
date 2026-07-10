import connectMongo from "@/lib/dbConfig";
import { DayStatus } from "@/models/DayStatus";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const statuses = await DayStatus.find({ userId: session.user.id }).lean();

    // Return as a map: { "YYYY-MM-DD": "green"|"yellow"|"red" }
    const statusMap = {};
    for (const s of statuses) {
      statusMap[s.date] = s.status;
    }

    return NextResponse.json({ statuses: statusMap }, { status: 200 });
  } catch (error) {
    console.error("GET /api/day-status error:", error);
    return NextResponse.json({ error: "Failed to fetch day statuses" }, { status: 500 });
  }
}
