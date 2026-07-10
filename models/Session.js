import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  _id: String, // session ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiresAt: Date,
});

export const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
