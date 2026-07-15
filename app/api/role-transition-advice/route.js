import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { currentRoleTitle, targetRoleTitle, missingSkills, matchPercentage } = await request.json();

    if (!currentRoleTitle || !targetRoleTitle) {
      return NextResponse.json({ error: "Missing role parameters" }, { status: 400 });
    }

    const missingNames = (missingSkills || []).map((s) => s.name || s).join(", ");

    const systemPrompt = `You are a Principal Career Coach, Senior Hiring Manager, and Technical Architect.
Your task is to provide personalized, high-impact career transition advice for a candidate transitioning from "${currentRoleTitle}" to "${targetRoleTitle}".

Instructions:
- Provide 4 distinct, highly practical sections:
  1. **🎯 The Core Mental & Architectural Shift**: What is the fundamental change in mindset, scope, or daily workflow between these roles?
  2. **🚀 High-Yield Skills to Prioritize First**: Of the missing skills (${missingNames || "target role tech stack"}), which 2-3 give the highest leverage and immediate interview confidence? Why?
  3. **📄 Resume & Experience Translation Strategy**: How should they reframe their existing "${currentRoleTitle}" achievements to appeal to hiring managers looking for a "${targetRoleTitle}"? Give concrete wording examples.
  4. **⚡ 30-60-90 Day Action Plan**: A clear, actionable roadmap with weekly milestones and capstone project advice.
- Output strictly clean, beautifully formatted Markdown with bold headings and bullet points.`;

    const userPrompt = `I am currently a **${currentRoleTitle}** transitioning to **${targetRoleTitle}**. My current skill match is around **${matchPercentage}%**.
Here are the key skills I need to acquire or level up on: ${missingNames || "Core role requirements"}.
Please give me your personalized expert coaching roadmap and transition advice.`;

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
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.4,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              return NextResponse.json({ success: true, content, source: `OpenRouter (${currentModel})` });
            }
          } else {
            const errText = await response.text();
            console.warn(`OpenRouter advice with model ${currentModel} returned: ${response.status} ${errText}`);
          }
        } catch (err) {
          console.warn(`OpenRouter transition advice Model ${currentModel} failed:`, err.message || err);
        }
      }
    }

    // 2. Try Groq if configured
    if (process.env.GROQ_API_KEY) {
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
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.4,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({ success: true, content, source: "Groq" });
          }
        }
      } catch (err) {
        console.error("Groq transition advice error:", err);
      }
    }

    // 3. Try Gemini API directly if configured
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
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
                  parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }],
                },
              ],
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            return NextResponse.json({ success: true, content, source: "Gemini" });
          }
        }
      } catch (err) {
        console.error("Gemini transition advice error:", err);
      }
    }

    // 4. Fallback: Generate high-quality structured deterministic advice
    const fallbackContent = `### 🎯 The Core Mental & Architectural Shift: ${currentRoleTitle} ➔ ${targetRoleTitle}

Transitioning from **${currentRoleTitle}** to **${targetRoleTitle}** requires elevating your scope from *component-level execution* to *end-to-end system reliability, scalability, and strategic domain alignment*.

* **Scope & Ownership**: While a ${currentRoleTitle} focuses heavily on immediate functional deliverables and code correctness, a **${targetRoleTitle}** evaluates systemic tradeoffs, architectural bottlenecks, long-term maintainability, and cross-team dependencies.
* **Communication & Influence**: You will shift from explaining *how* a specific module was built to articulating *why* an architectural or tooling decision aligns with business metrics, SLA targets, or product roadmaps.
* **Risk Management**: A ${targetRoleTitle} must proactively anticipate edge cases, security vulnerabilities, and scalability walls before they reach production.

---

### 🚀 High-Yield Skills to Prioritize First

To rapidly bridge your **${matchPercentage}% match** and make immediate impact in technical rounds, focus on these top priority skills:

1. **${(missingSkills && missingSkills[0]?.name) || "Core Domain Architecture & System Design"}**
   * **Why it's critical**: This forms the primary hiring bar for ${targetRoleTitle}. Mastery here demonstrates foundational readiness.
   * **Quick Win**: Build a end-to-end proof of concept or containerized demo focusing specifically on scalability and error handling.

2. **${(missingSkills && missingSkills[1]?.name) || "Advanced Tooling & Cloud Infrastructure"}**
   * **Why it's critical**: Modern teams expect immediate proficiency in production deployment workflows and observability.
   * **Quick Win**: Implement an automated CI/CD pipeline deploying a multi-service app with structured logging and metrics.

3. **${(missingSkills && missingSkills[2]?.name) || "Domain Specialization & Performance Optimization"}**
   * **Why it's critical**: Differentiates top 10% candidates from average applicants during deep-dive technical interviews.

---

### 📄 Resume & Experience Translation Strategy

When tailoring your resume for **${targetRoleTitle}** roles, reframe past ${currentRoleTitle} bullet points to emphasize systemic impact:

* **Before (Typical ${currentRoleTitle} phrasing)**:
  > *"Built a user dashboard using JavaScript and SQL with high test coverage."*
* **After (Tailored for ${targetRoleTitle})**:
  > *"Architected and deployed a responsive data analytics portal processing 50k+ daily queries, optimizing SQL execution plans by 40% and introducing automated CI/CD quality gates."*

**Key Translation Rules**:
* Lead with **verbs of ownership** (*Architected, Spearheaded, Engineered, Optimized, Orchestrated*).
* Quantify every achievement with **measurable metrics** (latency reduction %, cost savings $, user throughput +X%).
* Explicitly mention cross-functional collaboration (e.g. *partnered with Product and DevOps to establish zero-downtime releases*).

---

### ⚡ 30-60-90 Day Action Plan

#### **Days 1–30: Foundation & Prereq Immersion**
* **Goal**: Close foundational syntax gaps and establish core tooling fluency.
* **Action**: Complete daily structured exercises in ${(missingSkills && missingSkills[0]?.name) || "your primary target stack"}.
* **Deliverable**: Create a public GitHub repository hosting clean, documented code katas and architectural notes.

#### **Days 31–60: Hands-on Capstone Projects & Integration**
* **Goal**: Build real-world portfolio proof of ${targetRoleTitle} capabilities.
* **Action**: Construct the comprehensive capstone projects recommended in your roadmap (e.g., multi-tier cloud deployments, automated testing suites, or ML APIs).
* **Deliverable**: A fully deployed live project with clear README documentation and architecture diagrams.

#### **Days 61–90: Interview Polish, Certification & Portfolio Defense**
* **Goal**: Achieve mastery and ace technical system design rounds.
* **Action**: Complete targeted industry certifications (e.g. AWS/CKA/TensorFlow) and run weekly mock interview sessions explaining your design decisions out loud.
* **Deliverable**: 3 tailored resume iterations optimized for ATS, and confidence defending your capstone project before senior interviewers.`;

    return NextResponse.json({ success: true, content: fallbackContent, source: "Expert Coach Engine" });
  } catch (error) {
    console.error("Transition Advice Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate transition advice" },
      { status: 500 }
    );
  }
}
