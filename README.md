<div align="center">
  <img src="public/logo.svg" alt="Career Lens Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
  
  <h1 style="margin-top: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 3rem; font-weight: 800;">
    Career Lens
  </h1>
  
  <p style="font-size: 1.25rem; color: #64748b; max-width: 600px; margin: 1rem auto; line-height: 1.6;">
    <strong>AI-Powered Career Guide Companion</strong> — Your intelligent partner for resume optimization, career coaching, job matching, and professional growth.
  </p>

  <div style="margin: 1.5rem 0;">
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Ready">
    <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Auth">
    <img src="https://img.shields.io/badge/Google_GenAI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google GenAI">
    <img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay">
    <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  </div>

  <div style="margin: 1.5rem 0;">
    <a href="#-quick-start" style="margin: 0 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Quick Start</a>
    <a href="#-features" style="margin: 0 0.5rem; padding: 0.75rem 1.5rem; background: transparent; color: #667eea; border: 2px solid #667eea; border-radius: 8px; text-decoration: none; font-weight: 600;">Features</a>
    <a href="#-api-reference" style="margin: 0 0.5rem; padding: 0.75rem 1.5rem; background: transparent; color: #64748b; border: 2px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-weight: 600;">API Docs</a>
    <a href="#-architecture" style="margin: 0 0.5rem; padding: 0.75rem 1.5rem; background: transparent; color: #64748b; border: 2px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-weight: 600;">Architecture</a>
  </div>
</div>

---

## 📋 Table of Contents

<details open>
<summary><strong>Click to expand/collapse</strong></summary>

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📁 Project Structure](#-project-structure)
- [🔌 API Reference](#-api-reference)
- [🤖 AI Capabilities](#-ai-capabilities)
- [💳 Payment Integration](#-payment-integration)
- [🐳 Docker Deployment](#-docker-deployment)
- [🧪 Development](#-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

</details>

---

## 🎯 Overview

**Career Lens** is a modern, AI-driven career platform built with **Next.js 15** (App Router) that empowers job seekers and professionals with intelligent tools for career advancement. The platform combines **Google's Generative AI** with a beautiful, responsive UI to deliver personalized career guidance at scale.

### Why Career Lens?

| Challenge | Career Lens Solution |
|-----------|---------------------|
| 📄 Generic resumes | AI-powered resume analysis & ATS optimization |
| 🎯 Unclear career path | Personalized AI career coach with contextual advice |
| 🔍 Job search fatigue | Intelligent job matching based on skills & preferences |
| ✍️ Poor resume writing | AI resume refinement with industry-specific keywords |
| 💰 Expensive career coaches | Affordable, 24/7 AI companion with premium tiers |

### Target Users
- **Job Seekers** — Fresh graduates to senior professionals
- **Career Switchers** — Transitioning between industries/roles
- **Recruiters** — Screening candidates with AI-assisted analysis
- **Universities** — Career services for students & alumni

---

## ✨ Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Secure Authentication** | Firebase Auth with email/password, email verification, password reset | ✅ Live |
| 🤖 **AI Career Coach** | Conversational AI for career guidance, interview prep, skill gaps | ✅ Live |
| 📊 **Resume Analysis** | ATS scoring, keyword optimization, section-by-section feedback | ✅ Live |
| 🎯 **Job Matching** | Semantic matching against job descriptions with fit scoring | ✅ Live |
| ✨ **Resume Refinement** | AI rewriting with industry keywords, action verbs, quantifiable results | ✅ Live |
| 💳 **Premium Tiers** | Razorpay integration for subscription management | ✅ Live |
| 📱 **Responsive Dashboard** | Mobile-first design with Framer Motion animations | ✅ Live |
| 🌙 **Dark Mode Ready** | Tailwind CSS dark mode support (configurable) | 🚧 Planned |

</div>

### Feature Deep Dive

<details>
<summary><strong>🤖 AI Career Coach</strong> — Conversational career guidance</summary>

- **Context-aware conversations** — Remembers user profile, resume, and goals
- **Interview simulation** — Role-specific mock interviews with feedback
- **Skill gap analysis** — Identifies missing skills for target roles
- **Career roadmap generation** — Step-by-step progression plans
- **Powered by** Google Gemini 1.5 Flash / Pro via `@google/generative-ai`

</details>

<details>
<summary><strong>📊 Resume Analysis</strong> — ATS-optimized scoring</summary>

- **Overall ATS Score** (0-100) with breakdown
- **Keyword matching** against target job descriptions
- **Section analysis**: Summary, Experience, Education, Skills, Projects
- **Format validation** — PDF parsing, structure checking
- **Actionable recommendations** with priority levels

</details>

<details>
<summary><strong>🎯 Job Matching</strong> — Semantic job compatibility</summary>

- **Vector-based matching** using embeddings
- **Fit score calculation** (skills, experience, culture, location)
- **Gap highlighting** — Missing requirements visualization
- **Application readiness** checklist per job
- **Bulk analysis** for multiple job postings

</details>

<details>
<summary><strong>✨ Resume Refinement</strong> — AI-powered rewriting</summary>

- **Bullet point enhancement** — STAR method implementation
- **Keyword injection** — ATS-friendly terminology
- **Tone adjustment** — Professional, creative, technical, executive
- **Length optimization** — One-page vs. two-page formats
- **Version history** — Compare and revert changes

</details>

---

## 🛠 Tech Stack

### Core Framework
```mermaid
graph LR
    A[Next.js 15<br/>App Router] --> B[React 19<br/>Server Components]
    A --> C[Tailwind CSS 3.4<br/>Utility-first]
    A --> D[Framer Motion<br/>Animations]
```

### AI & Data
| Category | Technology | Purpose |
|----------|------------|---------|
| **LLM** | Google Generative AI (Gemini) | Career coaching, resume analysis |
| **Embeddings** | Google AI Embeddings | Job matching, semantic search |
| **Parsing** | PDF.js / Custom | Resume text extraction |
| **Database** | Firebase Firestore | User data, sessions, history |

### UI & Components
| Library | Version | Usage |
|---------|---------|-------|
| **Radix UI** | Latest | Accessible primitives (Dropdown, Dialog, etc.) |
| **Lucide React** | Latest | Icon system |
| **React Hot Toast** | Latest | Notifications |
| **React Markdown** | Latest | AI response rendering |
| **class-variance-authority** | Latest | Component variants |
| **tailwind-merge** | Latest | ClassName merging |

### Infrastructure & Payments
| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting, Edge Functions, Analytics |
| **Firebase Auth** | Authentication, user management |
| **Razorpay** | Subscription payments (INR) |
| **GitHub Actions** | CI/CD (configured) |

### Developer Experience
```json
{
  "linting": "ESLint 9 + Next.js config",
  "formatting": "Prettier (implied)",
  "compiler": "Babel React Compiler (experimental)",
  "css": "PostCSS + Tailwind CSS v4 (via @tailwindcss/postcss)",
  "types": "JSDoc + jsconfig.json (TypeScript-ready)"
}
```

---

## 🏗 Architecture

### High-Level System Design

```mermaid
graph TB

    subgraph Client["🌐 Client (Next.js App Router)"]
        A["Landing Page"] --> B["Authentication"]
        B --> C["Dashboard"]

        C --> D["AI Career Coach"]
        C --> E["Resume Analysis"]
        C --> F["Resume Refinement"]
        C --> G["Job Matching"]
        C --> H["Profile & Billing"]
    end

    subgraph API["⚡ Next.js API Routes"]
        I["/api/ai-coach"]
        J["/api/parse-resume"]
        K["/api/resume-refine"]
        L["/api/jobs"]
        M["/api/create-order"]
    end

    subgraph AI["🤖 AI & Processing"]
        N["Google Gemini API"]
        O["Resume Parser"]
        P["Job Matching Logic"]
    end

    subgraph Backend["☁️ Backend Services"]
        Q["Firebase Authentication"]
        R["Cloud Firestore"]
    end

    subgraph Payments["💳 Payment Gateway"]
        S["Razorpay"]
    end

    D --> I
    E --> J
    F --> K
    G --> L
    H --> M

    I --> N
    J --> O
    J --> N
    K --> N
    L --> P
    L --> R
    M --> S

    Q --> R
```

### Request Flow

```mermaid
sequenceDiagram
    participant User
    participant Client as Next.js Client
    participant API as API Routes
    participant Gemini as Google Gemini
    participant Firebase
    participant Firestore
    participant Razorpay

    User->>Client: Login
    Client->>Firebase: Authenticate
    Firebase-->>Client: Session

    User->>Client: Upload Resume
    Client->>API: POST /api/parse-resume
    API->>Gemini: Analyze Resume
    Gemini-->>API: ATS Score & Suggestions
    API->>Firestore: Save Analysis
    API-->>Client: Results

    User->>Client: Ask Career Question
    Client->>API: POST /api/ai-coach
    API->>Gemini: Generate Response
    Gemini-->>API: Career Advice
    API-->>Client: AI Response

    User->>Client: Refine Resume
    Client->>API: POST /api/resume-refine
    API->>Gemini: Rewrite Resume
    Gemini-->>API: Optimized Resume
    API-->>Client: Updated Resume

    User->>Client: Match Jobs
    Client->>API: POST /api/jobs
    API->>Firestore: Fetch Profile
    Firestore-->>API: User Data
    API-->>Client: Match Score & Recommendations

    User->>Client: Upgrade Plan
    Client->>API: POST /api/create-order
    API->>Razorpay: Create Order
    Razorpay-->>Client: Checkout Session
```

### Component Architecture

```mermaid
graph LR

    A["Next.js 15 App Router"]

    A --> B["Landing Pages"]
    A --> C["Authentication"]
    A --> D["Dashboard"]

    D --> E["Career Coach"]
    D --> F["Resume Analysis"]
    D --> G["Resume Refinement"]
    D --> H["Job Matching"]
    D --> I["Billing"]

    E --> J["Google Gemini"]
    F --> J
    G --> J

    C --> K["Firebase Auth"]
    D --> L["Cloud Firestore"]
    I --> M["Razorpay"]
```

### Data Flow

```mermaid
flowchart LR

    User --> UI["Next.js UI"]

    UI --> Auth["Firebase Auth"]

    UI --> API["API Routes"]

    API --> Gemini["Google Gemini"]

    API --> Firestore["Cloud Firestore"]

    API --> Razorpay["Razorpay"]

    Gemini --> API

    Firestore --> API

    API --> UI

    UI --> User
```

### Architecture Highlights

- **Next.js 15 App Router** powers the frontend using Server and Client Components.
- **API Routes** handle AI processing, resume parsing, job matching, and payment requests.
- **Google Gemini** provides AI-powered career coaching, resume analysis, and resume refinement.
- **Firebase Authentication** secures user login and protected dashboard access.
- **Cloud Firestore** stores user profiles, resume history, and application data.
- **Razorpay** manages premium subscriptions and payment processing.
- **Tailwind CSS + Framer Motion + Radix UI** provide a modern, responsive user experience.
- **Modular architecture** separates UI, business logic, external integrations, and data storage for easier maintenance and scalability.


### Architecture Highlights

- **App Router** based routing with Server and Client Components
- **API Routes** encapsulate all AI and payment operations
- **Firebase Authentication** protects premium dashboard features
- **Firestore** stores user profiles, history, and preferences
- **Google Gemini** powers resume analysis, coaching, and refinement
- **Razorpay** manages secure subscription payments
- **Responsive UI** built with reusable components and Tailwind CSS

---

# 🚀 Quick Start

## Prerequisites

Before running the project, ensure you have installed:

- Node.js **18+**
- npm / pnpm / yarn
- Firebase Project
- Google AI Studio API Key
- Razorpay Test Keys

---

## Clone Repository

```bash
git clone https://github.com/dharunkumar-sh/career-lens.git

cd career-lens
```

---

## Install Dependencies

```bash
npm install
```

or

```bash
pnpm install
```

---

## Configure Environment Variables

Create a `.env.local`

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google AI
GOOGLE_AI_API_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Start Development Server

```bash
npm run dev
```

Application will be available at

```
http://localhost:3000
```

---

# ⚙️ Configuration

## Firebase

1. Create a Firebase project.
2. Enable Authentication.
3. Enable Firestore Database.
4. Add localhost to Authorized Domains.

---

## Google Gemini

1. Visit Google AI Studio.
2. Generate an API Key.
3. Add it to `.env.local`.

---

## Razorpay

Create Test Keys

```
KEY_ID
KEY_SECRET
```

Enable Webhooks for production deployments.

---

# 📁 Project Structure

```text
career-lens/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── login/
│   ├── signup/
│   └── page.js
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── landing/
│   └── shared/
│
├── context/
│
├── hooks/
│
├── lib/
│
├── public/
│
├── styles/
│
├── utils/
│
├── firebase/
│
├── middleware.js
│
├── next.config.mjs
│
├── package.json
│
└── README.md
```

---

# 🔌 API Reference

## AI Career Coach

```
POST /api/ai-coach
```

Request

```json
{
  "message":"How can I become a frontend developer?"
}
```

Response

```json
{
  "reply":"..."
}
```

---

## Resume Analysis

```
POST /api/parse-resume
```

Input

- PDF Resume

Output

```json
{
  "score":87,
  "feedback":[]
}
```

---

## Resume Refinement

```
POST /api/resume-refine
```

Returns improved resume content.

---

## Job Matching

```
POST /api/jobs
```

Returns

- Match Score
- Missing Skills
- Suggestions

---

## Payment

```
POST /api/create-order
```

Creates Razorpay Order.

---

# 🤖 AI Capabilities

Career Lens leverages **Google Gemini** for:

- Resume parsing
- Resume rewriting
- ATS optimization
- Career coaching
- Interview preparation
- Skill gap analysis
- Job compatibility scoring
- Personalized recommendations

---

# 💳 Payment Integration

Premium plans are powered by Razorpay.

### Features

- Secure Checkout
- Order Creation
- Subscription Plans
- Premium Dashboard Unlock
- Test & Live Mode Support

---

# 🐳 Docker Deployment

Build image

```bash
docker build -t career-lens .
```

Run

```bash
docker run -p 3000:3000 career-lens
```

---

# 🧪 Development

Run Development

```bash
npm run dev
```

Lint

```bash
npm run lint
```

Production Build

```bash
npm run build
```

Start Production

```bash
npm start
```

---

# 📈 Future Roadmap

- AI Interview Simulator
- Resume Version Control
- LinkedIn Profile Analyzer
- Portfolio Review
- AI Cover Letter Generator
- Recruiter Dashboard
- Company Insights
- Analytics Dashboard
- Mobile Application
- Dark Mode

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit

```bash
git commit -m "Add amazing feature"
```

4. Push

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

## ⭐ Show your support

If you found this project helpful, consider giving it a ⭐ on GitHub.

Made with ❤️ using **Next.js**, **Google Gemini**, **Firebase**, and **Razorpay**.

</div>
