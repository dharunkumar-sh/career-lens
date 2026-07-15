import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { type, jobRole, resumeText, coverLetterContext } =
      await request.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "cover-letter") {
      systemPrompt = `You are a professional career coach and expert copywriter.
Write a compelling, professional cover letter based on the following information.

Instructions:
- Format as a standard business letter.
- Highlight matching skills from the resume relevant to the job role.
- Keep it concise (under 400 words).
- Do not use placeholders like [Insert Name] unless absolutely necessary (try to use the resume name if found, otherwise keep generic sign-off).
- Output in Markdown.`;

      userPrompt = `TARGET JOB ROLE: ${jobRole}

CANDIDATE'S RESUME / BACKGROUND:
${resumeText}

ADDITIONAL CONTEXT (Tone, Focus, etc.):
${coverLetterContext || "Professional and enthusiastic"}

Please write a cover letter for this candidate applying to the ${jobRole} position.`;
    } else if (type === "interview-prep") {
      systemPrompt = `You are a senior hiring manager and interviewer.
Generate an Interview Preparation Guide for the given job role.

Instructions:
- Provide 3 likely technical questions specific to the role.
- Provide 3 behavioral questions relevant to typical responsibilities.
- List key soft skills to demonstrate.
- Give one "Star" tip to stand out for this specific position.
- Output in Markdown.`;

      userPrompt = `Generate an Interview Preparation Guide for the role of: ${jobRole}

Please provide:
1. **3 Likely Technical Questions** specific to a ${jobRole}.
2. **3 Behavioral Questions** relevant to this role's typical responsibilities.
3. **Key Soft Skills** to demonstrate for a ${jobRole}.
4. **One "Star" Tip** to stand out for this specific position.`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const FALLBACK_MODELS = [
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-coder:free",
      "poolside/laguna-m.1:free",
      "cohere/north-mini-code:free"
    ];

    let content = null;
    let lastError = null;

    for (const currentModel of FALLBACK_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: userPrompt,
                },
              ],
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || `OpenRouter API request failed: ${response.status}`
          );
        }

        const data = await response.json();
        content = data.choices?.[0]?.message?.content;
        if (content) {
          break; // Success
        }
      } catch (err) {
        lastError = err;
        console.warn(`ai-coach Model ${currentModel} failed:`, err.message || err);
      }
    }

    if (!content) {
      throw lastError || new Error("All fallback models failed");
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("AI Coach API Error:", error);

    let msg = error.message || "Failed to generate content";

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
