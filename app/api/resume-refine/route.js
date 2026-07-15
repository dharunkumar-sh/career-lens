import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) Resume Writer & Career Coach.
Your goal is to rewrite the user's resume to be highly optimized for ATS software while maintaining readability for human recruiters.

Guidelines:
1. **Structure**: Use a clean, standard layout structure (Header, Summary, Experience, Skills, Education).
2. **Keywords**: Naturally integrate the missing skills and keywords relevant to the target role.
3. **Action Verbs**: Start bullet points with strong power verbs (e.g., "Orchestrated", "Engineered", "Reduced").
4. **Metrics**: Emphasize quantifiable achievements (numbers, %, $) where possible. If exact numbers are missing in the source, phrase it to highlight impact (e.g. "Resulting in significant efficiency gains").
5. **Clarity**: Remove buzzwords, fluff, and subjective statements (e.g., "Hard worker").
6. **Formatting**: Output in clean Markdown format that serves as a text-based resume.

Input provided will include:
- Current Resume Text
- Analysis of missing skills
- Target Job Role (optional)

Output Format:
Return ONLY the rewritten styled resume in Markdown.
Do not include conversational filler like "Here is your resume".
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { currentResumeText, analysisResults, targetRole } = body;

    if (!currentResumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    const missingSkills =
      analysisResults?.skills?.missing?.join(", ") || "None detected";
    const improvements =
      analysisResults?.improvements?.join("\n- ") || "None detected";

    const userPrompt = `
Target Role: ${targetRole || "General Role based on experience"}

Context from automated analysis:
- Identified Missing Skills to Integrate: ${missingSkills}
- Key Improvements Needed:
- ${improvements}

Original Resume Text:
"""
${currentResumeText}
"""

Instructions:
Rewrite this resume to be ATS-friendly. 
- Improve the Professional Summary to be catchy and relevant.
- Rewrite bullet points to be impact-driven.
- Ensure the "Skills" section is comprehensive and includes the missing skills if they fit the candidate's background context.
- Fix any grammar or clarity issues.
`;

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const FALLBACK_MODELS = [
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-coder:free",
      "poolside/laguna-m.1:free",
      "cohere/north-mini-code:free"
    ];

    let refinedResume = null;
    let lastError = null;

    for (const currentModel of FALLBACK_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT
              },
              {
                role: "user",
                content: userPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 4096,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter resume-refine failed: ${response.status} ${errText}`);
        }

        const data = await response.json();
        refinedResume = data.choices?.[0]?.message?.content || "";
        if (refinedResume) {
          break; // Success
        }
      } catch (err) {
        lastError = err;
        console.warn(`resume-refine Model ${currentModel} failed:`, err.message || err);
      }
    }

    if (!refinedResume) {
      throw lastError || new Error("All fallback models failed");
    }

    // Strip any accidental markdown code fences
    refinedResume = refinedResume.replace(/^```(?:markdown)?\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!refinedResume) {
      return NextResponse.json(
        { error: "No content returned from the AI model." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, refinedResume });
  } catch (error) {
    console.error("Resume Refine API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine resume" },
      { status: 500 }
    );
  }
}
