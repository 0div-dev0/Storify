import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

function toIsoDate(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

// GET /api/goals — fetch all goals
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    const goalsRef = collection(db, "goals");
    let q = query(goalsRef);
    if (userId) {
      q = query(goalsRef, where("userId", "==", userId));
    }

    const snap = await getDocs(q);
    const goals = [];

    snap.forEach((d) => {
      const data = d.data();
      goals.push({
        _id: d.id,
        id: d.id,
        title: data.title,
        frequency: data.frequency || "daily",
        startDate: toIsoDate(data.startDate),
        endDate: data.endDate ? toIsoDate(data.endDate) : null,
        completedDates: data.completedDates || [],
        createdAt: toIsoDate(data.createdAt),
        updatedAt: toIsoDate(data.updatedAt),
        userId: data.userId || null,
      });
    });

    // Sort by createdAt descending in JavaScript
    goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

// POST /api/goals — create a new goal
export async function POST(req) {
  try {
    const { title, frequency, targetDate, userId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

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

    const now = new Date().toISOString();
    const newGoalData = {
      title,
      frequency: frequency || "daily",
      startDate: startDate.toISOString(),
      completedDates: [],
      createdAt: now,
      updatedAt: now,
      userId: userId || null,
    };

    const docRef = await addDoc(collection(db, "goals"), newGoalData);

    const goal = {
      _id: docRef.id,
      id: docRef.id,
      ...newGoalData,
    };

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("POST /api/goals error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

// DELETE /api/goals?id=... — delete a goal by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const docRef = doc(db, "goals", id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/goals error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
