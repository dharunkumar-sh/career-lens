import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { currentResumeText, analysisResults, targetRole } = body;

    if (!currentResumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }],
        },
      ],
    });

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ success: true, refinedResume: text });
  } catch (error) {
    console.error("Resume Refine API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine resume" },
      { status: 500 }
    );
  }
}
