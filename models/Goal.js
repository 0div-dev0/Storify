import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    title: { type: String, required: true },
    frequency: { 
      type: String, 
      enum: ["daily", "weekly", "monthly"], 
      default: "daily" 
    },
    // For daily goals, we might want to track which days they apply to or just that they are active
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    // Array of ISO date strings (YYYY-MM-DD) where the goal was confirmed completed
    completedDates: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Index for faster lookups
GoalSchema.index({ userId: 1, frequency: 1 });

export const Goal =
  mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
