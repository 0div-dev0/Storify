import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

function toIsoDate(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

export async function POST(req) {
  try {
    const { startDate, endDate, mode, length, theme, userId } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const journalsRef = collection(db, "journals");
    const snap = await getDocs(journalsRef);

    const journals = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const docDate = toIsoDate(d.date);
      if (docDate >= startIso && docDate <= endIso) {
        if (!userId || !d.userId || d.userId === userId) {
          journals.push({
            id: doc.id,
            title: d.title || "Untitled",
            content: d.content || "",
            plainText: d.plainText || "",
            date: docDate,
          });
        }
      }
    });

    // Sort chronologically ascending for story / timeline synthesis
    journals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (journals.length === 0) {
      return NextResponse.json({
        success: false,
        code: "NO_JOURNALS",
        message: "No journal entries found during this period.",
      });
    }

    // Format the journals for the LLM
    const journalsSummary = journals
      .map((j, idx) => {
        const dateStr = new Date(j.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return `Entry #${idx + 1} - Date: ${dateStr}\nTitle: ${j.title}\nContent:\n${
          j.plainText || j.content
        }\n`;
      })
      .join("\n---\n\n");

    const highlightTheme = theme ? theme.trim() : "general life details";
    const targetLength = length || "medium";

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "story") {
      systemPrompt =
        "You are a professional creative storyteller. Your goal is to transform a user's daily journal entries into a beautiful, engaging, and cohesive narrative story. Do not make up events that are not in the journals, but weave their experiences, emotions, successes, and challenges into a compelling story. Use rich prose and narrative devices. Do not include metadata, introductory text, or concluding notes—just return the story text. Output in plain text or standard markdown formatting (using headings/paragraphs).";
      userPrompt = `Please write a story based on the following journal entries from the user.
Highlight theme to focus on: "${highlightTheme}".
Target length: "${targetLength}".

Journal entries:
${journalsSummary}`;
    } else {
      systemPrompt =
        "You are an expert lifestyle coach and performance analyst. Your goal is to review a user's journal entries over a period and provide constructive lifestyle feedback, habit analysis, productivity insights, and psychological encouragement. Highlight successes and suggest specific, positive changes. Do not include metadata, introductory text, or concluding notes—just return the analysis. Output in clean markdown format (using lists, bold text, and subheaders if helpful).";
      userPrompt = `Please analyze the following journal entries from the user and provide lifestyle feedback.
Focus area: "${highlightTheme}".
Target length: "${targetLength}".

Journal entries:
${journalsSummary}`;
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 4000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error response:", errorText);
      throw new Error(`OpenRouter returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "No output generated.";

    return NextResponse.json({
      success: true,
      result: resultText,
      journalCount: journals.length,
    });
  } catch (error) {
    console.error("Lifestyle analysis endpoint error:", error);
    return NextResponse.json({ error: "Failed to generate feedback/story" }, { status: 500 });
  }
}
