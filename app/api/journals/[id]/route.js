import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

function toIsoDate(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

// GET /api/journals/[id] — get a single journal with full content
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const docRef = doc(db, "journals", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    const data = snap.data();
    const journal = {
      _id: snap.id,
      id: snap.id,
      ...data,
      date: toIsoDate(data.date),
      createdAt: toIsoDate(data.createdAt),
      updatedAt: toIsoDate(data.updatedAt),
    };

    return NextResponse.json({ journal }, { status: 200 });
  } catch (error) {
    console.error("GET /api/journals/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

// PUT /api/journals/[id] — update a journal entry
export async function PUT(req, { params }) {
  try {
    const { title, content, plainText } = await req.json();
    const { id } = await params;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const docRef = doc(db, "journals", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updateData = {
      title: title !== undefined ? title : (snap.data().title || "Untitled Entry"),
      content,
      plainText: plainText || "",
      updatedAt: now,
    };

    await updateDoc(docRef, updateData);

    const updatedJournal = {
      _id: id,
      id: id,
      ...snap.data(),
      ...updateData,
      date: toIsoDate(snap.data().date),
      createdAt: toIsoDate(snap.data().createdAt),
    };

    return NextResponse.json({ journal: updatedJournal }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/journals/[id] error:", error);
    return NextResponse.json({ error: "Failed to update journal" }, { status: 500 });
  }
}

// DELETE /api/journals/[id] — delete a journal entry
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const docRef = doc(db, "journals", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    await deleteDoc(docRef);

    return NextResponse.json({ message: "Journal deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/journals/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete journal" }, { status: 500 });
  }
}
