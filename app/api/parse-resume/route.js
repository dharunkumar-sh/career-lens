import { NextResponse } from "next/server";

// Lazy-loaded singleton — avoids top-level await crashing the route module
let _pdfjsLib = null;
async function getPdfjsLib() {
  if (!_pdfjsLib) {
    _pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    _pdfjsLib.GlobalWorkerOptions.workerSrc = "";
  }
  return _pdfjsLib;
}


// -----------------------------------------------------------------------
// SYSTEM PROMPT — full resume analysis by AI
// -----------------------------------------------------------------------
const ANALYSIS_SYSTEM_PROMPT = `You are a world-class ATS (Applicant Tracking System) expert and senior technical recruiter with 20+ years of experience across software engineering, data science, product, and design roles.

Your job is to perform a COMPLETE and THOROUGH resume analysis. You must:
1. Extract ALL skills, technologies, tools, frameworks, and methodologies mentioned anywhere in the resume — including inside job descriptions, project bullets, and education sections. Do NOT miss any.
2. Score the resume from 0–100 based on ATS best practices.
3. Suggest highly specific, actionable improvements.
4. Identify genuine strengths.
5. Recommend relevant skills the candidate should add based on their background.
6. Score each category from 0–100 for detailed breakdown (required for pro/enterprise plans).

CRITICAL: Return ONLY a raw JSON object — NO markdown, NO code fences, NO explanation.

Required JSON schema:
{
  "score": <0-100 overall ATS score>,
  "contactInfo": {
    "email": "<email or null>",
    "phone": "<phone or null>",
    "linkedin": "<linkedin url or null>",
    "github": "<github url or null>"
  },
  "skills": {
    "present": ["every single skill, tool, language, framework found anywhere in the resume"],
    "missing": ["6-8 relevant skills the candidate should add based on their domain"]
  },
  "metadata": {
    "wordCount": <number>,
    "pageCount": <number>,
    "sectionsFound": ["list of detected sections e.g. summary, experience, education, skills, projects"],
    "actionVerbCount": <number>,
    "quantifiableCount": <number>,
    "actionVerbsFound": ["up to 15 action verbs used"],
    "quantifiableExamples": ["up to 10 quantifiable achievements found e.g. 40%, $2M, 500 users"]
  },
  "experienceHighlights": ["up to 6 strongest achievement sentences from the resume"],
  "strengths": ["4-6 specific things the candidate did right for ATS"],
  "improvements": ["4-6 highly specific, actionable improvements to boost ATS score"],
  "categoryScores": {
    "Contact & Branding": <0-100>,
    "Work Experience": <0-100>,
    "Education": <0-100>,
    "Technical Skills": <0-100>,
    "Projects & Portfolio": <0-100>,
    "Formatting & Readability": <0-100>,
    "Quantifiable Achievements": <0-100>,
    "Keywords & ATS Alignment": <0-100>
  }
}`;

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan") || "free"; // free | pro | enterprise

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // 1. Extract text using pdfjs-dist (legacy/Node.js build)
    // -----------------------------------------------------------------------
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let extractedText = "";
    let totalPages = 1;

    try {
      const pdfjsLib = await getPdfjsLib();
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
      const pdfDoc = await loadingTask.promise;
      totalPages = pdfDoc.numPages;

      const textParts = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        if (pageText.trim()) textParts.push(pageText);
      }
      extractedText = textParts.join("\n\n");
      console.log(`pdfjs: extracted ${extractedText.length} chars from ${totalPages} page(s)`);
    } catch (pdfErr) {
      console.error("pdfjs extraction failed:", pdfErr);
      return NextResponse.json(
        { error: "Could not extract text from this PDF. The file may be scanned or image-based." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 30) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from this PDF." },
        { status: 400 }
      );
    }


    // -----------------------------------------------------------------------
    // 2. Full AI-Powered Analysis via google/gemma-4-31b-it:free (OpenRouter)
    //    All plans get AI analysis; category scores included for all.
    // -----------------------------------------------------------------------
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 },
      );
    }

    const isHighTier = plan === "pro" || plan === "enterprise";

    const userMessage = `Plan: ${plan}

Resume text (analyse COMPLETELY — extract every skill, tool, framework, technology mentioned):
"""
${extractedText.substring(0, 8000)}
"""

Total pages: ${totalPages}

${
  isHighTier
    ? "This is a PRO/ENTERPRISE analysis. Be thorough, detailed, and include all 8 categoryScores."
    : "Provide a standard analysis. Still extract all skills completely and include categoryScores."
}`;

    let aiResult = null;

    try {
      const openRouterResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://career-lens-guide.web.app",
            "X-Title": "Career Lens Resume Analyzer",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            messages: [
              { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
            temperature: 0.1,
            max_tokens: 3000,
          }),
        },
      );

      if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text();
        console.error("OpenRouter error:", openRouterResponse.status, errText);
        throw new Error("AI analysis failed");
      }

      const orData = await openRouterResponse.json();
      let rawContent = orData.choices?.[0]?.message?.content || "";

      // Strip markdown code fences if present
      rawContent = rawContent
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      // Extract JSON from the response (handles cases where model adds text before/after)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rawContent = jsonMatch[0];
      }

      aiResult = JSON.parse(rawContent);
    } catch (aiErr) {
      console.error("AI analysis error:", aiErr);
      return NextResponse.json(
        {
          error:
            "Failed to analyze resume with Career Lens AI. Please try again.",
        },
        { status: 502 },
      );
    }

    // -----------------------------------------------------------------------
    // 3. Validate & normalize AI response
    // -----------------------------------------------------------------------
    const score = Math.min(100, Math.max(0, Number(aiResult.score) || 0));
    const contactInfo = {
      email: aiResult.contactInfo?.email || null,
      phone: aiResult.contactInfo?.phone || null,
      linkedin: aiResult.contactInfo?.linkedin || null,
      github: aiResult.contactInfo?.github || null,
    };
    const presentSkills = Array.isArray(aiResult.skills?.present)
      ? aiResult.skills.present
      : [];
    const missingSkills = Array.isArray(aiResult.skills?.missing)
      ? aiResult.skills.missing
      : [];
    const metadata = {
      pageCount: totalPages,
      wordCount:
        aiResult.metadata?.wordCount ||
        extractedText.split(/\s+/).filter(Boolean).length,
      sectionsFound: Array.isArray(aiResult.metadata?.sectionsFound)
        ? aiResult.metadata.sectionsFound
        : [],
      actionVerbCount: aiResult.metadata?.actionVerbCount || 0,
      quantifiableCount: aiResult.metadata?.quantifiableCount || 0,
      actionVerbsFound: Array.isArray(aiResult.metadata?.actionVerbsFound)
        ? aiResult.metadata.actionVerbsFound
        : [],
      quantifiableExamples: Array.isArray(
        aiResult.metadata?.quantifiableExamples,
      )
        ? aiResult.metadata.quantifiableExamples
        : [],
    };
    const experienceHighlights = Array.isArray(aiResult.experienceHighlights)
      ? aiResult.experienceHighlights
      : [];
    const strengths = Array.isArray(aiResult.strengths)
      ? aiResult.strengths
      : ["Good structure detected"];
    const improvements = Array.isArray(aiResult.improvements)
      ? aiResult.improvements
      : ["Add more quantifiable achievements"];
    const categoryScores =
      aiResult.categoryScores && typeof aiResult.categoryScores === "object"
        ? aiResult.categoryScores
        : null;

    // -----------------------------------------------------------------------
    // 4. Return unified response
    // -----------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      plan,
      score,
      contactInfo,
      skills: { present: presentSkills, missing: missingSkills },
      metadata,
      experienceHighlights,
      strengths,
      improvements,
      ...(categoryScores ? { categoryScores } : {}),
      extractedText:
        extractedText.substring(0, 2000) +
        (extractedText.length > 2000 ? "..." : ""),
      fullTextLength: extractedText.length,
    });
  } catch (error) {
    console.error("parse-resume error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse resume" },
      { status: 500 },
    );
  }
}
