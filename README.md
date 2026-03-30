# 🎓 NUMockBuddy — AI-Powered Mock Interview Platform

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![AssemblyAI](https://img.shields.io/badge/AssemblyAI-FF0000?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-numockbuddy.netlify.app-brightgreen?style=for-the-badge)](https://numockbuddy.netlify.app/)

---

> **AI-powered mock interview prep built exclusively for Northeastern University students & alumni.**
> Practice with realistic questions, get scored by 6 parallel AI expert reviewers, analyze your resume against real job descriptions, and book 1-on-1 sessions with NU students who've already landed their dream co-op.

---

## 🚀 Live Demo

**[https://numockbuddy.netlify.app/](https://numockbuddy.netlify.app/)**

---

## 🌟 Project Overview

**NUMockBuddy** is the most thorough interview prep platform for the NU community, providing data-driven personalized preparation from practice to final offer. The platform uses a composite scoring panel of multi-expert Claude AI, real-time AssemblyAI transcription, computer vision body language analysis, and a LangChain RAG resume coach.

---

## Features

### AI Mock Interview (Practice)
- 4-step setup: job type, company, role, and interview type (Technical / Behavioral / System Design / HR)
- Supports 11 role types: SWE, Data Science, ML Engineer, TPM, Product Manager, Audit, and more
- Live interview session with camera, microphone, and optional whiteboard (Excalidraw)
- In-browser code editor (Monaco Editor) for technical questions
- Real-time speech-to-text transcription via AssemblyAI
- Filler word detection and repeated-phrase tracking
- Post-session scoring by a panel of 6 AI experts (Communication, Technical, Problem-Solving, Behavioral, Confidence, Overall) powered by Claude
- Model answers for every question (code solutions or STAR-format answers depending on interview type)
- Body language analysis: eye contact, confidence, and engagement scores from recorded video
- Full results page with scores, strengths, improvements, and side-by-side model answer comparison

### Dashboard
- Personal stats overview: total sessions, average score, best score, and practice streak
- Score trend bar chart with filters (All Time, This Month, Technical Only, Behavioral Only)
- Latest session card with body language metrics (eye contact, confidence, engagement)
- Full session history table with verdict badges and detailed per-session stats

### Resume AI
- Three-tab interface: Job Description Analysis, ATS Scanner, and AI Resume Chat
- **JD Analysis**: upload or paste resume + paste a job description → AI scores keyword match, seniority signal, formatting issues, action verbs, missing metrics, and more
- **ATS Scanner**: upload resume + select company → ATS pass probability with company-specific keyword requirements
- **AI Chat**: RAG-powered resume coach — ask questions about your resume in natural language
- Supports PDF upload and text paste; PDF preview panel

### Peer Volunteers
- Browse NU students with co-op/internship experience at companies like Google, Amazon, Microsoft, Fidelity
- Filter by company, role, or availability
- Calendar-based booking: pick a date, pick a time slot, enter your email → confirmation sent to both parties
- Volunteer signup flow: 2-step form (profile + availability calendar)

### Authentication
- NUID-based login ("Sign in with NUid")
- Session managed via `nuid` cookie, checked across all protected routes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, inline styles, Tailwind CSS 4 |
| AI / LLM | Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` |
| Speech-to-Text | AssemblyAI |
| RAG / Embeddings | LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/community`) |
| Database ORM | Prisma 7 with Prisma Accelerate |
| Database | PostgreSQL (via `pg`) |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Whiteboard | Excalidraw (`@excalidraw/excalidraw`) |
| Charts | Recharts |
| PDF Parsing | `pdf-parse`, `pdfjs-dist` |
| DOCX Parsing | `mammoth` |
| Email | Nodemailer, Resend |
| Auth | `bcryptjs`, custom cookie-based session |
| Deployment | Netlify |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Richa-04/NUMockBuddy.git
cd NUMockBuddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Database (Prisma Accelerate URL)
DATABASE_URL=prisma+postgres://<accelerate-host>/?api_key=<your-key>

# Direct PostgreSQL connection (required for prisma migrate dev)
DIRECT_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...

# AssemblyAI (speech transcription)
ASSEMBLYAI_API_KEY=...

# OpenAI (LangChain embeddings for Resume AI chat)
OPENAI_API_KEY=sk-...

# Email (Resend — for volunteer booking confirmations)
RESEND_API_KEY=re_...
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

> Requires `DIRECT_URL` to be set. Prisma Accelerate does not support `migrate dev`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma Accelerate connection string |
| `DIRECT_URL` | Yes (migrations) | Direct PostgreSQL URL for `prisma migrate` |
| `ANTHROPIC_API_KEY` | Yes | Powers interview scoring and model answers |
| `ASSEMBLYAI_API_KEY` | Yes | Real-time speech-to-text transcription |
| `OPENAI_API_KEY` | Yes | LangChain embeddings for Resume AI RAG chat |
| `RESEND_API_KEY` | Yes | Email confirmations for volunteer bookings |

---

## License

This project was built for educational purposes at Northeastern University.
