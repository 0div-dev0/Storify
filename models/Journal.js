import mongoose from "mongoose";

const JournalSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    title: { type: String, default: "Untitled Entry" },
    content: { type: String, required: true }, // HTML from Tiptap
    plainText: { type: String, default: "" },   // Plain text for previews
    date: { type: Date, required: true },       // The journal date the user chose
  },
  { timestamps: true } // createdAt = first save, updatedAt = last edit
);

// Compound index: one journal per user per date
JournalSchema.index({ userId: 1, date: 1 });

export const Journal =
  mongoose.models.Journal || mongoose.model("Journal", JournalSchema);
