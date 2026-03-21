import { NextResponse } from "next/server";
import { getDocumentProxy } from "unpdf";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let extractedText = "";
    let totalPages = 0;

    try {
      const pdf = await getDocumentProxy(uint8Array);
      totalPages = pdf.numPages;
      const textParts = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Better line detection by vertical position
        let lastY = -1;
        let pageLines = [];
        let currentLine = "";

        // Sort items by Y (descending) then X (ascending) to handle reading order
        const items = [...textContent.items].sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 2) return yDiff; // Significant Y difference
          return a.transform[4] - b.transform[4]; // Small Y difference, sort by X
        });

        for (const item of items) {
          if (!item.str || !item.str.trim()) continue;
          
          const y = item.transform[5];
          if (lastY !== -1 && Math.abs(y - lastY) > 5) {
            pageLines.push(currentLine.trim());
            currentLine = "";
          }
          currentLine += item.str + " ";
          lastY = y;
        }
        if (currentLine) pageLines.push(currentLine.trim());
        
        const pageText = pageLines.filter(l => l.length > 0).join("\n");
        if (pageText.trim()) textParts.push(pageText);
      }
      extractedText = textParts.join("\n\n");
      console.log(`Extracted ${extractedText.length} characters from ${totalPages} pages`);
    } catch (pdfError) {
      console.error("PDF extraction failed:", pdfError);
      throw new Error("Could not extract text from this PDF. The file may be scanned or corrupted.");
    }

    extractedText = String(extractedText || "");

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from this PDF." },
        { status: 400 }
      );
    }

    // 1. Deterministic Parsing
    const analysis = analyzeResumeDeterministically(extractedText, totalPages);

    // 2. Groq Integration for Suggestions
    let improvements = analysis.improvements;
    let strengths = analysis.strengths;
    let missingSkills = analysis.skills.missing;

    if (process.env.GROQ_API_KEY) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are an expert ATS (Applicant Tracking System) optimization algorithm. You analyze the resume text and the deterministically detected metadata, and generate strictly actionable improvement suggestions, strengths, and missing skills to elevate the candidate's ATS score.
CRITICAL INSTRUCTION: Return ONLY a raw JSON object with NO markdown wrapping, matching this exact schema:
{
  "improvements": ["highly specific improvement to boost ATS score", "another tip"],
  "strengths": ["what they did right for ATS", "another strength"],
  "missingSkills": ["relevant skill 1", "relevant skill 2", "relevant skill 3"]
}`
              },
              {
                role: "user",
                content: `Current ATS Score: ${analysis.score}/100
Present Skills: ${analysis.skills.present.join(", ")}
Sections Detected: ${analysis.metadata.sectionsFound.join(", ")}
Quantifiable Metrics Found: ${analysis.metadata.quantifiableCount}
Word Count: ${analysis.metadata.wordCount}

Resume Text Context:
${extractedText.substring(0, 4000)}`
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
          })
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const groqResult = JSON.parse(groqData.choices[0].message.content);
          
          if (groqResult.improvements && Array.isArray(groqResult.improvements) && groqResult.improvements.length > 0) {
            improvements = groqResult.improvements;
          }
          if (groqResult.strengths && Array.isArray(groqResult.strengths) && groqResult.strengths.length > 0) {
            strengths = groqResult.strengths;
          }
          if (groqResult.missingSkills && Array.isArray(groqResult.missingSkills) && groqResult.missingSkills.length > 0) {
            missingSkills = groqResult.missingSkills;
          }
        } else {
          console.error("Groq API returned an error status:", groqResponse.status, await groqResponse.text());
        }
      } catch (err) {
        console.error("Groq API error, falling back to local generated suggestions:", err);
      }
    } else {
      console.warn("GROQ_API_KEY not set. Using local deterministic suggestions instead.");
    }

    return NextResponse.json({
      success: true,
      score: analysis.score,
      contactInfo: analysis.contactInfo,
      skills: {
        present: analysis.skills.present,
        missing: missingSkills,
      },
      metadata: analysis.metadata,
      experienceHighlights: analysis.experienceHighlights,
      strengths,
      improvements,
      extractedText: extractedText.substring(0, 2000) + (extractedText.length > 2000 ? "..." : ""),
      fullTextLength: extractedText.length,
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse PDF" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// DETERMINISTIC PARSING ENGINE
// ----------------------------------------------------------------------

function analyzeResumeDeterministically(text, pageCount) {
  const normalizedText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  const contactInfoRaw = extractContactInfo(text);
  
  const contactInfo = {
    email: contactInfoRaw.emails[0] || null,
    phone: contactInfoRaw.phones[0] || null,
    linkedin: contactInfoRaw.linkedin[0] || null,
    github: contactInfoRaw.github[0] || null,
  };

  const skillsData = extractSkills(normalizedText);
  const allFoundSkills = Object.values(skillsData).flat();

  const actionVerbsData = countActionVerbs(normalizedText);
  const actionVerbsFound = actionVerbsData.map((v) => v.verb);

  const sections = detectSections(normalizedText);
  const sectionsFound = Object.entries(sections).filter(([_, found]) => found).map(([name]) => name);

  const quantifiableData = findQuantifiables(text);
  const experienceHighlights = extractExperienceHighlights(text);
  
  const score = calculateScore(allFoundSkills, actionVerbsFound, sectionsFound, contactInfoRaw, wordCount, quantifiableData.length);
  const { strengths, improvements } = generateFallbackFeedback(allFoundSkills, sectionsFound, contactInfoRaw, actionVerbsFound.length, quantifiableData.length);
  const missingSkillsLocal = getRecommendedSkillsLocal(normalizedText);

  return {
    score,
    contactInfo,
    skills: {
      present: allFoundSkills,
      missing: missingSkillsLocal,
    },
    metadata: {
      pageCount,
      wordCount,
      actionVerbCount: actionVerbsFound.length,
      quantifiableCount: quantifiableData.length,
      sectionsFound,
      actionVerbsFound: actionVerbsFound.slice(0, 15),
      quantifiableExamples: quantifiableData.slice(0, 10),
    },
    experienceHighlights,
    strengths,
    improvements
  };
}

// Name extraction removed per user request

function extractExperienceHighlights(text) {
  const highlights = [];
  const sentences = text.split(/[.!?\n]+/);
  const impactPatterns = [/(?:increased|decreased|improved|reduced|grew|saved|generated|delivered|achieved)[\s\w]*\d+%/i, /\$[\d,]+/, /\d+\s*(?:years|months|users|clients|projects)/i];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 30 && trimmed.length < 250) {
      if (impactPatterns.some(p => p.test(trimmed))) highlights.push(trimmed.replace(/^[•\-–—*|►▪]+\s*/, ""));
    }
  }
  return [...new Set(highlights)].slice(0, 6);
}

function findQuantifiables(text) {
  const patterns = [/\d+(?:\.\d+)?%/g, /\$[\d,]+(?:\.\d{2})?(?:[kKmMbB])?/g, /\b\d+\+?\s*(?:users|clients|customers|projects|servers|nodes|years|months|people)\b/gi];
  const found = [];
  for (const p of patterns) {
    const matches = text.match(p) || [];
    found.push(...matches);
  }
  return [...new Set(found)];
}

function getRecommendedSkillsLocal(text) {
  const techMap = [
    {
      core: /\b(?:react|angular|vue|next\.js|frontend|html|css)\b/i,
      recs: ["TypeScript", "Tailwind CSS", "Redux", "GraphQL", "Jest", "Webpack"]
    },
    {
      core: /\b(?:node\.?js|express|backend|api|fastapi|django)\b/i,
      recs: ["MongoDB", "PostgreSQL", "Redis", "Microservices", "Docker", "REST APIs"]
    },
    {
      core: /\b(?:python|machine learning|data|pandas|numpy|tensorflow|pytorch)\b/i,
      recs: ["scikit-learn", "SQL", "Apache Spark", "Airflow", "MLOps", "AWS"]
    },
    {
      core: /\b(?:java|spring|c\+\+|c#|\.net)\b/i,
      recs: ["Kubernetes", "Kafka", "Jenkins", "Azure", "CI/CD", "Hibernate"]
    },
    {
      core: /\b(?:aws|azure|gcp|docker|kubernetes|devops|cloud|terraform)\b/i,
      recs: ["Terraform", "Ansible", "Prometheus", "Grafana", "Linux", "GitLab CI"]
    },
    {
      core: /\b(?:sql|mysql|postgresql|mongodb|database)\b/i,
      recs: ["NoSQL", "Elasticsearch", "Data Modeling", "ETL", "Tableau", "Snowflake"]
    },
    {
      core: /\b(?:mobile|ios|android|flutter|react native|swift|kotlin)\b/i,
      recs: ["Firebase", "SQLite", "App Store Deployment", "CI/CD", "GraphQL", "UI/UX"]
    }
  ];

  let recommendations = new Set();
  const lowerText = text.toLowerCase();
  
  // Cross-reference user's raw text with tech ecosystem groups
  for (const eco of techMap) {
    if (eco.core.test(lowerText)) {
      eco.recs.forEach(r => recommendations.add(r));
    }
  }

  // Fallback map if the user brings an empty/non-technical resume
  if (recommendations.size === 0) {
    ["Cloud Computing", "CI/CD", "Docker", "Agile Methodologies", "Git/Version Control", "Test-Driven Development"].forEach(r => recommendations.add(r));
  }

  // Filter out any skills the user already possesses
  const finalRecs = Array.from(recommendations).filter(r => !lowerText.includes(r.toLowerCase()));

  // Pad the array with standard popular skills if our cross-referencing came up notoriously short
  if (finalRecs.length < 5) {
    const pop = ["React", "Node.js", "TypeScript", "AWS", "Docker", "Kubernetes", "PostgreSQL", "CI/CD", "Agile"];
    pop.filter(p => !lowerText.includes(p.toLowerCase())).forEach(p => finalRecs.push(p));
  }

  // Deduplicate, shuffle for dynamic feeling, and return top 6
  return [...new Set(finalRecs)].sort(() => 0.5 - Math.random()).slice(0, 6);
}

function extractContactInfo(text) {
  const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/gi) || [];
  const phones = text.match(/(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}[-.\s]?\d{0,4}/g) || [];
  const linkedin = text.match(/(?:linkedin\.com\/in\/|linkedin:?\s*)[\w-]+/gi) || [];
  const github = text.match(/(?:github\.com\/|github:?\s*)[\w-]+/gi) || [];
  return {
    emails: [...new Set(emails)],
    phones: [...new Set(phones)].filter(p => p.length >= 10),
    linkedin: [...new Set(linkedin)],
    github: [...new Set(github)],
  };
}

function extractSkills(text) {
  const cat = {
    programming: ["javascript", "typescript", "python", "java", "c\\+\\+", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "sql", "html", "css", "bash"],
    frameworks: ["react", "angular", "vue", "next\\.?js", "node\\.?js", "express", "django", "flask", "fastapi", "spring", "laravel", ".net", "flutter", "react native", "tailwind"],
    databases: ["mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "sqlite", "dynamodb", "firebase"],
    cloud: ["aws", "azure", "google cloud", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "github actions", "gitlab"],
    tools: ["git", "github", "jira", "figma", "vs code", "postman", "webpack", "npm", "yarn", "linux"]
  };
  const found = {};
  for (const [k, v] of Object.entries(cat)) {
    found[k] = [];
    for (const s of v) {
      const regex = new RegExp(`\\b${s}\\b`, "gi");
      const match = text.match(regex);
      if (match) found[k].push(match[0].toLowerCase());
    }
    found[k] = [...new Set(found[k])];
  }
  return found;
}

function countActionVerbs(text) {
  const verbs = ["achieved", "developed", "managed", "created", "led", "improved", "designed", "implemented", "reduced", "spearheaded", "orchestrated", "engineered", "optimized", "increased", "delivered"];
  const found = [];
  for (const v of verbs) {
    const rx = new RegExp(`\\b${v}\\b`, "gi");
    const m = text.match(rx);
    if (m) found.push({ verb: v, count: m.length });
  }
  return found.sort((a,b)=>b.count - a.count);
}

function detectSections(text) {
  return {
    summary: /(?:summary|objective|profile|about\s*me)/i.test(text),
    experience: /(?:experience|employment|work\s*history|professional\s*experience)/i.test(text),
    education: /(?:education|academic|qualifications|degree)/i.test(text),
    skills: /(?:skills|technical\s*skills|competencies|expertise)/i.test(text),
    projects: /(?:projects|portfolio|personal\s*projects)/i.test(text),
  };
}

function calculateScore(skills, actionVerbs, sections, contactInfo, wordCount, quantCount) {
  let score = 0;
  if (contactInfo.emails?.length) score += 5;
  if (contactInfo.phones?.length) score += 3;
  if (contactInfo.linkedin?.length) score += 2;
  
  score += Math.min(25, skills.length * 2);
  score += Math.min(15, actionVerbs.length * 1.5);
  
  ["experience", "education", "skills"].forEach(s => { if (sections.includes(s)) score += 5; });
  ["summary", "projects"].forEach(s => { if (sections.includes(s)) score += 2.5; });
  
  if (wordCount >= 250) score += 5;
  if (wordCount >= 400) score += 5;
  
  score += Math.min(20, quantCount * 2.5); // 20 max for quantifiables
  return Math.min(100, Math.round(score));
}

function generateFallbackFeedback(skills, sections, contactInfo, verbCount, quantCount) {
  const strengths = [];
  const improvements = [];
  
  if (skills.length >= 8) strengths.push("Strong variety of technical skills detected");
  else improvements.push("Consider explicitly listing more technical/soft skills");
  
  if (sections.includes("experience") && sections.includes("education")) strengths.push("Core essential sections (Experience, Education) are present");
  else improvements.push("Missing core sections like Experience or Education");
  
  if (verbCount >= 5) strengths.push("Good usage of impactful action verbs");
  else improvements.push("Start bullet points with strong action verbs (e.g. 'Engineered', 'Orchestrated')");
  
  if (quantCount >= 3) strengths.push("Demonstrated impact with quantifiable metrics");
  else improvements.push("Include more measurable metrics (%, $, numbers) to prove impact");
  
  return { strengths, improvements };
}
