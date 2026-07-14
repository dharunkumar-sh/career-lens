// Comprehensive Tech & Industry Role Skills Database
// Covers 30+ roles and 100+ detailed skills with prerequisites, projects, certifications, and difficulty metrics.

export const SKILL_CATEGORIES = {
  LANGUAGES: { name: "Languages & Core Syntax", color: "cyan" },
  FRAMEWORKS: { name: "Frameworks & Libraries", color: "blue" },
  CLOUD_DEVOPS: { name: "Cloud, DevOps & Infra", color: "green" },
  DATA_AI: { name: "Data Engineering & AI/ML", color: "purple" },
  ARCHITECTURE: { name: "System Design & Architecture", color: "amber" },
  SECURITY_QA: { name: "Security, Testing & Quality", color: "rose" },
  PROCESS_SOFT: { name: "Process & Product Leadership", color: "emerald" },
};

export const SKILLS_POOL = {
  // --- Languages ---
  javascript: {
    id: "javascript",
    name: "JavaScript (ES6+)",
    category: "LANGUAGES",
    difficulty: "Beginner",
    estimatedHours: 45,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["MDN Web Docs - JavaScript Guide", "JavaScript.info"],
    suggestedProject: "Build an interactive SPA dashboard with asynchronous API polling and local storage persistence.",
    certification: "OpenJS Node/JS Foundation Certification",
  },
  typescript: {
    id: "typescript",
    name: "TypeScript",
    category: "LANGUAGES",
    difficulty: "Intermediate",
    estimatedHours: 35,
    importance: "Critical",
    prerequisites: ["javascript"],
    learningResources: ["Official TypeScript Handbook", "Total TypeScript Course"],
    suggestedProject: "Migrate an existing complex JavaScript React or Node codebase to strict TypeScript with custom generics.",
    certification: null,
  },
  python: {
    id: "python",
    name: "Python 3.x",
    category: "LANGUAGES",
    difficulty: "Beginner",
    estimatedHours: 50,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["Official Python Tutorial", "Real Python Guides"],
    suggestedProject: "Build an automated web scraper and REST API backend that processes JSON payloads.",
    certification: "PCEP / PCAP Certified Python Programmer",
  },
  java: {
    id: "java",
    name: "Java (Modern 17+)",
    category: "LANGUAGES",
    difficulty: "Intermediate",
    estimatedHours: 60,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["Oracle Java Documentation", "Baeldung Tutorials"],
    suggestedProject: "Create a multi-threaded banking transaction processing service with thread-safe data structures.",
    certification: "Oracle Certified Professional: Java SE Developer",
  },
  go: {
    id: "go",
    name: "Go (Golang)",
    category: "LANGUAGES",
    difficulty: "Intermediate",
    estimatedHours: 45,
    importance: "High",
    prerequisites: [],
    learningResources: ["A Tour of Go (go.dev)", "Effective Go"],
    suggestedProject: "Build a high-throughput concurrent log aggregator using Goroutines and Channels.",
    certification: null,
  },
  rust: {
    id: "rust",
    name: "Rust",
    category: "LANGUAGES",
    difficulty: "Advanced",
    estimatedHours: 80,
    importance: "High",
    prerequisites: [],
    learningResources: ["The Rust Programming Language (Rust Book)", "Rust by Example"],
    suggestedProject: "Develop a memory-safe command-line file encryption utility or high-speed CLI tool.",
    certification: null,
  },
  sql: {
    id: "sql",
    name: "SQL & Relational Querying",
    category: "LANGUAGES",
    difficulty: "Beginner",
    estimatedHours: 30,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["Mode Analytics SQL Tutorial", "PostgreSQL Official Docs"],
    suggestedProject: "Design a complex e-commerce relational schema with stored procedures, window functions, and indexing.",
    certification: null,
  },
  cpp: {
    id: "cpp",
    name: "C++ (Modern C++20)",
    category: "LANGUAGES",
    difficulty: "Advanced",
    estimatedHours: 90,
    importance: "High",
    prerequisites: [],
    learningResources: ["LearnCpp.com", "Modern C++ Tutorial"],
    suggestedProject: "Implement a custom memory pool allocator and low-latency network socket engine.",
    certification: "C++ Institute CPA/CPP Certification",
  },

  // --- Frameworks & Libraries ---
  react: {
    id: "react",
    name: "React & Hooks",
    category: "FRAMEWORKS",
    difficulty: "Intermediate",
    estimatedHours: 50,
    importance: "Critical",
    prerequisites: ["javascript"],
    learningResources: ["React.dev Official Documentation", "Epic React"],
    suggestedProject: "Build a modular e-commerce client with custom hooks, Context API, and optimistic UI updates.",
    certification: "Meta Frontend Developer Professional Certificate",
  },
  nextjs: {
    id: "nextjs",
    name: "Next.js (App Router & SSR)",
    category: "FRAMEWORKS",
    difficulty: "Intermediate",
    estimatedHours: 40,
    importance: "Critical",
    prerequisites: ["react", "typescript"],
    learningResources: ["Next.js Learn Course", "Vercel Documentation"],
    suggestedProject: "Create a full-stack SaaS portal utilizing React Server Components, Server Actions, and API routes.",
    certification: null,
  },
  nodejs: {
    id: "nodejs",
    name: "Node.js & Runtime Internals",
    category: "FRAMEWORKS",
    difficulty: "Intermediate",
    estimatedHours: 45,
    importance: "Critical",
    prerequisites: ["javascript"],
    learningResources: ["Node.js Official Docs", "Node.js Design Patterns Book"],
    suggestedProject: "Develop an asynchronous real-time chat server using EventEmitters and WebSockets.",
    certification: "OpenJS Node.js Application Developer (JSNAD)",
  },
  express_nestjs: {
    id: "express_nestjs",
    name: "Backend APIs (Express / NestJS)",
    category: "FRAMEWORKS",
    difficulty: "Intermediate",
    estimatedHours: 40,
    importance: "Critical",
    prerequisites: ["nodejs", "typescript"],
    learningResources: ["NestJS Official Documentation", "Express.js Guide"],
    suggestedProject: "Build an enterprise REST & GraphQL backend with dependency injection, JWT authentication, and Swagger docs.",
    certification: null,
  },
  spring_boot: {
    id: "spring_boot",
    name: "Spring Boot & Microservices",
    category: "FRAMEWORKS",
    difficulty: "Advanced",
    estimatedHours: 65,
    importance: "Critical",
    prerequisites: ["java"],
    learningResources: ["Spring.io Guides", "Baeldung Spring Boot"],
    suggestedProject: "Develop a distributed microservice suite with Spring Cloud Gateway, Eureka discovery, and OAuth2 security.",
    certification: "Spring Certified Professional",
  },
  fastapi_django: {
    id: "fastapi_django",
    name: "Python Web (FastAPI / Django)",
    category: "FRAMEWORKS",
    difficulty: "Intermediate",
    estimatedHours: 40,
    importance: "Critical",
    prerequisites: ["python"],
    learningResources: ["FastAPI Official Docs", "Django Project Guides"],
    suggestedProject: "Create an async high-concurrency API service handling ML model inferences with automatic OpenAPI validation.",
    certification: null,
  },
  tailwind_css: {
    id: "tailwind_css",
    name: "Modern CSS & Tailwind CSS",
    category: "FRAMEWORKS",
    difficulty: "Beginner",
    estimatedHours: 20,
    importance: "High",
    prerequisites: [],
    learningResources: ["Tailwind CSS Official Docs", "Refactoring UI"],
    suggestedProject: "Craft a responsive, accessible dark-mode dashboard component library with smooth CSS transitions.",
    certification: null,
  },

  // --- Cloud, DevOps & Infra ---
  docker: {
    id: "docker",
    name: "Docker & Containerization",
    category: "CLOUD_DEVOPS",
    difficulty: "Beginner",
    estimatedHours: 30,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["Docker Curriculum", "Official Docker Best Practices"],
    suggestedProject: "Containerize a multi-tier web application with multi-stage Dockerfiles and Docker Compose orchestrating DB and cache.",
    certification: "Docker Certified Associate (DCA)",
  },
  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes Orchestration",
    category: "CLOUD_DEVOPS",
    difficulty: "Advanced",
    estimatedHours: 70,
    importance: "Critical",
    prerequisites: ["docker"],
    learningResources: ["Kubernetes.io Official Tutorials", "KodeKloud CKA Course"],
    suggestedProject: "Deploy an auto-scaling microservices cluster with Helm charts, ingress controllers, and persistent volume claims.",
    certification: "Certified Kubernetes Administrator (CKA)",
  },
  aws_cloud: {
    id: "aws_cloud",
    name: "AWS Cloud Ecosystem (EC2, S3, IAM, Lambda)",
    category: "CLOUD_DEVOPS",
    difficulty: "Intermediate",
    estimatedHours: 60,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["AWS Skill Builder", "Stephane Maarek AWS Courses"],
    suggestedProject: "Architect a serverless event-driven image processing pipeline using S3, Lambda, SQS, and DynamoDB.",
    certification: "AWS Certified Solutions Architect – Associate",
  },
  gcp_cloud: {
    id: "gcp_cloud",
    name: "Google Cloud Platform (GCP & BigQuery)",
    category: "CLOUD_DEVOPS",
    difficulty: "Intermediate",
    estimatedHours: 50,
    importance: "High",
    prerequisites: [],
    learningResources: ["Google Cloud Skills Boost", "Official GCP Architecture Guides"],
    suggestedProject: "Deploy an enterprise serverless application using Cloud Run, Pub/Sub, and BigQuery data warehousing.",
    certification: "Google Cloud Certified – Associate Cloud Engineer",
  },
  terraform_iac: {
    id: "terraform_iac",
    name: "Terraform & Infrastructure as Code (IaC)",
    category: "CLOUD_DEVOPS",
    difficulty: "Intermediate",
    estimatedHours: 40,
    importance: "High",
    prerequisites: ["aws_cloud"],
    learningResources: ["HashiCorp Learn Tutorials", "Terraform Best Practices"],
    suggestedProject: "Provision a production-ready multi-AZ VPC, EKS cluster, and RDS database using modular Terraform scripts.",
    certification: "HashiCorp Certified: Terraform Associate",
  },
  cicd_pipelines: {
    id: "cicd_pipelines",
    name: "CI/CD Pipelines (GitHub Actions / Jenkins)",
    category: "CLOUD_DEVOPS",
    difficulty: "Intermediate",
    estimatedHours: 35,
    importance: "Critical",
    prerequisites: ["docker"],
    learningResources: ["GitHub Actions Documentation", "Jenkins Best Practices"],
    suggestedProject: "Implement a zero-downtime deployment CI/CD workflow running automated unit/e2e tests, Docker build, and cloud deployment.",
    certification: null,
  },
  linux_bash: {
    id: "linux_bash",
    name: "Linux Internals & Bash Scripting",
    category: "CLOUD_DEVOPS",
    difficulty: "Beginner",
    estimatedHours: 30,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["The Linux Command Line (Book)", "Linux Journey"],
    suggestedProject: "Write automated system health monitoring and log rotation scripts utilizing awk, grep, cron, and systemd.",
    certification: "CompTIA Linux+ / LPIC-1",
  },
  monitoring_observability: {
    id: "monitoring_observability",
    name: "Observability (Prometheus, Grafana, OpenTelemetry)",
    category: "CLOUD_DEVOPS",
    difficulty: "Intermediate",
    estimatedHours: 35,
    importance: "High",
    prerequisites: ["docker"],
    learningResources: ["Prometheus Official Guides", "Grafana Tutorials"],
    suggestedProject: "Configure end-to-end distributed tracing, custom Prometheus metrics exporters, and alerting Grafana dashboards.",
    certification: null,
  },

  // --- Data Engineering & AI/ML ---
  pandas_numpy: {
    id: "pandas_numpy",
    name: "Data Wrangling (Pandas & NumPy)",
    category: "DATA_AI",
    difficulty: "Beginner",
    estimatedHours: 40,
    importance: "Critical",
    prerequisites: ["python"],
    learningResources: ["Python for Data Analysis by Wes McKinney", "Kaggle Pandas Course"],
    suggestedProject: "Clean, transform, and analyze a multi-million row financial transaction dataset to uncover spending anomalies.",
    certification: null,
  },
  machine_learning: {
    id: "machine_learning",
    name: "Machine Learning Algorithms (Scikit-Learn)",
    category: "DATA_AI",
    difficulty: "Intermediate",
    estimatedHours: 70,
    importance: "Critical",
    prerequisites: ["python", "pandas_numpy"],
    learningResources: ["Hands-On Machine Learning (Géron)", "Coursera ML Specialization"],
    suggestedProject: "Train, tune, and evaluate classification and regression models (Random Forests, Gradient Boosting) on churn prediction.",
    certification: "DeepLearning.AI Machine Learning Specialization",
  },
  deep_learning_pytorch: {
    id: "deep_learning_pytorch",
    name: "Deep Learning & PyTorch / TensorFlow",
    category: "DATA_AI",
    difficulty: "Advanced",
    estimatedHours: 90,
    importance: "Critical",
    prerequisites: ["machine_learning"],
    learningResources: ["PyTorch Official Tutorials", "Fast.ai Practical Deep Learning"],
    suggestedProject: "Build a Convolutional Neural Network (CNN) for custom image classification or a Transformer attention model from scratch.",
    certification: "TensorFlow Developer Certificate / PyTorch Certified",
  },
  llm_rag_engineering: {
    id: "llm_rag_engineering",
    name: "LLM Applications, RAG & Vector DBs",
    category: "DATA_AI",
    difficulty: "Advanced",
    estimatedHours: 60,
    importance: "Critical",
    prerequisites: ["python"],
    learningResources: ["LangChain / LlamaIndex Docs", "DeepLearning.AI Generative AI Courses"],
    suggestedProject: "Develop a Retrieval-Augmented Generation (RAG) assistant integrating semantic embeddings, Pinecone/Pgvector, and Gemini APIs.",
    certification: null,
  },
  data_pipelines_spark: {
    id: "data_pipelines_spark",
    name: "Big Data Processing (Apache Spark / Airflow)",
    category: "DATA_AI",
    difficulty: "Advanced",
    estimatedHours: 65,
    importance: "Critical",
    prerequisites: ["python", "sql"],
    learningResources: ["Apache Airflow Documentation", "Learning Spark Book"],
    suggestedProject: "Build an automated ETL DAG with Airflow orchestrating PySpark batch transformations across data lakes.",
    certification: "Databricks Certified Data Engineer Associate",
  },
  data_modeling_dwh: {
    id: "data_modeling_dwh",
    name: "Data Warehousing (Snowflake / BigQuery / dbt)",
    category: "DATA_AI",
    difficulty: "Intermediate",
    estimatedHours: 45,
    importance: "High",
    prerequisites: ["sql"],
    learningResources: ["dbt Fundamentals", "Snowflake Best Practices"],
    suggestedProject: "Implement a dimensional data warehouse model using dbt transformations with automated schema testing.",
    certification: "Snowflake SnowPro Core Certification",
  },

  // --- System Design & Architecture ---
  system_design: {
    id: "system_design",
    name: "Distributed System Design & Scalability",
    category: "ARCHITECTURE",
    difficulty: "Advanced",
    estimatedHours: 70,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["System Design Interview by Alex Xu", "Martin Kleppmann - Designing Data-Intensive Applications"],
    suggestedProject: "Design architectural blueprints and benchmark a simulated high-scale notification & rate-limiting engine.",
    certification: null,
  },
  database_internals: {
    id: "database_internals",
    name: "Database Tuning, Sharding & Replication",
    category: "ARCHITECTURE",
    difficulty: "Advanced",
    estimatedHours: 50,
    importance: "High",
    prerequisites: ["sql"],
    learningResources: ["High Performance MySQL", "PostgreSQL Internals Book"],
    suggestedProject: "Set up a primary-replica Postgres cluster with connection pooling (PgBouncer), partitioning, and query execution plan optimization.",
    certification: null,
  },
  microservices_patterns: {
    id: "microservices_patterns",
    name: "Microservice Architecture & Event-Driven Design",
    category: "ARCHITECTURE",
    difficulty: "Advanced",
    estimatedHours: 60,
    importance: "High",
    prerequisites: [],
    learningResources: ["Microservices Patterns by Chris Richardson", "Kafka Enterprise Architecture"],
    suggestedProject: "Architect a CQRS and Event Sourcing order fulfillment architecture utilizing Apache Kafka message brokers.",
    certification: null,
  },
  cloud_architecture: {
    id: "cloud_architecture",
    name: "Multi-Cloud & High-Availability Architecture",
    category: "ARCHITECTURE",
    difficulty: "Advanced",
    estimatedHours: 70,
    importance: "Critical",
    prerequisites: ["aws_cloud"],
    learningResources: ["AWS Well-Architected Framework", "Enterprise Cloud Strategy Guides"],
    suggestedProject: "Design a cross-region disaster recovery disaster failover setup with RPO/RTO SLAs under 5 minutes.",
    certification: "AWS Certified Solutions Architect – Professional",
  },

  // --- Security, Testing & Quality ---
  cybersecurity_owasp: {
    id: "cybersecurity_owasp",
    name: "Application Security & OWASP Top 10",
    category: "SECURITY_QA",
    difficulty: "Intermediate",
    estimatedHours: 40,
    importance: "Critical",
    prerequisites: [],
    learningResources: ["OWASP Testing Guide", "PortSwigger Web Security Academy"],
    suggestedProject: "Perform automated and manual vulnerability assessment fixing XSS, CSRF, SQLi, and broken authentication flaws.",
    certification: "Certified Ethical Hacker (CEH) / CompTIA Security+",
  },
  network_security_iam: {
    id: "network_security_iam",
    name: "Zero Trust, IAM & Cloud Security",
    category: "SECURITY_QA",
    difficulty: "Advanced",
    estimatedHours: 55,
    importance: "High",
    prerequisites: [],
    learningResources: ["NIST Zero Trust Architecture Docs", "Cloud Security Alliance Guides"],
    suggestedProject: "Design fine-grained role-based (RBAC) and attribute-based (ABAC) IAM policies with mutual TLS service mesh hardening.",
    certification: "CCSP (Certified Cloud Security Professional)",
  },
  automated_testing: {
    id: "automated_testing",
    name: "Test Automation (Jest, Cypress, Playwright)",
    category: "SECURITY_QA",
    difficulty: "Intermediate",
    estimatedHours: 35,
    importance: "Critical",
    prerequisites: ["javascript"],
    learningResources: ["Playwright Official Documentation", "Testing Trophy Guidelines"],
    suggestedProject: "Write a comprehensive automated testing suite with unit mock tests, integration contracts, and cross-browser e2e specs.",
    certification: "ISTQB Certified Tester",
  },
  sre_reliability: {
    id: "sre_reliability",
    name: "Site Reliability Engineering (SLOs, Error Budgets)",
    category: "SECURITY_QA",
    difficulty: "Advanced",
    estimatedHours: 50,
    importance: "High",
    prerequisites: ["linux_bash", "monitoring_observability"],
    learningResources: ["Google SRE Book", "Site Reliability Workbook"],
    suggestedProject: "Formulate SLA/SLO definitions, error budget burn alerting, and automated incident runbook scripts.",
    certification: null,
  },

  // --- Process & Soft Skills ---
  agile_scrum: {
    id: "agile_scrum",
    name: "Agile, Scrum & Technical Leadership",
    category: "PROCESS_SOFT",
    difficulty: "Beginner",
    estimatedHours: 25,
    importance: "High",
    prerequisites: [],
    learningResources: ["Scrum Guide by Ken Schwaber", "Atlassian Agile Coach"],
    suggestedProject: "Lead a simulated sprint planning, story estimation, and technical retrospective workshop for cross-functional deliverables.",
    certification: "Certified ScrumMaster (CSM) / Professional Scrum Master (PSM I)",
  },
  product_strategy: {
    id: "product_strategy",
    name: "Product Discovery & User Metrics (OKRs, KPIs)",
    category: "PROCESS_SOFT",
    difficulty: "Intermediate",
    estimatedHours: 35,
    importance: "High",
    prerequisites: [],
    learningResources: ["Inspired by Marty Cagan", "Reforge Product Guides"],
    suggestedProject: "Draft a comprehensive PRD (Product Requirement Document) and customer journey map with clear A/B testing hypotheses.",
    certification: null,
  },
};

// -----------------------------------------------------------------------------
// ROLES DATABASE (30+ comprehensive roles)
// -----------------------------------------------------------------------------

export const ROLES_DATABASE = [
  {
    id: "frontend_dev",
    title: "Frontend Developer",
    category: "Software Engineering",
    description: "Specializes in building responsive, interactive, and high-performance web user interfaces.",
    avgSalary: "$105,000",
    demandLevel: "Very High",
    skills: ["javascript", "typescript", "react", "nextjs", "tailwind_css", "automated_testing", "agile_scrum"],
  },
  {
    id: "backend_dev",
    title: "Backend Engineer",
    category: "Software Engineering",
    description: "Focuses on robust server-side logic, database performance, API design, and system reliability.",
    avgSalary: "$118,000",
    demandLevel: "Very High",
    skills: ["javascript", "typescript", "nodejs", "express_nestjs", "sql", "database_internals", "docker", "automated_testing", "system_design"],
  },
  {
    id: "fullstack_dev",
    title: "Full Stack Developer",
    category: "Software Engineering",
    description: "Bridges both client-side UI experiences and server-side infrastructure and database engineering.",
    avgSalary: "$125,000",
    demandLevel: "Extremely High",
    skills: ["javascript", "typescript", "react", "nextjs", "nodejs", "express_nestjs", "sql", "tailwind_css", "docker", "cicd_pipelines", "system_design"],
  },
  {
    id: "python_backend_dev",
    title: "Python Backend Engineer",
    category: "Software Engineering",
    description: "Designs and scales API services, data ingestion systems, and high-concurrency web applications using Python.",
    avgSalary: "$120,000",
    demandLevel: "High",
    skills: ["python", "fastapi_django", "sql", "database_internals", "docker", "linux_bash", "automated_testing", "system_design"],
  },
  {
    id: "java_enterprise_dev",
    title: "Enterprise Java Developer",
    category: "Software Engineering",
    description: "Builds large-scale, mission-critical enterprise microservices and distributed transaction engines.",
    avgSalary: "$122,000",
    demandLevel: "High",
    skills: ["java", "spring_boot", "sql", "database_internals", "microservices_patterns", "docker", "cicd_pipelines", "automated_testing"],
  },
  {
    id: "systems_rust_go",
    title: "Systems / High-Performance Engineer (Rust/Go)",
    category: "Software Engineering",
    description: "Engineers ultra-low latency networking engines, distributed consensus tools, and core system utilities.",
    avgSalary: "$145,000",
    demandLevel: "High",
    skills: ["go", "rust", "cpp", "linux_bash", "docker", "kubernetes", "system_design", "monitoring_observability"],
  },
  {
    id: "data_analyst",
    title: "Data Analyst & BI Specialist",
    category: "Data & AI",
    description: "Extracts insights from business data using SQL querying, statistical data manipulation, and visualization dashboards.",
    avgSalary: "$90,000",
    demandLevel: "Very High",
    skills: ["sql", "python", "pandas_numpy", "data_modeling_dwh", "product_strategy"],
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    category: "Data & AI",
    description: "Applies advanced statistical modeling, predictive analytics, and exploratory algorithms to solve complex business problems.",
    avgSalary: "$130,000",
    demandLevel: "Very High",
    skills: ["python", "sql", "pandas_numpy", "machine_learning", "data_modeling_dwh", "agile_scrum"],
  },
  {
    id: "ml_engineer",
    title: "Machine Learning Engineer",
    category: "Data & AI",
    description: "Productionizes ML models, designs scalable inference APIs, and maintains MLOps pipelines.",
    avgSalary: "$148,000",
    demandLevel: "Extremely High",
    skills: ["python", "pandas_numpy", "machine_learning", "deep_learning_pytorch", "fastapi_django", "docker", "cloud_architecture", "llm_rag_engineering"],
  },
  {
    id: "ai_engineer",
    title: "AI / GenAI Applications Engineer",
    category: "Data & AI",
    description: "Specializes in building intelligent agentic systems, RAG workflows, vector databases, and LLM integrations.",
    avgSalary: "$155,000",
    demandLevel: "Explosive Growth",
    skills: ["python", "typescript", "llm_rag_engineering", "fastapi_django", "nextjs", "docker", "cloud_architecture", "system_design"],
  },
  {
    id: "data_engineer",
    title: "Big Data Engineer",
    category: "Data & AI",
    description: "Builds high-throughput ETL/ELT pipelines, data lakes, and scalable analytical warehousing architectures.",
    avgSalary: "$135,000",
    demandLevel: "Very High",
    skills: ["python", "sql", "data_pipelines_spark", "data_modeling_dwh", "aws_cloud", "docker", "terraform_iac"],
  },
  {
    id: "devops_engineer",
    title: "DevOps / Automation Engineer",
    category: "Cloud & DevOps",
    description: "Automates continuous delivery pipelines, manages container infrastructure, and ensures rapid software release velocity.",
    avgSalary: "$130,000",
    demandLevel: "Very High",
    skills: ["linux_bash", "docker", "kubernetes", "cicd_pipelines", "terraform_iac", "aws_cloud", "monitoring_observability", "python"],
  },
  {
    id: "cloud_architect",
    title: "Cloud Solutions Architect",
    category: "Cloud & DevOps",
    description: "Designs enterprise-grade multi-cloud topologies, disaster recovery setups, cost-optimized resources, and secure cloud governance.",
    avgSalary: "$165,000",
    demandLevel: "Very High",
    skills: ["aws_cloud", "gcp_cloud", "terraform_iac", "kubernetes", "cloud_architecture", "system_design", "network_security_iam", "microservices_patterns"],
  },
  {
    id: "sre_engineer",
    title: "Site Reliability Engineer (SRE)",
    category: "Cloud & DevOps",
    description: "Applies software engineering principles to infrastructure operations, SLO management, and incident response.",
    avgSalary: "$142,000",
    demandLevel: "High",
    skills: ["linux_bash", "go", "python", "kubernetes", "monitoring_observability", "sre_reliability", "terraform_iac", "system_design"],
  },
  {
    id: "cybersecurity_engineer",
    title: "Cybersecurity & Application Security Engineer",
    category: "Cybersecurity & QA",
    description: "Hardens applications and infrastructure against threats, performs vulnerability audits, and enforces Zero Trust IAM.",
    avgSalary: "$138,000",
    demandLevel: "Very High",
    skills: ["cybersecurity_owasp", "network_security_iam", "linux_bash", "python", "aws_cloud", "docker", "system_design"],
  },
  {
    id: "qa_automation_engineer",
    title: "QA Automation & SDET Engineer",
    category: "Cybersecurity & QA",
    description: "Architects end-to-end automated testing frameworks, CI/CD quality gates, and performance benchmarking suites.",
    avgSalary: "$110,000",
    demandLevel: "High",
    skills: ["javascript", "python", "automated_testing", "cicd_pipelines", "docker", "agile_scrum", "sql"],
  },
  {
    id: "tech_lead",
    title: "Technical Lead / Engineering Manager",
    category: "Leadership & Strategy",
    description: "Mentors engineering teams, drives system architecture decisions, aligns technical roadmaps with business milestones.",
    avgSalary: "$160,000",
    demandLevel: "High",
    skills: ["system_design", "microservices_patterns", "cloud_architecture", "agile_scrum", "product_strategy", "cicd_pipelines", "javascript", "python"],
  },
  {
    id: "product_manager",
    title: "Technical Product Manager (TPM)",
    category: "Leadership & Strategy",
    description: "Translates user pain points and strategic goals into actionable technical specifications, sprints, and product KPIs.",
    avgSalary: "$135,000",
    demandLevel: "Very High",
    skills: ["product_strategy", "agile_scrum", "sql", "system_design", "cloud_architecture", "pandas_numpy"],
  },
];

// -----------------------------------------------------------------------------
// POPULAR ROLE TRANSITIONS (Quick presets for users)
// -----------------------------------------------------------------------------

export const POPULAR_TRANSITIONS = [
  {
    id: "fe_to_fs",
    title: "Frontend Developer ➔ Full Stack Developer",
    from: "frontend_dev",
    to: "fullstack_dev",
    badge: "Most Popular",
  },
  {
    id: "be_to_cloud",
    title: "Backend Engineer ➔ Cloud Solutions Architect",
    from: "backend_dev",
    to: "cloud_architect",
    badge: "High Earning",
  },
  {
    id: "da_to_ds",
    title: "Data Analyst ➔ Data Scientist",
    from: "data_analyst",
    to: "data_scientist",
    badge: "Natural Progression",
  },
  {
    id: "swe_to_ml",
    title: "Software Engineer ➔ Machine Learning Engineer",
    from: "fullstack_dev",
    to: "ml_engineer",
    badge: "AI Boom",
  },
  {
    id: "devops_to_sre",
    title: "DevOps Engineer ➔ Site Reliability Engineer (SRE)",
    from: "devops_engineer",
    to: "sre_engineer",
    badge: "Infrastructure",
  },
  {
    id: "swe_to_ai",
    title: "Full Stack Developer ➔ AI / GenAI Applications Engineer",
    from: "fullstack_dev",
    to: "ai_engineer",
    badge: "Hot Trend",
  },
  {
    id: "qa_to_sdet",
    title: "QA Automation Engineer ➔ DevOps Engineer",
    from: "qa_automation_engineer",
    to: "devops_engineer",
    badge: "Career Boost",
  },
  {
    id: "swe_to_lead",
    title: "Full Stack Developer ➔ Technical Lead / EM",
    from: "fullstack_dev",
    to: "tech_lead",
    badge: "Leadership",
  },
];

// -----------------------------------------------------------------------------
// SKILL GAP ALGORITHM & ROADMAP GENERATOR
// -----------------------------------------------------------------------------

export function calculateSkillGap(currentRoleId, targetRoleId, customPresentSkills = []) {
  const currentRole = ROLES_DATABASE.find((r) => r.id === currentRoleId) || { title: "Custom Baseline", skills: [] };
  const targetRole = ROLES_DATABASE.find((r) => r.id === targetRoleId) || { title: "Custom Target", skills: [] };

  // Combined present skills = skills from current role + any custom skills the user checked off
  const presentSkillsSet = new Set([...currentRole.skills, ...customPresentSkills]);
  const targetSkillsList = targetRole.skills || [];

  const matchingSkillIds = targetSkillsList.filter((sid) => presentSkillsSet.has(sid));
  const missingSkillIds = targetSkillsList.filter((sid) => !presentSkillsSet.has(sid));

  const matchPercentage = targetSkillsList.length > 0
    ? Math.round((matchingSkillIds.length / targetSkillsList.length) * 100)
    : 100;

  // Resolve full skill objects
  const matchingSkills = matchingSkillIds
    .map((id) => SKILLS_POOL[id])
    .filter(Boolean);

  const missingSkills = missingSkillIds
    .map((id) => SKILLS_POOL[id])
    .filter(Boolean);

  // Topologically sort missing skills based on prerequisites & importance
  const sortedMissingSkills = sortSkillsTopologicallyAndByImportance(missingSkills, presentSkillsSet);

  // Category-wise Breakdown (for charts and radar)
  const categoryStats = {};
  Object.keys(SKILL_CATEGORIES).forEach((catKey) => {
    categoryStats[catKey] = {
      name: SKILL_CATEGORIES[catKey].name,
      color: SKILL_CATEGORIES[catKey].color,
      targetCount: 0,
      matchingCount: 0,
      percentage: 100,
    };
  });

  targetSkillsList.forEach((sid) => {
    const skillObj = SKILLS_POOL[sid];
    if (skillObj && categoryStats[skillObj.category]) {
      categoryStats[skillObj.category].targetCount += 1;
      if (presentSkillsSet.has(sid)) {
        categoryStats[skillObj.category].matchingCount += 1;
      }
    }
  });

  Object.keys(categoryStats).forEach((catKey) => {
    const st = categoryStats[catKey];
    st.percentage = st.targetCount > 0 ? Math.round((st.matchingCount / st.targetCount) * 100) : 100;
  });

  // Calculate estimated learning time
  const totalMissingHours = sortedMissingSkills.reduce((acc, sk) => acc + (sk.estimatedHours || 30), 0);
  
  // Group into Roadmap Milestones / Phases
  const roadmapPhases = generateMilestonePhases(sortedMissingSkills);

  return {
    currentRole,
    targetRole,
    matchingSkills,
    missingSkills: sortedMissingSkills,
    matchPercentage,
    totalMissingHours,
    categoryStats: Object.values(categoryStats).filter((c) => c.targetCount > 0 || c.matchingCount > 0),
    roadmapPhases,
  };
}

function sortSkillsTopologicallyAndByImportance(skills, presentSet) {
  const importanceRank = { Critical: 3, High: 2, "Nice-to-Have": 1 };
  
  return [...skills].sort((a, b) => {
    // Check if b is a prerequisite of a
    if (a.prerequisites && a.prerequisites.includes(b.id)) return 1;
    if (b.prerequisites && b.prerequisites.includes(a.id)) return -1;

    // Check importance
    const impA = importanceRank[a.importance] || 1;
    const impB = importanceRank[b.importance] || 1;
    if (impA !== impB) return impB - impA;

    // Check difficulty (Beginner -> Intermediate -> Advanced)
    const diffRank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
    return (diffRank[a.difficulty] || 2) - (diffRank[b.difficulty] || 2);
  });
}

function generateMilestonePhases(sortedMissingSkills) {
  if (sortedMissingSkills.length === 0) return [];

  const phases = [
    {
      phaseNumber: 1,
      title: "Phase 1: Core Fundamentals & Syntax",
      description: "Master essential core tools, prerequisites, and foundational syntax necessary for immediate productivity.",
      skills: [],
      hours: 0,
      badgeColor: "cyan",
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Frameworks, Systems & Infrastructure",
      description: "Build robust hands-on expertise with industry-standard frameworks, cloud infrastructure, and architectural best practices.",
      skills: [],
      hours: 0,
      badgeColor: "purple",
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Advanced Capstone & Mastery",
      description: "Achieve senior-level competency through high-complexity system design, specialization certifications, and end-to-end projects.",
      skills: [],
      hours: 0,
      badgeColor: "amber",
    },
  ];

  sortedMissingSkills.forEach((skill, index) => {
    let targetPhaseIndex = 0;
    if (skill.difficulty === "Beginner" || index < Math.ceil(sortedMissingSkills.length / 3)) {
      targetPhaseIndex = 0;
    } else if (skill.difficulty === "Intermediate" || index < Math.ceil((sortedMissingSkills.length * 2) / 3)) {
      targetPhaseIndex = 1;
    } else {
      targetPhaseIndex = 2;
    }

    phases[targetPhaseIndex].skills.push(skill);
    phases[targetPhaseIndex].hours += skill.estimatedHours || 30;
  });

  return phases.filter((p) => p.skills.length > 0);
}
