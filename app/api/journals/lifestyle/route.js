import connectMongo from "@/lib/dbConfig";
import { Journal } from "@/models/Journal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startDate, endDate, mode, length, theme } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 });
    }

    await connectMongo();

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Query journals within this date range for the logged in user
    const journals = await Journal.find({
      userId: session.user.id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).lean();

    if (!journals || journals.length === 0) {
      return NextResponse.json({ 
        success: false, 
        code: "NO_JOURNALS",
        message: "No journal entries found during this period." 
      });
    }

    // Format the journals for the LLM
    const journalsSummary = journals.map((j, idx) => {
      const dateStr = new Date(j.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      return `Entry #${idx + 1} - Date: ${dateStr}\nTitle: ${j.title || "Untitled"}\nContent:\n${j.plainText || j.content || ""}\n`;
    }).join("\n---\n\n");

    const highlightTheme = theme ? theme.trim() : "general life details";
    const targetLength = length || "medium";

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "story") {
      systemPrompt = "You are a professional creative storyteller. Your goal is to transform a user's daily journal entries into a beautiful, engaging, and cohesive narrative story. Do not make up events that are not in the journals, but weave their experiences, emotions, successes, and challenges into a compelling story. Use rich prose and narrative devices. Do not include metadata, introductory text, or concluding notes—just return the story text. Output in plain text or standard markdown formatting (using headings/paragraphs).";
      userPrompt = `Please write a story based on the following journal entries from the user.
Highlight theme to focus on: "${highlightTheme}".
Target length: "${targetLength}".

Journal entries:
${journalsSummary}`;
    } else {
      systemPrompt = "You are an expert lifestyle coach and performance analyst. Your goal is to review a user's journal entries over a period and provide constructive lifestyle feedback, habit analysis, productivity insights, and psychological encouragement. Highlight successes and suggest specific, positive changes. Do not include metadata, introductory text, or concluding notes—just return the analysis. Output in clean markdown format (using lists, bold text, and subheaders if helpful).";
      userPrompt = `Please analyze the following journal entries from the user and provide lifestyle feedback.
Focus area: "${highlightTheme}".
Target length: "${targetLength}".

Journal entries:
${journalsSummary}`;
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
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
      journalCount: journals.length
    });

  } catch (error) {
    console.error("Lifestyle analysis endpoint error:", error);
    return NextResponse.json({ error: "Failed to generate feedback/story" }, { status: 500 });
  }
}
