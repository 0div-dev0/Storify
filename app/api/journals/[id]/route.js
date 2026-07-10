import connectMongo from "@/lib/dbConfig";
import { Journal } from "@/models/Journal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET /api/journals/[id] — get a single journal with full content
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { id } = await params;

    const journal = await Journal.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json({ journal }, { status: 200 });
  } catch (error) {
    console.error("GET /api/journals/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

// PUT /api/journals/[id] — update a journal (keeps original date)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, plainText } = await req.json();
    const { id } = await params;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await connectMongo();

    const journal = await Journal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { title, content, plainText: plainText || "" },
      { new: true }
    );

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json({ journal }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/journals/[id] error:", error);
    return NextResponse.json({ error: "Failed to update journal" }, { status: 500 });
  }
}

// DELETE /api/journals/[id]
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { id } = await params;

    const journal = await Journal.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Journal deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/journals/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete journal" }, { status: 500 });
  }
}
