import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// Helper to normalize any Firestore timestamp or date string to ISO string
function toIsoDate(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

// GET /api/journals — list all journals sorted by date descending
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    const journalsRef = collection(db, "journals");
    let q;

    if (userId) {
      q = query(journalsRef, where("userId", "==", userId));
    } else {
      q = query(journalsRef);
    }

    const snap = await getDocs(q);

    const journals = [];
    snap.forEach((doc) => {
      const data = doc.data();
      journals.push({
        _id: doc.id,
        id: doc.id,
        title: data.title || "Untitled Entry",
        date: toIsoDate(data.date),
        createdAt: toIsoDate(data.createdAt),
        updatedAt: toIsoDate(data.updatedAt),
        plainText: (data.plainText || "").slice(0, 150),
        userId: data.userId || null,
      });
    });

    // Sort by date descending in JavaScript to prevent missing Firestore composite index requirements
    journals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ journals }, { status: 200 });
  } catch (error) {
    console.error("GET /api/journals error:", error);
    return NextResponse.json({ error: "Failed to fetch journals" }, { status: 500 });
  }
}

// POST /api/journals — create a new journal entry
export async function POST(req) {
  try {
    const { title, content, plainText, date, userId } = await req.json();

    if (!content || !date) {
      return NextResponse.json(
        { error: "Content and date are required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startIso = startOfDay.toISOString();
    const endIso = endOfDay.toISOString();

    const journalsRef = collection(db, "journals");

    // Fetch journals to check for same-day duplication
    const snap = await getDocs(journalsRef);
    const existing = snap.docs.find((doc) => {
      const d = doc.data();
      const docDate = toIsoDate(d.date);
      const isSameDate = docDate >= startIso && docDate <= endIso;
      if (userId && d.userId) {
        return isSameDate && d.userId === userId;
      }
      return isSameDate;
    });

    if (existing) {
      return NextResponse.json(
        { error: "A journal entry already exists for this date. Edit it instead." },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newJournalData = {
      title: title || "Untitled Entry",
      content,
      plainText: plainText || "",
      date: startIso,
      userId: userId || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(journalsRef, newJournalData);

    const journal = {
      _id: docRef.id,
      id: docRef.id,
      ...newJournalData,
    };

    return NextResponse.json({ journal }, { status: 201 });
  } catch (error) {
    console.error("POST /api/journals error:", error);
    return NextResponse.json({ error: "Failed to create journal" }, { status: 500 });
  }
}
