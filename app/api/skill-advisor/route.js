import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert Technical Architect, Developer Advocate, and Career Advisor.
Given a list of missing technical skills, generate detailed, structured learning metadata for each skill.

For each skill, you must return a JSON object with:
1. "id": A unique URL-safe string identifier (lowercase kebab-case, e.g., "next_js").
2. "name": The exact name of the skill.
3. "difficulty": One of "Beginner", "Intermediate", or "Advanced".
4. "estimatedHours": A realistic estimate of hours needed to achieve coding familiarity (between 10 and 100).
5. "importance": One of "Critical", "High", or "Medium".
6. "prerequisites": An array of other skill names or concepts that should be studied first, or an empty array.
7. "suggestedProject": A highly specific, practical sandbox or capstone project description that applies this skill in practice. Make it specific and portfolio-ready.
8. "learningResources": An array of 2-3 specific official guides, documentation websites, or high-quality tutorials.
9. "certification": A widely recognized professional certification for this skill (e.g. "AWS Certified Developer", "CKA"), or null if none is standard.
10. "category": One of "LANGUAGES", "FRAMEWORKS", "CLOUD_DEVOPS", "DATA_AI", "ARCHITECTURE", "SECURITY_QA", "PROCESS_SOFT".

Return ONLY a raw JSON array containing these objects. Do NOT include markdown code fences, do NOT include comments or extra text.`;

export async function POST(request) {
  try {
    const { missingSkills } = await request.json();

    if (!missingSkills || !Array.isArray(missingSkills) || missingSkills.length === 0) {
      return NextResponse.json({ success: true, skills: [] });
    }

    const userPrompt = `Generate learning roadmaps, resources, and specific projects for these missing skills:
${JSON.stringify(missingSkills)}

Return the results as a JSON array of objects with keys: id, name, difficulty, estimatedHours, importance, prerequisites, suggestedProject, learningResources, certification, category.`;

    let adviceResult = null;

    // 1. Try OpenRouter if configured
    if (process.env.OPENROUTER_API_KEY) {
      const FALLBACK_MODELS = [
        "google/gemma-4-31b-it:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-coder:free",
        "poolside/laguna-m.1:free",
        "cohere/north-mini-code:free"
      ];

      for (const currentModel of FALLBACK_MODELS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.1,
              max_tokens: 3000,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content || "";
            content = content
              .replace(/^```(?:json)?\s*/i, "")
              .replace(/```\s*$/i, "")
              .trim();
            const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
              content = jsonMatch[0];
            }
            adviceResult = JSON.parse(content);
            break;
          }
        } catch (err) {
          console.warn(`OpenRouter model ${currentModel} failed in skill advisor:`, err.message || err);
        }
      }
    }

    // 2. Try Groq if configured
    if (!adviceResult && process.env.GROQ_API_KEY) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.choices?.[0]?.message?.content || "";
          content = content
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            content = jsonMatch[0];
          }
          adviceResult = JSON.parse(content);
        }
      } catch (err) {
        console.error("Groq skill advisor error:", err);
      }
    }

    // 3. Try Gemini API directly if configured
    if (!adviceResult && (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)) {
      try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request: ${userPrompt}` }],
                },
              ],
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          let content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          content = content
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            content = jsonMatch[0];
          }
          adviceResult = JSON.parse(content);
        }
      } catch (err) {
        console.error("Gemini skill advisor error:", err);
      }
    }

    // 4. Fallback: Parse dynamically using a deterministic mapper
    if (!adviceResult) {
      // Return mapping logic directly as fallback JSON array
      adviceResult = missingSkills.map((name) => {
        const query = name.toLowerCase().trim();
        let category = "FRAMEWORKS";
        if (["aws", "docker", "kubernetes", "devops", "cloud", "sre"].some(kw => query.includes(kw))) category = "CLOUD_DEVOPS";
        else if (["python", "javascript", "typescript", "java", "sql", "golang"].some(kw => query.includes(kw))) category = "LANGUAGES";
        else if (["ai", "ml", "tensorflow", "pytorch", "llm", "data"].some(kw => query.includes(kw))) category = "DATA_AI";

        return {
          id: query.replace(/[^a-z0-9]/g, "_"),
          name,
          difficulty: "Intermediate",
          estimatedHours: 35,
          importance: "High",
          prerequisites: [],
          suggestedProject: `Design and build a fully functional integration project using ${name}.`,
          learningResources: [
            `Official documentation for ${name}`,
            `Popular open-source tutorials for ${name}`
          ],
          certification: null,
          category,
        };
      });
    }

    return NextResponse.json({ success: true, skills: adviceResult });
  } catch (error) {
    console.error("Skill advisor API error:", error);
    return NextResponse.json({ error: "Failed to generate dynamic skills data" }, { status: 500 });
  }
}
