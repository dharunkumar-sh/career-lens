import { NextResponse } from "next/server";

// Using JSearch API from RapidAPI - Free tier available
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "software developer";
    const location = searchParams.get("location") || "";
    const page = searchParams.get("page") || "1";
    const remote = searchParams.get("remote") === "true";
    const employmentType = searchParams.get("type") || ""; // FULLTIME, PARTTIME, CONTRACTOR, INTERN
    const autocomplete = searchParams.get("autocomplete"); // "job" or "location"

    // Handle autocomplete requests
    if (autocomplete === "job") {
      return NextResponse.json({
        success: true,
        suggestions: getJobSuggestions(query),
      });
    }

    if (autocomplete === "location") {
      return NextResponse.json({
        success: true,
        suggestions: getLocationSuggestions(location || query),
      });
    }

    // Build search query
    let searchQuery = query;
    if (location) {
      searchQuery += ` in ${location}`;
    }
    if (remote) {
      searchQuery += " remote";
    }

    // Check if API key is configured
    if (!RAPIDAPI_KEY) {
      // Return mock data if no API key
      return NextResponse.json({
        success: true,
        jobs: getMockJobs(query),
        totalJobs: 10,
        isDemo: true,
        message:
          "Using demo data. Configure RAPIDAPI_KEY for live job listings.",
      });
    }

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("page", page);
    url.searchParams.append("num_pages", "1");
    if (employmentType) {
      url.searchParams.append("employment_types", employmentType);
    }

    console.log(
      "Fetching jobs with API key:",
      RAPIDAPI_KEY ? "Present" : "Missing"
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    // Handle API errors gracefully - fallback to mock data
    if (!response.ok) {
      console.error(`JSearch API error: ${response.status}`);
      return NextResponse.json({
        success: true,
        jobs: getMockJobs(query),
        totalJobs: 10,
        isDemo: true,
        message: "API temporarily unavailable. Showing demo jobs.",
      });
    }

    const data = await response.json();

    // Transform the API response to our format
    const jobs = (data.data || []).map((job, index) => ({
      id: job.job_id || `job-${index}`,
      title: job.job_title || "Software Developer",
      company: job.employer_name || "Company",
      companyLogo: job.employer_logo || null,
      location:
        job.job_city && job.job_state
          ? `${job.job_city}, ${job.job_state}`
          : job.job_country || "Remote",
      isRemote: job.job_is_remote || false,
      type: formatEmploymentType(job.job_employment_type),
      salary: formatSalary(
        job.job_min_salary,
        job.job_max_salary,
        job.job_salary_currency
      ),
      posted: formatPostedDate(job.job_posted_at_datetime_utc),
      description: job.job_description || "",
      highlights: job.job_highlights?.Qualifications || [],
      responsibilities: job.job_highlights?.Responsibilities || [],
      applyLink: job.job_apply_link || "",
      skills: extractSkillsFromDescription(job.job_description || ""),
      publisher: job.job_publisher || "",
    }));

    return NextResponse.json({
      success: true,
      jobs,
      totalJobs: data.num_pages ? data.num_pages * 10 : jobs.length,
      isDemo: false,
    });
  } catch (error) {
    console.error("Job search error:", error);

    // Return mock data on error
    return NextResponse.json({
      success: true,
      jobs: getMockJobs("developer"),
      totalJobs: 10,
      isDemo: true,
      message: "Using demo data due to API error.",
    });
  }
}

// Suggest jobs based on user skills
export async function POST(request) {
  try {
    const { skills = [], jobTitle = "" } = await request.json();

    // Build search query from skills
    let searchQuery =
      jobTitle || skills.slice(0, 3).join(" ") || "software developer";

    if (!RAPIDAPI_KEY) {
      // Return mock data with match scores
      const mockJobs = getMockJobs(searchQuery);
      const jobsWithScores = mockJobs.map((job) => ({
        ...job,
        matchScore: calculateMatchScore(job.skills || [], skills),
      }));

      return NextResponse.json({
        success: true,
        jobs: jobsWithScores.sort((a, b) => b.matchScore - a.matchScore),
        totalJobs: jobsWithScores.length,
        isDemo: true,
        message:
          "Using demo data. Configure RAPIDAPI_KEY for live job listings.",
      });
    }

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("page", "1");
    url.searchParams.append("num_pages", "2");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    // Handle API errors gracefully
    if (!response.ok) {
      console.error(`JSearch API error in POST: ${response.status}`);
      return NextResponse.json({
        success: true,
        jobs: getMockJobs(searchQuery).map((job) => ({
          ...job,
          matchScore: Math.floor(Math.random() * 30) + 60,
        })),
        totalJobs: 10,
        isDemo: true,
        message: "API temporarily unavailable. Showing demo jobs.",
      });
    }

    const data = await response.json();

    // Transform and add match scores
    const jobs = (data.data || []).map((job, index) => {
      const jobSkills = extractSkillsFromDescription(job.job_description || "");
      return {
        id: job.job_id || `job-${index}`,
        title: job.job_title || "Software Developer",
        company: job.employer_name || "Company",
        companyLogo: job.employer_logo || null,
        location:
          job.job_city && job.job_state
            ? `${job.job_city}, ${job.job_state}`
            : job.job_country || "Remote",
        isRemote: job.job_is_remote || false,
        type: formatEmploymentType(job.job_employment_type),
        salary: formatSalary(
          job.job_min_salary,
          job.job_max_salary,
          job.job_salary_currency
        ),
        posted: formatPostedDate(job.job_posted_at_datetime_utc),
        description: job.job_description || "",
        highlights: job.job_highlights?.Qualifications || [],
        responsibilities: job.job_highlights?.Responsibilities || [],
        applyLink: job.job_apply_link || "",
        skills: jobSkills,
        publisher: job.job_publisher || "",
        matchScore: calculateMatchScore(jobSkills, skills),
      };
    });

    // Sort by match score
    jobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      jobs,
      totalJobs: data.num_pages ? data.num_pages * 10 : jobs.length,
      isDemo: false,
    });
  } catch (error) {
    console.error("Job suggestion error:", error);

    return NextResponse.json({
      success: true,
      jobs: getMockJobs("developer").map((job) => ({
        ...job,
        matchScore: Math.floor(Math.random() * 30) + 60,
      })),
      totalJobs: 10,
      isDemo: true,
      message: "Using demo data due to API error.",
    });
  }
}

function formatEmploymentType(type) {
  const types = {
    FULLTIME: "Full-time",
    PARTTIME: "Part-time",
    CONTRACTOR: "Contract",
    INTERN: "Internship",
  };
  return types[type] || type || "Full-time";
}

function formatSalary(min, max, currency = "USD") {
  if (!min && !max) return "Salary not disclosed";

  const formatNum = (num) => {
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return num;
  };

  const symbol = currency === "USD" ? "$" : currency === "INR" ? "₹" : currency;

  if (min && max) {
    return `${symbol}${formatNum(min)} - ${symbol}${formatNum(max)}`;
  }
  if (min) return `${symbol}${formatNum(min)}+`;
  if (max) return `Up to ${symbol}${formatNum(max)}`;
  return "Salary not disclosed";
}

function formatPostedDate(dateString) {
  if (!dateString) return "Recently";

  const posted = new Date(dateString);
  const now = new Date();
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function extractSkillsFromDescription(description) {
  const skillKeywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "go",
    "rust",
    "scala",
    "react",
    "angular",
    "vue",
    "svelte",
    "next.js",
    "nuxt",
    "node.js",
    "express",
    "django",
    "flask",
    "spring",
    "laravel",
    "rails",
    ".net",
    "flutter",
    "react native",
    "html",
    "css",
    "sass",
    "tailwind",
    "bootstrap",
    "material ui",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "elasticsearch",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "jenkins",
    "git",
    "github",
    "gitlab",
    "jira",
    "figma",
    "agile",
    "scrum",
    "rest api",
    "graphql",
    "sql",
    "nosql",
    "machine learning",
    "ai",
    "data science",
    "devops",
    "ci/cd",
    "microservices",
  ];

  const lowerDesc = description.toLowerCase();
  const found = skillKeywords.filter((skill) => lowerDesc.includes(skill));

  // Capitalize skills properly
  return [...new Set(found)].slice(0, 8).map((skill) =>
    skill
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function calculateMatchScore(jobSkills, userSkills) {
  if (!jobSkills.length || !userSkills.length) return 50;

  const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  let matches = 0;
  for (const skill of userSkillsLower) {
    if (jobSkillsLower.some((js) => js.includes(skill) || skill.includes(js))) {
      matches++;
    }
  }

  const matchRatio = matches / Math.max(jobSkills.length, userSkills.length);
  return Math.min(99, Math.max(40, Math.round(50 + matchRatio * 50)));
}

function getMockJobs(query) {
  const baseJobs = [
    {
      id: "mock-1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      companyLogo: null,
      location: "San Francisco, CA",
      isRemote: false,
      type: "Full-time",
      salary: "$120k - $160k",
      posted: "2 days ago",
      description:
        "We are looking for an experienced frontend developer to join our team...",
      highlights: [
        "5+ years of experience",
        "Strong React skills",
        "Team leadership",
      ],
      responsibilities: [
        "Build user interfaces",
        "Code reviews",
        "Mentor juniors",
      ],
      applyLink: "https://example.com/apply",
      skills: ["React", "TypeScript", "Node.js", "CSS", "Git"],
      publisher: "Company Website",
      matchScore: 95,
    },
    {
      id: "mock-2",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      companyLogo: null,
      location: "Remote",
      isRemote: true,
      type: "Full-time",
      salary: "$100k - $140k",
      posted: "1 week ago",
      description: "Join our fast-growing startup as a full stack engineer...",
      highlights: ["3+ years experience", "Startup mindset", "Problem solver"],
      responsibilities: [
        "Full stack development",
        "API design",
        "Database management",
      ],
      applyLink: "https://example.com/apply",
      skills: ["JavaScript", "Python", "AWS", "PostgreSQL", "Docker"],
      publisher: "LinkedIn",
      matchScore: 88,
    },
    {
      id: "mock-3",
      title: "React Developer",
      company: "Digital Agency Co.",
      companyLogo: null,
      location: "New York, NY",
      isRemote: false,
      type: "Contract",
      salary: "$80k - $110k",
      posted: "3 days ago",
      description: "Looking for a React developer for client projects...",
      highlights: [
        "React expertise",
        "Agency experience preferred",
        "Creative mindset",
      ],
      responsibilities: [
        "Build web applications",
        "Client communication",
        "Agile development",
      ],
      applyLink: "https://example.com/apply",
      skills: ["React", "CSS", "Redux", "JavaScript", "Figma"],
      publisher: "Indeed",
      matchScore: 82,
    },
    {
      id: "mock-4",
      title: "Software Engineer",
      company: "Enterprise Solutions",
      companyLogo: null,
      location: "Austin, TX",
      isRemote: false,
      type: "Full-time",
      salary: "$90k - $130k",
      posted: "5 days ago",
      description: "Enterprise software development position...",
      highlights: [
        "Java/Spring experience",
        "Enterprise background",
        "Team player",
      ],
      responsibilities: [
        "Backend development",
        "System design",
        "Code optimization",
      ],
      applyLink: "https://example.com/apply",
      skills: ["Java", "Spring Boot", "React", "MySQL", "AWS"],
      publisher: "Glassdoor",
      matchScore: 78,
    },
    {
      id: "mock-5",
      title: "Backend Developer",
      company: "FinTech Innovations",
      companyLogo: null,
      location: "Remote",
      isRemote: true,
      type: "Full-time",
      salary: "$110k - $150k",
      posted: "1 day ago",
      description: "Build scalable backend systems for our fintech platform...",
      highlights: [
        "Strong backend skills",
        "FinTech experience a plus",
        "Security focused",
      ],
      responsibilities: [
        "API development",
        "Database design",
        "Performance optimization",
      ],
      applyLink: "https://example.com/apply",
      skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker"],
      publisher: "Company Website",
      matchScore: 85,
    },
    {
      id: "mock-6",
      title: "DevOps Engineer",
      company: "CloudScale Tech",
      companyLogo: null,
      location: "Seattle, WA",
      isRemote: true,
      type: "Full-time",
      salary: "$130k - $170k",
      posted: "4 days ago",
      description:
        "Join our DevOps team to build and maintain cloud infrastructure...",
      highlights: [
        "AWS/GCP expertise",
        "Kubernetes experience",
        "CI/CD pipelines",
      ],
      responsibilities: [
        "Infrastructure management",
        "Automation",
        "Monitoring",
      ],
      applyLink: "https://example.com/apply",
      skills: ["AWS", "Kubernetes", "Docker", "Terraform", "Jenkins"],
      publisher: "LinkedIn",
      matchScore: 72,
    },
    {
      id: "mock-7",
      title: "Mobile App Developer",
      company: "AppWorks Studio",
      companyLogo: null,
      location: "Los Angeles, CA",
      isRemote: false,
      type: "Full-time",
      salary: "$95k - $135k",
      posted: "1 week ago",
      description:
        "Create beautiful mobile applications for iOS and Android...",
      highlights: ["React Native or Flutter", "Published apps", "UI/UX sense"],
      responsibilities: [
        "Mobile development",
        "App optimization",
        "Feature implementation",
      ],
      applyLink: "https://example.com/apply",
      skills: ["React Native", "Flutter", "JavaScript", "iOS", "Android"],
      publisher: "Indeed",
      matchScore: 68,
    },
    {
      id: "mock-8",
      title: "Data Engineer",
      company: "DataDriven Inc.",
      companyLogo: null,
      location: "Remote",
      isRemote: true,
      type: "Full-time",
      salary: "$115k - $155k",
      posted: "6 days ago",
      description: "Build and maintain data pipelines for analytics...",
      highlights: ["Big data experience", "Python/SQL skills", "ETL expertise"],
      responsibilities: [
        "Data pipeline development",
        "ETL processes",
        "Data modeling",
      ],
      applyLink: "https://example.com/apply",
      skills: ["Python", "SQL", "Spark", "AWS", "Airflow"],
      publisher: "Glassdoor",
      matchScore: 65,
    },
  ];

  return baseJobs;
}

// Job title suggestions for autocomplete
function getJobSuggestions(query) {
  const allJobTitles = [
    "Software Engineer",
    "Software Developer",
    "Senior Software Engineer",
    "Full Stack Developer",
    "Full Stack Engineer",
    "Frontend Developer",
    "Frontend Engineer",
    "Backend Developer",
    "Backend Engineer",
    "React Developer",
    "React Native Developer",
    "Angular Developer",
    "Vue.js Developer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer",
    "JavaScript Developer",
    "TypeScript Developer",
    "PHP Developer",
    "Ruby on Rails Developer",
    "Go Developer",
    "Rust Developer",
    "iOS Developer",
    "Android Developer",
    "Mobile App Developer",
    "DevOps Engineer",
    "Cloud Engineer",
    "AWS Solutions Architect",
    "Azure Developer",
    "Data Engineer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "AI Engineer",
    "ML Engineer",
    "QA Engineer",
    "Test Engineer",
    "Automation Engineer",
    "Site Reliability Engineer",
    "SRE",
    "Platform Engineer",
    "Security Engineer",
    "Cybersecurity Analyst",
    "Network Engineer",
    "System Administrator",
    "Database Administrator",
    "DBA",
    "Technical Lead",
    "Tech Lead",
    "Engineering Manager",
    "Product Manager",
    "Project Manager",
    "Scrum Master",
    "UI/UX Designer",
    "UX Designer",
    "UI Designer",
    "Product Designer",
    "Graphic Designer",
    "Web Developer",
    "WordPress Developer",
    "Shopify Developer",
    "Salesforce Developer",
    "SAP Developer",
    "Blockchain Developer",
    "Web3 Developer",
    "Game Developer",
    "Embedded Systems Engineer",
    "Firmware Engineer",
    "IT Support Specialist",
    "Technical Support Engineer",
    "Solutions Engineer",
    "Sales Engineer",
    "Business Analyst",
    "Systems Analyst",
  ];

  const lowerQuery = query.toLowerCase();
  return allJobTitles
    .filter((title) => title.toLowerCase().includes(lowerQuery))
    .slice(0, 8);
}

// Location suggestions for autocomplete
function getLocationSuggestions(query) {
  const allLocations = [
    // India
    "Bengaluru, India",
    "Bangalore, India",
    "Mumbai, India",
    "Delhi, India",
    "New Delhi, India",
    "Hyderabad, India",
    "Chennai, India",
    "Pune, India",
    "Kolkata, India",
    "Ahmedabad, India",
    "Gurgaon, India",
    "Noida, India",
    "Jaipur, India",
    "Chandigarh, India",
    "Kochi, India",
    "Coimbatore, India",
    "Indore, India",
    "Thiruvananthapuram, India",
    // USA
    "San Francisco, CA",
    "San Jose, CA",
    "Los Angeles, CA",
    "San Diego, CA",
    "Seattle, WA",
    "New York, NY",
    "Austin, TX",
    "Dallas, TX",
    "Houston, TX",
    "Chicago, IL",
    "Boston, MA",
    "Denver, CO",
    "Atlanta, GA",
    "Miami, FL",
    "Washington, DC",
    "Phoenix, AZ",
    "Portland, OR",
    "Raleigh, NC",
    "Charlotte, NC",
    "Minneapolis, MN",
    "Detroit, MI",
    "Philadelphia, PA",
    // UK
    "London, UK",
    "Manchester, UK",
    "Birmingham, UK",
    "Edinburgh, UK",
    "Bristol, UK",
    "Cambridge, UK",
    "Oxford, UK",
    // Europe
    "Berlin, Germany",
    "Munich, Germany",
    "Amsterdam, Netherlands",
    "Dublin, Ireland",
    "Paris, France",
    "Barcelona, Spain",
    "Stockholm, Sweden",
    "Zurich, Switzerland",
    // Canada
    "Toronto, Canada",
    "Vancouver, Canada",
    "Montreal, Canada",
    "Ottawa, Canada",
    "Calgary, Canada",
    // Australia
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    // Singapore
    "Singapore",
    // Remote options
    "Remote",
    "Work from Home",
    "Hybrid",
  ];

  const lowerQuery = query.toLowerCase();
  return allLocations
    .filter((loc) => loc.toLowerCase().includes(lowerQuery))
    .slice(0, 8);
}
