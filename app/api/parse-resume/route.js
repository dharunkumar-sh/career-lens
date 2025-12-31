import { NextResponse } from "next/server";
import { getDocumentProxy } from "unpdf";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      );
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text using unpdf - use getDocumentProxy for reliable extraction
    let extractedText = "";
    let totalPages = 0;

    try {
      const pdf = await getDocumentProxy(uint8Array);
      totalPages = pdf.numPages;
      const textParts = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Extract text from items, handling different item types
        const pageText = textContent.items
          .filter((item) => item.str && item.str.trim())
          .map((item) => item.str)
          .join(" ");

        if (pageText.trim()) {
          textParts.push(pageText);
        }
      }

      extractedText = textParts.join("\n\n");

      // Log for debugging
      console.log(
        `Extracted ${extractedText.length} characters from ${totalPages} pages`
      );
    } catch (pdfError) {
      console.error("PDF extraction failed:", pdfError);
      throw new Error(
        "Could not extract text from this PDF. The file may be scanned, image-based, or corrupted."
      );
    }

    // Ensure extractedText is always a string
    extractedText = String(extractedText || "");

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract meaningful text from this PDF. It may be a scanned document or image-based PDF.",
        },
        { status: 400 }
      );
    }

    // Analyze the resume
    const analysis = analyzeResume(extractedText, totalPages);

    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse PDF" },
      { status: 500 }
    );
  }
}

function analyzeResume(text, pageCount) {
  const normalizedText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  // Extract contact information
  const contactInfo = extractContactInfo(text);

  // Extract and categorize skills
  const skillsData = extractSkills(normalizedText);
  const allFoundSkills = Object.values(skillsData).flat();

  // Count action verbs
  const actionVerbsData = countActionVerbs(normalizedText);
  const actionVerbsFound = actionVerbsData.map((v) => v.verb);

  // Detect sections
  const sections = detectSections(normalizedText);
  const sectionsFound = Object.entries(sections)
    .filter(([_, found]) => found)
    .map(([name]) => name);

  // Find quantifiable achievements
  const quantifiableData = findQuantifiables(text);

  // Extract education
  const education = extractEducation(text);

  // Extract experience highlights
  const experienceHighlights = extractExperienceHighlights(text);

  // Calculate score
  const score = calculateScore(
    allFoundSkills,
    actionVerbsFound,
    sectionsFound,
    contactInfo,
    wordCount,
    quantifiableData.length
  );

  // Generate feedback
  const { strengths, improvements } = generateFeedback(
    allFoundSkills,
    sectionsFound,
    contactInfo,
    actionVerbsFound.length,
    quantifiableData.length
  );

  // Get recommended skills to add
  const missingSkills = getRecommendedSkills(normalizedText);

  return {
    score,
    contactInfo: {
      name: extractName(text),
      email: contactInfo.emails[0] || null,
      phone: contactInfo.phones[0] || null,
      linkedin: contactInfo.linkedin[0] || null,
      github: contactInfo.github[0] || null,
    },
    skills: {
      present: allFoundSkills,
      missing: missingSkills,
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
    education,
    experienceHighlights,
    strengths,
    improvements,
    extractedText: text.substring(0, 2000) + (text.length > 2000 ? "..." : ""),
    fullTextLength: text.length,
  };
}

function extractName(text) {
  // Try to extract name from first few lines
  const lines = text.split("\n").slice(0, 5);
  for (const line of lines) {
    const trimmed = line.trim();
    // Name is typically 2-4 words, mostly letters
    if (trimmed && trimmed.length > 3 && trimmed.length < 50) {
      const words = trimmed.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const isName = words.every((w) => /^[A-Za-z.-]+$/.test(w));
        if (isName && !trimmed.toLowerCase().includes("@")) {
          return trimmed;
        }
      }
    }
  }
  return null;
}

function extractEducation(text) {
  const education = [];
  const lines = text.split("\n");

  // Keywords that indicate education entries
  const degreeKeywords = [
    "bachelor",
    "master",
    "ph.d",
    "phd",
    "doctorate",
    "diploma",
    "b.s",
    "bs",
    "m.s",
    "ms",
    "b.a",
    "ba",
    "m.a",
    "ma",
    "mba",
    "b.tech",
    "btech",
    "m.tech",
    "mtech",
    "b.e",
    "be",
    "m.e",
    "me",
    "b.sc",
    "bsc",
    "m.sc",
    "msc",
    "b.com",
    "bcom",
    "m.com",
    "mcom",
    "bca",
    "mca",
    "b.eng",
    "beng",
    "m.eng",
    "meng",
  ];

  const institutionKeywords = [
    "university",
    "college",
    "institute",
    "school",
    "academy",
    "iit",
    "nit",
    "bits",
    "iiit",
  ];

  const fieldKeywords = [
    "computer science",
    "engineering",
    "information technology",
    "software",
    "electronics",
    "mechanical",
    "electrical",
    "civil",
    "business",
    "commerce",
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "economics",
    "finance",
    "marketing",
    "management",
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    if (lowerLine.length < 5 || lowerLine.length > 250) continue;

    // Check if line contains degree or institution keywords
    const hasDegree = degreeKeywords.some((k) => lowerLine.includes(k));
    const hasInstitution = institutionKeywords.some((k) =>
      lowerLine.includes(k)
    );
    const hasField = fieldKeywords.some((k) => lowerLine.includes(k));

    if (
      (hasDegree || hasInstitution) &&
      !education.some((e) => e.toLowerCase() === lowerLine)
    ) {
      // Clean up the line
      let cleaned = line.trim();
      // Remove leading bullets, dashes, or special characters
      cleaned = cleaned.replace(/^[•\-–—*|►▪]+\s*/, "");

      if (cleaned.length > 5) {
        education.push(cleaned);
      }
    }
  }

  // Also try pattern matching for inline education mentions
  const eduPatterns = [
    /(?:bachelor'?s?|master'?s?|ph\.?d\.?|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?)\s+(?:in|of)?\s+[\w\s]+/gi,
  ];

  for (const pattern of eduPatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      const cleaned = match.trim();
      if (
        cleaned.length > 8 &&
        cleaned.length < 100 &&
        !education.some((e) => e.toLowerCase().includes(cleaned.toLowerCase()))
      ) {
        education.push(cleaned);
      }
    }
  }

  return [...new Set(education)].slice(0, 5);
}

function extractExperienceHighlights(text) {
  const highlights = [];
  const sentences = text.split(/[.!?]+/);

  const impactPatterns = [
    /(?:increased|decreased|improved|reduced|grew|saved|generated|delivered|achieved|led|managed)/i,
    /\d+%/,
    /\$[\d,]+/,
    /\d+\s*(?:years?|months?|team|people|projects?|clients?|users?)/i,
  ];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 30 && trimmed.length < 300) {
      for (const pattern of impactPatterns) {
        if (pattern.test(trimmed)) {
          highlights.push(trimmed);
          break;
        }
      }
    }
  }

  return [...new Set(highlights)].slice(0, 8);
}

function findQuantifiables(text) {
  const patterns = [
    /\d+%/g,
    /\$[\d,]+(?:\.\d{2})?(?:k|m|b)?/gi,
    /\d+\+?\s*(?:years?|months?)/gi,
    /\d+\+?\s*(?:projects?|clients?|users?|customers?|team\s*members?)/gi,
  ];

  const found = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    found.push(...matches);
  }

  return [...new Set(found)];
}

function getRecommendedSkills(text) {
  const popularSkills = [
    "React",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "Kubernetes",
    "TypeScript",
    "PostgreSQL",
    "MongoDB",
    "Git",
    "CI/CD",
    "REST APIs",
    "GraphQL",
    "Agile",
    "Scrum",
    "Leadership",
    "Communication",
  ];

  const missing = [];
  for (const skill of popularSkills) {
    if (!text.includes(skill.toLowerCase())) {
      missing.push(skill);
    }
  }

  return missing.slice(0, 8);
}

function extractContactInfo(text) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
  // Enhanced phone regex to handle multiple formats:
  // +1 (123) 456-7890, +91 98765 43210, 123-456-7890, (123) 456-7890, +44 20 7946 0958
  const phoneRegex =
    /(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}[-.\s]?\d{0,4}/g;
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin:?\s*)[\w-]+/gi;
  const githubRegex = /(?:github\.com\/|github:?\s*)[\w-]+/gi;
  const websiteRegex =
    /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.-]+(?:\/[\w.-]*)?/gi;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const linkedin = text.match(linkedinRegex) || [];
  const github = text.match(githubRegex) || [];

  // Filter websites to exclude linkedin and github
  let websites = text.match(websiteRegex) || [];
  websites = websites.filter(
    (w) =>
      !w.includes("linkedin") &&
      !w.includes("github") &&
      !w.includes("@") &&
      w.includes(".")
  );

  return {
    emails: [...new Set(emails)],
    phones: [...new Set(phones)],
    linkedin: [...new Set(linkedin)],
    github: [...new Set(github)],
    websites: [...new Set(websites)].slice(0, 3),
  };
}

function extractSkills(text) {
  const skillCategories = {
    programming: [
      "javascript",
      "typescript",
      "python",
      "java",
      "c\\+\\+",
      "c#",
      "ruby",
      "php",
      "swift",
      "kotlin",
      "go",
      "golang",
      "rust",
      "scala",
      "r\\b",
      "matlab",
      "perl",
      "shell",
      "bash",
      "powershell",
      "sql",
      "html",
      "css",
      "sass",
      "less",
      "xml",
      "json",
      "yaml",
    ],
    frameworks: [
      "react",
      "angular",
      "vue",
      "svelte",
      "next\\.?js",
      "nuxt",
      "node\\.?js",
      "express",
      "django",
      "flask",
      "fastapi",
      "spring",
      "laravel",
      "rails",
      "asp\\.net",
      "\\.net",
      "flutter",
      "react native",
      "electron",
      "jquery",
      "bootstrap",
      "tailwind",
      "material.?ui",
    ],
    databases: [
      "mysql",
      "postgresql",
      "postgres",
      "mongodb",
      "redis",
      "elasticsearch",
      "cassandra",
      "oracle",
      "sql server",
      "sqlite",
      "dynamodb",
      "firebase",
      "supabase",
      "neo4j",
    ],
    cloud: [
      "aws",
      "amazon web services",
      "azure",
      "google cloud",
      "gcp",
      "heroku",
      "vercel",
      "netlify",
      "digitalocean",
      "cloudflare",
      "docker",
      "kubernetes",
      "k8s",
      "terraform",
      "jenkins",
      "ci/cd",
      "github actions",
      "gitlab",
    ],
    tools: [
      "git",
      "github",
      "gitlab",
      "bitbucket",
      "jira",
      "confluence",
      "slack",
      "figma",
      "sketch",
      "adobe",
      "photoshop",
      "illustrator",
      "vs code",
      "intellij",
      "postman",
      "swagger",
      "webpack",
      "babel",
      "npm",
      "yarn",
      "pip",
    ],
    softSkills: [
      "leadership",
      "communication",
      "teamwork",
      "collaboration",
      "problem.?solving",
      "analytical",
      "creative",
      "innovative",
      "agile",
      "scrum",
      "project management",
      "time management",
      "critical thinking",
      "adaptable",
      "flexible",
    ],
  };

  const foundSkills = {};

  for (const [category, skills] of Object.entries(skillCategories)) {
    foundSkills[category] = [];
    for (const skill of skills) {
      const regex = new RegExp(`\\b${skill}\\b`, "gi");
      if (regex.test(text)) {
        // Capitalize properly
        const match = text.match(regex);
        if (match) {
          foundSkills[category].push(match[0]);
        }
      }
    }
    // Remove duplicates
    foundSkills[category] = [...new Set(foundSkills[category])];
  }

  return foundSkills;
}

function countActionVerbs(text) {
  const actionVerbs = [
    "achieved",
    "accomplished",
    "administered",
    "analyzed",
    "architected",
    "automated",
    "built",
    "collaborated",
    "conducted",
    "configured",
    "coordinated",
    "created",
    "delivered",
    "deployed",
    "designed",
    "developed",
    "directed",
    "documented",
    "engineered",
    "enhanced",
    "established",
    "executed",
    "expanded",
    "facilitated",
    "formulated",
    "generated",
    "guided",
    "implemented",
    "improved",
    "increased",
    "initiated",
    "integrated",
    "introduced",
    "launched",
    "led",
    "managed",
    "maintained",
    "mentored",
    "migrated",
    "modeled",
    "negotiated",
    "optimized",
    "orchestrated",
    "organized",
    "oversaw",
    "pioneered",
    "planned",
    "presented",
    "prioritized",
    "produced",
    "programmed",
    "reduced",
    "refactored",
    "researched",
    "resolved",
    "restructured",
    "reviewed",
    "scaled",
    "simplified",
    "solved",
    "spearheaded",
    "standardized",
    "streamlined",
    "strengthened",
    "supervised",
    "supported",
    "tested",
    "trained",
    "transformed",
    "troubleshot",
    "upgraded",
    "utilized",
    "validated",
    "wrote",
  ];

  const found = [];
  for (const verb of actionVerbs) {
    const regex = new RegExp(`\\b${verb}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) {
      found.push({ verb, count: matches.length });
    }
  }

  return found.sort((a, b) => b.count - a.count);
}

function detectSections(text) {
  const sectionPatterns = {
    summary: /(?:summary|objective|profile|about\s*me)/i,
    experience:
      /(?:experience|employment|work\s*history|professional\s*experience)/i,
    education: /(?:education|academic|qualifications|degree)/i,
    skills: /(?:skills|technical\s*skills|competencies|expertise)/i,
    projects: /(?:projects|portfolio|personal\s*projects)/i,
    certifications: /(?:certifications?|certificates?|licenses?|credentials?)/i,
    awards: /(?:awards?|honors?|achievements?|recognition)/i,
    publications: /(?:publications?|papers?|research)/i,
    languages: /(?:languages?|linguistic)/i,
    references: /(?:references?|recommendations?)/i,
    volunteer: /(?:volunteer|community|extracurricular)/i,
  };

  const foundSections = {};
  for (const [section, pattern] of Object.entries(sectionPatterns)) {
    foundSections[section] = pattern.test(text);
  }

  return foundSections;
}

function calculateScore(
  skills,
  actionVerbs,
  sections,
  contactInfo,
  wordCount,
  quantifiableCount
) {
  let totalScore = 0;

  // Contact info score (15 points)
  if (contactInfo.emails?.length > 0) totalScore += 5;
  if (contactInfo.phones?.length > 0) totalScore += 4;
  if (contactInfo.linkedin?.length > 0) totalScore += 3;
  if (contactInfo.github?.length > 0) totalScore += 3;

  // Skills score (25 points)
  totalScore += Math.min(25, skills.length * 2);

  // Action verbs score (15 points)
  totalScore += Math.min(15, actionVerbs.length * 1.5);

  // Sections score (20 points)
  const requiredSections = ["experience", "education", "skills"];
  const optionalSections = ["summary", "projects", "certifications", "awards"];

  for (const section of requiredSections) {
    if (sections.includes(section)) totalScore += 5;
  }
  for (const section of optionalSections) {
    if (sections.includes(section)) totalScore += 1.25;
  }

  // Length/Content score (15 points)
  if (wordCount >= 200) totalScore += 5;
  if (wordCount >= 400) totalScore += 5;
  if (wordCount >= 600) totalScore += 5;

  // Quantifiable achievements (10 points)
  totalScore += Math.min(10, quantifiableCount * 2);

  return Math.min(100, Math.round(totalScore));
}

function generateFeedback(
  skills,
  sections,
  contactInfo,
  actionVerbCount,
  quantifiableCount
) {
  const strengths = [];
  const improvements = [];

  // Analyze contact info
  if (contactInfo.emails?.length > 0 && contactInfo.phones?.length > 0) {
    strengths.push("Contact information is complete with email and phone");
  } else {
    improvements.push("Add both email and phone number for easy contact");
  }

  if (contactInfo.linkedin?.length > 0) {
    strengths.push("LinkedIn profile included - great for networking");
  } else {
    improvements.push("Consider adding your LinkedIn profile URL");
  }

  if (contactInfo.github?.length > 0) {
    strengths.push("GitHub profile showcases your coding work");
  }

  // Analyze skills
  if (skills.length >= 10) {
    strengths.push(
      `Strong skill variety with ${skills.length} skills identified`
    );
  } else if (skills.length >= 5) {
    improvements.push("Consider adding more relevant skills to your resume");
  } else {
    improvements.push(
      "Add more technical and soft skills to strengthen your profile"
    );
  }

  // Analyze sections
  const hasExperience = sections.includes("experience");
  const hasEducation = sections.includes("education");
  const hasSkills = sections.includes("skills");

  if (hasExperience && hasEducation && hasSkills) {
    strengths.push("Resume has all essential sections");
  } else {
    if (!hasExperience) improvements.push("Add a clear Experience section");
    if (!hasEducation) improvements.push("Add an Education section");
    if (!hasSkills) improvements.push("Add a dedicated Skills section");
  }

  if (!sections.includes("summary")) {
    improvements.push("Consider adding a Professional Summary at the top");
  }

  if (sections.includes("projects")) {
    strengths.push("Projects section helps showcase practical experience");
  } else {
    improvements.push(
      "Adding a Projects section can highlight your practical work"
    );
  }

  // Analyze quantifiable achievements
  if (quantifiableCount < 3) {
    improvements.push(
      "Add more quantifiable achievements (numbers, percentages, metrics)"
    );
  } else {
    strengths.push("Good use of quantifiable metrics in achievements");
  }

  if (actionVerbCount >= 10) {
    strengths.push("Strong use of action verbs throughout");
  } else {
    improvements.push(
      "Use more action verbs (achieved, developed, implemented, etc.)"
    );
  }

  return { strengths, improvements };
}
