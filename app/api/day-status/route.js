import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    const statusRef = collection(db, "dayStatuses");
    let q = query(statusRef);
    if (userId) {
      q = query(statusRef, where("userId", "==", userId));
    }

    const snap = await getDocs(q);
    const statusMap = {};

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.date && data.status) {
        statusMap[data.date] = data.status;
      }
    });

    return NextResponse.json({ statuses: statusMap }, { status: 200 });
  } catch (error) {
    console.error("GET /api/day-status error:", error);
    return NextResponse.json({ error: "Failed to fetch day statuses" }, { status: 500 });
  }
}
