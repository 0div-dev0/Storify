import mongoose from "mongoose";

const DayStatusSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    // ISO date string YYYY-MM-DD
    date: { type: String, required: true },
    // 'green' | 'yellow' | 'red'
    status: { type: String, enum: ["green", "yellow", "red"], required: true },
  },
  { timestamps: true }
);

// One status record per user per date
DayStatusSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DayStatus =
  mongoose.models.DayStatus || mongoose.model("DayStatus", DayStatusSchema);
