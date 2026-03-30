"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const RED = "#C8102E";

const CATEGORIES = [
  { id: "all", label: "All Articles", icon: "📚" },
  { id: "getting-started", label: "Getting Started", icon: "🎯" },
  { id: "practice", label: "Mock Interview Practice", icon: "🎤" },
  { id: "resume", label: "Resume AI", icon: "📄" },
  { id: "mentors", label: "Peer Mentors", icon: "🤝" },
  { id: "account", label: "Account & Support", icon: "🔐" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "accessibility", label: "Accessibility", icon: "♿" },
];

const ARTICLES = [
  { id:"1", icon:"🎯", category:"getting-started", title:"What is NUMockBuddy and how does it work?", preview:"NUMockBuddy is an AI-powered mock interview platform built for Northeastern Seattle students.", content:[{type:"text",text:"NUMockBuddy is an AI-powered mock interview platform built specifically for Northeastern University Seattle students in the MSIS and MSCS programs."},{type:"heading",text:"The three core tools"},{type:"text",text:"Mock Interview Practice — Choose from 30+ company-specific question sets based on actual interview patterns. Submit your answers and get instant feedback from 6 AI expert reviewers."},{type:"text",text:"Peer Volunteer Mentors — Connect with current and former NU Seattle students who have already landed co-ops at top companies."},{type:"text",text:"Resume AI — Upload your resume as a PDF and paste a job description to get ATS compatibility check, keyword alignment score, and formatting suggestions."},{type:"heading",text:"Who is it for?"},{type:"text",text:"NUMockBuddy is free for all Northeastern Seattle students. It works entirely in your browser with no downloads required."}] },
  { id:"2", icon:"🔐", category:"account", title:"How to register on NUMockBuddy", preview:"Creating your account takes under a minute using your existing NU credentials.", content:[{type:"text",text:"Creating your NUMockBuddy account takes under a minute and requires no separate sign-up form."},{type:"heading",text:"Step 1 — Go to the homepage"},{type:"text",text:"Visit the NUMockBuddy homepage and click Sign in with NUid in the top right corner of the navigation bar."},{type:"heading",text:"Step 2 — Authenticate with your NU credentials"},{type:"text",text:"Use the same username and password you use for Canvas, MyNortheastern, and other NU systems."},{type:"heading",text:"Step 3 — You are in"},{type:"text",text:"Once authenticated, you are automatically returned to NUMockBuddy with your account created. Your profile is linked to your NU identity."},{type:"heading",text:"Who can register?"},{type:"text",text:"NUMockBuddy is available to Northeastern University Seattle students enrolled in MSIS or MSCS programs. If you have a valid NUid, you are eligible."}] },
  { id:"3", icon:"🎤", category:"practice", title:"How to practice mock interviews", preview:"Start a practice session and get AI-powered feedback from 6 reviewers in minutes.", content:[{type:"text",text:"Practicing on NUMockBuddy takes about 10-15 minutes per session and gives you immediate detailed feedback."},{type:"heading",text:"Step 1 — Choose a company or role"},{type:"text",text:"Click Practice in the nav bar. Browse interview sets by company (Google, Amazon, Microsoft, Meta, Fidelity, and 25+ more) or by role type."},{type:"heading",text:"Step 2 — Answer the questions"},{type:"text",text:"Write your answers the way you would speak them in a real interview. Use full sentences and the STAR format for behavioral questions."},{type:"heading",text:"Step 3 — Submit and review feedback"},{type:"text",text:"6 AI expert reviewers independently score your response covering clarity, structure, relevance, depth, and overall impression."},{type:"heading",text:"Tips for better results"},{type:"text",text:"Be specific. The AI only evaluates what you actually wrote. Mention technologies, numbers, and real outcomes. The more concrete your answer, the more precise the feedback."}] },
  { id:"4", icon:"🤖", category:"practice", title:"How AI feedback works after your interview", preview:"NUMockBuddy uses 6 independent AI reviewers to score and comment on every answer you submit.", content:[{type:"text",text:"NUMockBuddy uses 6 AI expert reviewers to evaluate every practice answer you submit."},{type:"heading",text:"The 6 reviewers"},{type:"text",text:"Each reviewer acts as a different type of interviewer: a senior technical lead, a hiring manager, a behavioral specialist, a communication coach, a culture-fit evaluator, and an overall assessor."},{type:"heading",text:"What they score"},{type:"text",text:"Each reviewer rates Clarity, Structure, Relevance, Depth, and Overall impression. Scores from all 6 reviewers combine into a final score out of 10."},{type:"heading",text:"No hallucination policy"},{type:"text",text:"The AI strictly evaluates what you wrote. It will never assume experience you did not mention or invent job titles and company names."}] },
  { id:"5", icon:"🤝", category:"mentors", title:"Finding and connecting with peer mentors", preview:"Connect with NU students who have already landed co-ops at Google, Amazon, Microsoft, and more.", content:[{type:"text",text:"The Volunteers section connects you with Northeastern Seattle students who have already completed co-ops at the companies you are targeting."},{type:"heading",text:"Browsing mentors"},{type:"text",text:"Click Volunteers in the nav bar. Each mentor card shows name, company, role, program, and availability. Filter by company or role type."},{type:"heading",text:"What mentors can help with"},{type:"text",text:"Mentors help with company-specific prep: what the interview process looked like, what questions came up, team culture, and what they wish they had done differently."},{type:"heading",text:"How to connect"},{type:"text",text:"Click a mentor profile to view their full bio. Send a connection request with a short note about what you want to work on."},{type:"heading",text:"Be prepared"},{type:"text",text:"Mentors volunteer their time. Come with specific questions ready — the more focused your ask, the more useful the session."}] },
  { id:"6", icon:"📄", category:"resume", title:"How to use the Resume AI feature", preview:"Upload your resume PDF and paste a JD to get an instant ATS score, keyword match, and suggestions.", content:[{type:"text",text:"Resume AI analyzes your resume against a specific job description and tells you exactly what to fix before applying."},{type:"heading",text:"Step 1 — Go to Resume AI"},{type:"text",text:"Click Resume in the nav bar. You will see three tabs: Resume Analysis, ATS Scanner, and Career Assistant."},{type:"heading",text:"Step 2 — Upload your resume"},{type:"text",text:"Select your resume PDF. Make sure it is not scanned or image-based — text must be selectable for the parser to work."},{type:"heading",text:"Step 3 — Paste a job description"},{type:"text",text:"Paste the full JD text. The more complete the JD, the better the match analysis."},{type:"heading",text:"Step 4 — Run the analysis"},{type:"text",text:"Click Analyze. Resume AI checks ATS compatibility, keyword alignment, formatting issues, and content gaps."},{type:"heading",text:"Step 5 — Use Career Assistant"},{type:"text",text:"Switch to Career Assistant to have a full conversation about your resume. It only references what is literally in your resume and the JD."}] },
  { id:"7", icon:"💡", category:"practice", title:"Tips for your first mock interview session", preview:"Make the most of your first practice session with these preparation strategies.", content:[{type:"text",text:"Your first session sets the tone. Here is how to get real actionable feedback right away."},{type:"heading",text:"Pick a real target"},{type:"text",text:"Choose a company you are genuinely applying to. The feedback feels more meaningful when the stakes feel real."},{type:"heading",text:"Write like you speak"},{type:"text",text:"Avoid bullet points and headers. Write in full sentences. The AI scores narrative quality and fragmented lists score poorly."},{type:"heading",text:"Use STAR for behavioral questions"},{type:"text",text:"Situation (brief context), Task (your responsibility), Action (what you specifically did), Result (quantify the outcome if possible)."},{type:"heading",text:"Aim for consistency"},{type:"text",text:"Three sessions per week in the month before your co-op cycle opens will get you noticeably more confident."}] },
  { id:"8", icon:"❓", category:"account", title:"Frequently asked questions", preview:"Quick answers to the most common questions about NUMockBuddy.", faq:[{q:"Is NUMockBuddy free to use?",a:"Yes. NUMockBuddy is completely free for all Northeastern University Seattle students enrolled in MSIS or MSCS programs."},{q:"Do I need to download or install anything?",a:"No. NUMockBuddy is fully browser-based. It works on Chrome, Safari, Firefox, and Edge."},{q:"Can I use NUMockBuddy on my phone?",a:"Yes. The platform is mobile-responsive. All core features work on mobile browsers, though a laptop is recommended."},{q:"Is my data private?",a:"Yes. Your practice sessions, resume uploads, and chat history are only visible to you."},{q:"How many companies are available?",a:"NUMockBuddy covers 30+ companies including Google, Amazon, Microsoft, Meta, Apple, Fidelity, Salesforce, and Adobe."},{q:"Can I practice the same question multiple times?",a:"Yes. Each submission gets fresh AI feedback. Comparing attempts is one of the best ways to improve."},{q:"What if I find a bug?",a:"Go to the Feedback page, select Bug Report, describe what happened, and include a screenshot if possible."},{q:"Can I suggest a new feature?",a:"Yes. Go to Feedback, select Feature Request, and describe what you would like added."}] },
  { id:"9", icon:"📝", category:"account", title:"How to submit feedback on NUMockBuddy", preview:"Learn how to report bugs, rate sessions, or suggest new features using the feedback form.", content:[{type:"text",text:"Your feedback directly shapes what the NUMockBuddy team builds next."},{type:"heading",text:"Session Feedback"},{type:"text",text:"Rate the AI questions and feedback quality after a practice session. Was the question realistic? Was the feedback specific and actionable?"},{type:"heading",text:"Platform Feedback"},{type:"text",text:"Share your overall experience with NUMockBuddy: UI design, navigation, ease of use, and anything that felt confusing."},{type:"heading",text:"Peer Mentor Feedback"},{type:"text",text:"Rate a volunteer session on helpfulness, preparation, and professionalism."},{type:"heading",text:"Bug Report"},{type:"text",text:"Describe what broke, what you were doing, and what you expected. Attach a screenshot to help the team reproduce the issue."},{type:"heading",text:"Feature Request"},{type:"text",text:"Suggest a capability you wish NUMockBuddy had. Be specific about what you want and why."},{type:"heading",text:"What happens after you submit"},{type:"text",text:"All feedback is reviewed by the NUMockBuddy team. Bug reports are triaged for fixes and feature requests influence the roadmap."}] },,
  { id:"10", icon:"🤝", category:"mentors", title:"How to book a session with a volunteer mentor", preview:"Browse volunteers by company and skill, view their availability, and book a session in seconds.", content:[{type:"text",text:"The Volunteers page lets you find and book real Northeastern students who have already landed co-ops at your target companies."},{type:"heading",text:"Step 1 — Go to Volunteers"},{type:"text",text:"Click Volunteers in the nav bar. You will see a grid of mentor cards showing each person's name, company, role, and skills."},{type:"heading",text:"Step 2 — Filter by what you need"},{type:"text",text:"Use the Company and Skill filters at the top to narrow down mentors relevant to your target role. You can filter by company like Google or Amazon, or by skill like System Design or Python."},{type:"heading",text:"Step 3 — View a mentor profile"},{type:"text",text:"Click on any mentor card to see their full profile including their co-op experience, what they can help with, and their available time slots."},{type:"heading",text:"Step 4 — Book a slot"},{type:"text",text:"Select an available time slot and confirm your booking. You will receive a confirmation and the mentor will be notified."},{type:"heading",text:"Tips for a great session"},{type:"text",text:"Come prepared with specific questions about the company interview process, what the team culture is like, or how to frame your experience for that role. Mentors volunteer their time so the more focused you are, the more valuable the session."},{type:"faq",items:[{q:"Do I need to pay for mentor sessions?",a:"No. All volunteer mentors on NUMockBuddy donate their time for free."},{q:"What if a mentor cancels?",a:"You will be notified and can rebook with another mentor. Use the Feedback page to report any issues."}]}] },
  { id:"11", icon:"📊", category:"dashboard", title:"Understanding your performance dashboard", preview:"Track your interview scores, improvement trends, and activity history all in one place.", content:[{type:"text",text:"The Performance Dashboard gives you a complete view of your interview practice progress over time."},{type:"heading",text:"Overall score trend"},{type:"text",text:"The main chart shows your average score across all practice sessions. A rising trend means your answers are getting more structured, specific, and complete."},{type:"heading",text:"Sessions by company"},{type:"text",text:"See which companies you have practiced for most and how your scores compare across different interview types."},{type:"heading",text:"Reviewer breakdown"},{type:"text",text:"Each of the 6 AI reviewers scores you independently. The dashboard shows which reviewer categories you score highest and lowest in — helping you focus on weak areas."},{type:"heading",text:"Recent activity"},{type:"text",text:"The activity feed shows your most recent sessions with scores, so you can quickly jump back into a previous attempt and compare it to your latest."},{type:"heading",text:"Resume scan history"},{type:"text",text:"If you have used Resume AI, your ATS scores and keyword match history are also tracked here so you can see how your resume has improved over time."},{type:"faq",items:[{q:"Why is my dashboard empty?",a:"Complete at least one practice session or run a resume scan to start seeing data."},{q:"Can I delete old sessions?",a:"Currently sessions are retained to show your progress trend. Contact support if you need data removed."}]}] },
  { id:"12", icon:"♿", category:"accessibility", title:"Using the Accessibility Menu", preview:"The red circle button at the bottom left opens tools for font size, color modes, dyslexia font, and more.", content:[{type:"text",text:"NUMockBuddy includes a built-in accessibility menu designed to make the platform usable for everyone."},{type:"heading",text:"Opening the menu"},{type:"text",text:"Click the red circle button with the accessibility icon at the bottom left of any page. The panel slides open with all available options."},{type:"heading",text:"Font size"},{type:"text",text:"Use the slider to increase or decrease the font size across the entire page. This affects all body text, labels, and headings."},{type:"heading",text:"Content adjustments"},{type:"text",text:"Highlight links and titles to make them stand out. Enable Dyslexia-friendly font to switch to a typeface that is easier to read for users with dyslexia. Increase letter spacing and line height for better readability."},{type:"heading",text:"Color adjustments"},{type:"text",text:"Switch to Dark Mode, Light Mode, or High Contrast Mode. You can also adjust saturation or enable Monochrome Mode to remove all color from the page."},{type:"heading",text:"Tools"},{type:"text",text:"Enable the Reading Guide — a horizontal band that follows your cursor to help you track lines of text. Stop Animations reduces motion for users sensitive to movement. Big Cursor enlarges your mouse pointer."},{type:"heading",text:"Resetting changes"},{type:"text",text:"Click the Reset button at the top of the accessibility panel to restore all default settings instantly."},{type:"faq",items:[{q:"Do my accessibility settings save between sessions?",a:"Currently settings reset when you close the browser. Persistent settings are on the roadmap."},{q:"Does the accessibility menu work on mobile?",a:"Yes. Tap the red circle button at the bottom left of any page to open the menu on mobile."}]}] }
];

type Article = (typeof ARTICLES)[0];


function ArticleBody({ article }: { article: Article }) {
  if ("faq" in article && article.faq) {
    return (
      <div>
        {(article.faq as Array<{q:string;a:string}>).map((item, i) => (
          <div key={i} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: i < (article.faq as []).length - 1 ? "1px solid #f0f0f0" : "none" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#111" }}>{item.q}</h3>
            <p style={{ margin: 0, fontSize: 15, color: "#555", lineHeight: 1.7 }}>{item.a}</p>
          </div>
        ))}
      </div>
    );
  }
  const blocks = "content" in article ? (article.content as Array<{type:string;text:string}>) : [];
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <div key={i} style={{ margin: "24px 0 8px", paddingLeft: 14, borderLeft: `3px solid ${RED}` }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>{block.text}</h3>
            </div>
          );
        }
        return <p key={i} style={{ margin: "0 0 16px", fontSize: 15, color: "#555", lineHeight: 1.7 }}>{block.text}</p>;
      })}
    </div>
  );
}

function HelpContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Article | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (articleId) {
      const found = ARTICLES.find(a => a.id === articleId);
      if (found) setSelected(found);
    }
  }, [searchParams]);

  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const matchSearch = search === "" || a.title.toLowerCase().includes(search.toLowerCase()) || a.preview.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .help-hero         { padding: 32px 16px 28px !important; }
          .help-body         { flex-direction: column !important; padding: 20px 16px 40px !important; }
          .help-sidebar      { width: 100% !important; position: relative !important; top: auto !important; flex-shrink: unset !important; }
          .help-sidebar-cats { display: flex !important; flex-wrap: wrap !important; gap: 4px !important; padding: 8px !important; }
          .help-sidebar-cats button { width: auto !important; border-right: none !important; border-radius: 20px !important; padding: 6px 12px !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="help-hero" style={{ background: `linear-gradient(135deg, ${RED} 0%, #8b0a1e 100%)`, padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to NUMockBuddy
          </Link>
          <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>How can we help you?</h1>
          <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,0.75)", fontSize: 16 }}>Search the NUMockBuddy help center</p>
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }} placeholder="Search help articles..."
              style={{ width: "100%", padding: "14px 16px 14px 46px", fontSize: 15, border: "none", borderRadius: 12, outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", color: "#222", boxSizing: "border-box" }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="help-body" style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 64px", display: "flex", gap: 28, alignItems: "flex-start" }}>

        {/* Sidebar */}
        <div className="help-sidebar" style={{ width: 220, flexShrink: 0, background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "12px 0", position: "sticky", top: 24 }}>
          <p style={{ margin: "0 0 6px", padding: "0 16px", fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>Categories</p>
          <div className="help-sidebar-cats">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSelected(null); }}
              style={{ width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 13.5, border: "none", background: activeCategory === cat.id ? "#fff5f5" : "none", color: activeCategory === cat.id ? RED : "#444", fontWeight: activeCategory === cat.id ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderRight: activeCategory === cat.id ? `3px solid ${RED}` : "3px solid transparent" }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>{cat.label}
            </button>
          ))}
          </div>
          <div style={{ margin: "16px 12px 4px", height: 1, background: "#f0f0f0" }} />
          <Link href="/feedback" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", fontSize: 13.5, color: "#444", textDecoration: "none" }}>
            <span style={{ fontSize: 16 }}>📬</span>Submit Feedback
          </Link>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#777", fontSize: 13, padding: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Back
                </button>
                <div style={{ flex: 1 }} />
              </div>
              <div style={{ padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff5f5", border: "1.5px solid #fce4e4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{selected.icon}</div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.3 }}>{selected.title}</h1>
                </div>
                <ArticleBody article={selected} />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>
                  {activeCategory === "all" ? "All Articles" : CATEGORIES.find(c => c.id === activeCategory)?.label}
                  <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, color: "#aaa" }}>{filtered.length} articles</span>
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(article => (
                  <button key={article.id} onClick={() => setSelected(article)}
                    style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "18px 20px", border: "1.5px solid transparent", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all 160ms" }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#fce4e4"; b.style.boxShadow = "0 4px 16px rgba(200,16,46,0.08)"; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "transparent"; b.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff5f5", border: "1.5px solid #fce4e4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{article.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{article.title}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13.5, color: "#888", lineHeight: 1.4 }}>{article.preview}</p>
                    </div>
                    <svg style={{ flexShrink: 0, color: "#ccc" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
                    <p style={{ fontSize: 32, margin: "0 0 12px" }}>🔍</p>
                    <p style={{ margin: 0, fontSize: 15, color: "#aaa" }}>No articles found for &ldquo;{search}&rdquo;</p>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 32, background: "#fff", borderRadius: 14, padding: "28px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#111" }}>Not finding what you are looking for?</p>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "#888" }}>Chat with our AI assistant or send us feedback.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => { const btn = document.querySelector("[data-chat-widget-trigger]") as HTMLButtonElement; if (btn) btn.click(); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: RED, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Chat with us
                  </button>
                  <Link href="/feedback" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", color: "#444", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Send feedback
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HelpContent />
    </Suspense>
  );
}