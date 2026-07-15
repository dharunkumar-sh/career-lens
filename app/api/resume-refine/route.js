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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://career-lens-guide.web.app",
        "X-Title": "Career Lens Resume Refiner"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
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
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter resume-refine error:", response.status, errText);
      return NextResponse.json(
        { error: "AI model failed to refine resume. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    let refinedResume = data.choices?.[0]?.message?.content || "";

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
