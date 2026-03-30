"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChatWidget, Message } from "@/app/contexts/ChatWidgetContext";
const RED = "#C8102E";
const CATEGORIES = [
  { id: "all", label: "All Articles" },
  { id: "getting-started", label: "Getting Started" },
  { id: "practice", label: "Mock Interview Practice" },
  { id: "resume", label: "Resume AI" },
  { id: "mentors", label: "Peer Mentors" },
  { id: "account", label: "Account & Support" },
];
const ARTICLES = [
  { id:"1", icon:"🎯", category:"getting-started", title:"What is NUMockBuddy and how does it work?", preview:"An AI-powered mock interview platform built for Northeastern Seattle students.", content:[{type:"text",text:"NUMockBuddy is an AI-powered mock interview platform built specifically for Northeastern University Seattle students in the MSIS and MSCS programs."},{type:"heading",text:"The three core tools"},{type:"text",text:"Mock Interview Practice — Choose from 30+ company-specific question sets. Submit answers and get instant feedback from 6 AI expert reviewers."},{type:"text",text:"Peer Volunteer Mentors — Connect with NU students who have landed co-ops at top companies."},{type:"text",text:"Resume AI — Upload your resume PDF and paste a JD for ATS analysis, keyword matching, and formatting suggestions."},{type:"heading",text:"Who is it for?"},{type:"text",text:"NUMockBuddy is free for all Northeastern Seattle students. Browser-based, no downloads required."}] },
  { id:"2", icon:"🔐", category:"account", title:"How to register on NUMockBuddy", preview:"Creating your account takes under a minute using your existing NU credentials.", content:[{type:"text",text:"Creating your NUMockBuddy account takes under a minute with no separate sign-up form."},{type:"heading",text:"Step 1 — Go to the homepage"},{type:"text",text:"Visit NUMockBuddy and click Sign in with NUid in the top right corner."},{type:"heading",text:"Step 2 — Authenticate with your NU credentials"},{type:"text",text:"Use the same username and password you use for Canvas and MyNortheastern."},{type:"heading",text:"Step 3 — You are in"},{type:"text",text:"Once authenticated you are returned to NUMockBuddy with your account created automatically."},{type:"heading",text:"Who can register?"},{type:"text",text:"Available to Northeastern Seattle students enrolled in MSIS or MSCS. A valid NUid is all you need."}] },
  { id:"3", icon:"🎤", category:"practice", title:"How to practice mock interviews", preview:"Start a session and get AI-powered feedback from 6 reviewers in minutes.", content:[{type:"text",text:"Practicing on NUMockBuddy takes about 10-15 minutes per session."},{type:"heading",text:"Step 1 — Choose a company or role"},{type:"text",text:"Click Practice in the nav bar. Browse sets by company (Google, Amazon, Microsoft, Meta, and 25+ more) or role type."},{type:"heading",text:"Step 2 — Answer the questions"},{type:"text",text:"Write answers as you would speak them in a real interview. Use STAR format for behavioral questions."},{type:"heading",text:"Step 3 — Review feedback"},{type:"text",text:"6 AI reviewers independently score your response on clarity, structure, relevance, depth, and overall impression."},{type:"heading",text:"Tips"},{type:"text",text:"Be specific. The AI only evaluates what you actually wrote. The more concrete your answer, the more useful the feedback."}] },
  { id:"4", icon:"🤖", category:"practice", title:"How AI feedback works", preview:"NUMockBuddy uses 6 independent AI reviewers to score every answer.", content:[{type:"text",text:"NUMockBuddy uses 6 AI expert reviewers to evaluate every practice answer."},{type:"heading",text:"The 6 reviewers"},{type:"text",text:"Each reviewer acts as a different interviewer: technical lead, hiring manager, behavioral specialist, communication coach, culture-fit evaluator, and overall assessor."},{type:"heading",text:"What they score"},{type:"text",text:"Clarity, Structure, Relevance, Depth, and Overall impression — combined into a score out of 10."},{type:"heading",text:"No hallucination policy"},{type:"text",text:"The AI only evaluates what you wrote. It will never invent experience, job titles, or company names."}] },
  { id:"5", icon:"🤝", category:"mentors", title:"Finding and connecting with peer mentors", preview:"Connect with NU students who landed co-ops at Google, Amazon, Microsoft, and more.", content:[{type:"text",text:"The Volunteers section connects you with NU Seattle students who completed co-ops at your target companies."},{type:"heading",text:"Browsing mentors"},{type:"text",text:"Click Volunteers. Each card shows name, company, role, program, and availability. Filter by company or role."},{type:"heading",text:"What mentors help with"},{type:"text",text:"Company-specific prep: what the interview looked like, questions that came up, team culture, and what they wish they had done differently."},{type:"heading",text:"How to connect"},{type:"text",text:"Click a mentor profile and send a connection request with a short note about what you want to work on."},{type:"heading",text:"Be prepared"},{type:"text",text:"Mentors volunteer their time. The more focused your ask, the more useful the session."}] },
  { id:"6", icon:"📄", category:"resume", title:"How to use the Resume AI feature", preview:"Upload your resume PDF and paste a JD for instant ATS score and keyword match.", content:[{type:"text",text:"Resume AI analyzes your resume against a job description and tells you exactly what to fix."},{type:"heading",text:"Step 1 — Go to Resume AI"},{type:"text",text:"Click Resume in the nav bar. You will see Resume Analysis, ATS Scanner, and Career Assistant tabs."},{type:"heading",text:"Step 2 — Upload your resume"},{type:"text",text:"Select your resume PDF. It must be text-based, not scanned or image-based."},{type:"heading",text:"Step 3 — Paste a job description"},{type:"text",text:"Paste the full JD. The more complete the JD, the better the analysis."},{type:"heading",text:"Step 4 — Run analysis"},{type:"text",text:"Click Analyze to check ATS compatibility, keyword alignment, formatting issues, and content gaps."},{type:"heading",text:"Step 5 — Career Assistant"},{type:"text",text:"Use the Career Assistant tab to rewrite bullet points or tailor your resume to a specific role."}] },
  { id:"7", icon:"💡", category:"practice", title:"Tips for your first mock interview session", preview:"Make the most of your first practice session with these strategies.", content:[{type:"text",text:"Your first session sets the tone. Here is how to get real actionable feedback right away."},{type:"heading",text:"Pick a real target"},{type:"text",text:"Choose a company you are genuinely applying to. The feedback feels more meaningful when stakes feel real."},{type:"heading",text:"Write like you speak"},{type:"text",text:"Avoid bullet points. Write in full sentences. The AI scores narrative quality."},{type:"heading",text:"Use STAR for behavioral questions"},{type:"text",text:"Situation (brief context), Task (your role), Action (what you specifically did), Result (quantified outcome)."},{type:"heading",text:"Aim for consistency"},{type:"text",text:"Three sessions per week in the month before your co-op cycle opens will build real confidence."}] },
  { id:"10", icon:"🤝", category:"mentors", title:"How to book a session with a volunteer mentor", preview:"Browse volunteers by company and skill, view their availability, and book a session in seconds.", content:[{type:"text",text:"Click Volunteers in the nav bar to find mentors who have already landed co-ops at your target companies. Filter by company or skill, view their profile and availability, then book a time slot."},{type:"heading",text:"Tips for a great session"},{type:"text",text:"Come with specific questions about the company interview process, team culture, or how to frame your experience. Mentors volunteer their time so focused questions make sessions more valuable."}] },
  { id:"11", icon:"📊", category:"dashboard", title:"Understanding your performance dashboard", preview:"Track your interview scores, improvement trends, and activity history all in one place.", content:[{type:"text",text:"The Performance Dashboard shows your average score trend across all practice sessions, breakdown by company, reviewer scores, recent activity, and resume scan history."},{type:"heading",text:"Why your dashboard might be empty"},{type:"text",text:"Complete at least one practice session or run a Resume AI scan to start seeing data appear on your dashboard."}] },
  { id:"12", icon:"♿", category:"accessibility", title:"Using the Accessibility Menu", preview:"The red circle button at the bottom left opens tools for font size, color modes, dyslexia font, and more.", content:[{type:"text",text:"Click the red circle accessibility button at the bottom left of any page to open the menu. Options include font size slider, dyslexia font, dark/light/high contrast modes, reading guide, stop animations, and big cursor."},{type:"heading",text:"Resetting changes"},{type:"text",text:"Click the Reset button inside the panel to restore all default settings instantly."}] },
  { id:"8", icon:"❓", category:"account", title:"Frequently asked questions", preview:"Quick answers to the most common NUMockBuddy questions.", faq:[{q:"Is NUMockBuddy free?",a:"Yes. Completely free for all Northeastern Seattle MSIS and MSCS students."},{q:"Do I need to install anything?",a:"No. Fully browser-based. Works on Chrome, Safari, Firefox, and Edge."},{q:"Can I use it on my phone?",a:"Yes. Mobile-responsive, though a laptop is recommended for longer sessions."},{q:"Is my data private?",a:"Yes. Your sessions, resume uploads, and chat history are only visible to you."},{q:"How many companies are available?",a:"30+ companies including Google, Amazon, Microsoft, Meta, Apple, Fidelity, Salesforce, and Adobe."},{q:"Can I practice the same question multiple times?",a:"Yes. Each submission gets fresh AI feedback. Comparing attempts is one of the best ways to improve."},{q:"What if I find a bug?",a:"Go to the Feedback page, select Bug Report, and include a screenshot if possible."},{q:"Can I suggest a feature?",a:"Yes. Go to Feedback, select Feature Request, and describe what you want added."}] },
  { id:"9", icon:"📝", category:"account", title:"How to submit feedback on NUMockBuddy", preview:"Report bugs, rate sessions, or suggest new features using the feedback form.", content:[{type:"text",text:"Your feedback directly shapes what the NUMockBuddy team builds next."},{type:"heading",text:"Session Feedback"},{type:"text",text:"Rate AI question quality and feedback usefulness after a practice session."},{type:"heading",text:"Platform Feedback"},{type:"text",text:"Share thoughts on UI design, navigation, and overall ease of use."},{type:"heading",text:"Peer Mentor Feedback"},{type:"text",text:"Rate a volunteer session on helpfulness, preparation, and professionalism."},{type:"heading",text:"Bug Report"},{type:"text",text:"Describe what broke, what you were doing, and what you expected. Attach a screenshot."},{type:"heading",text:"Feature Request"},{type:"text",text:"Suggest a capability you want. Be specific about what and why."},{type:"heading",text:"What happens after"},{type:"text",text:"All feedback is reviewed. Bug reports are triaged and feature requests influence the roadmap."}] },
];
type Article = (typeof ARTICLES)[0];
function TypingDots() {
  return (
    <div style={{ display:"flex", gap:4, padding:"10px 14px", alignItems:"center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#aaa", display:"inline-block", animation:"wDot 1.2s ease-in-out infinite", animationDelay:i*0.2+"s" }} />
      ))}
    </div>
  );
}
function BotAvatar() {
  return <div style={{ width:28, height:28, borderRadius:"50%", background:RED, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"white", fontWeight:800, fontSize:12 }}>N</div>;
}
function Bubble({ msg, isNew }: { msg: Message; isNew: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex", gap:10, flexDirection:isUser?"row-reverse":"row", alignItems:"flex-end", animation:isNew?"wPop 180ms ease-out forwards":undefined, opacity:isNew?0:1 }}>
      {!isUser && <BotAvatar />}
      <div style={{ maxWidth:"72%", padding:"10px 14px", fontSize:13.5, lineHeight:1.55, wordBreak:"break-word", whiteSpace:"pre-wrap", background:isUser?RED:"#fff", color:isUser?"#fff":"#1a1a1a", borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px", boxShadow:"0 1px 3px rgba(0,0,0,0.08)", border:isUser?"none":"1.5px solid #eee" }}>
        {msg.content}
      </div>
    </div>
  );
}
function ArticleModalContent({ article }: { article: Article }) {
  if ("faq" in article && article.faq) {
    return (
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
        {(article.faq as Array<{q:string;a:string}>).map((item,i) => (
          <div key={i} style={{ marginBottom:22, paddingBottom:22, borderBottom:i<(article.faq as []).length-1?"1px solid #f3f3f3":"none" }}>
            <p style={{ margin:"0 0 6px", fontSize:14, fontWeight:700, color:"#111" }}>{item.q}</p>
            <p style={{ margin:0, fontSize:13.5, color:"#555", lineHeight:1.65 }}>{item.a}</p>
          </div>
        ))}
      </div>
    );
  }
  const blocks = "content" in article ? (article.content as Array<{type:string;text:string}>) : [];
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
      {blocks.map((block,i) => {
        if (block.type === "heading") return (
          <div key={i} style={{ margin:"20px 0 6px", paddingLeft:12, borderLeft:`3px solid ${RED}` }}>
            <p style={{ margin:0, fontSize:13.5, fontWeight:700, color:"#111" }}>{block.text}</p>
          </div>
        );
        return <p key={i} style={{ margin:"0 0 12px", fontSize:13.5, color:"#555", lineHeight:1.65 }}>{block.text}</p>;
      })}
    </div>
  );
}
function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  return (
    <div style={{ position:"absolute", inset:0, background:"#fff", zIndex:20, display:"flex", flexDirection:"column", borderRadius:"inherit" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 14px", borderBottom:"1px solid #f0f0f0", flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", padding:4, display:"flex" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontSize:13.5, fontWeight:600, color:"#111", flex:1 }}>{article.title}</span>
        <a href={`/help?article=${article.id}`} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:RED, background:"#fff5f5", border:"1.5px solid #fce4e4", borderRadius:8, padding:"5px 10px", textDecoration:"none", whiteSpace:"nowrap" }}>
          View in Helpdesk
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
        </a>
      </div>
      <ArticleModalContent article={article} />
    </div>
  );
}
function ArticlesTab() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Article|null>(null);
  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const matchSearch = q === "" || a.title.toLowerCase().includes(q.toLowerCase()) || a.preview.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchSearch;
  });
  return (
    <div style={{ display:"flex", height:"100%", position:"relative" }}>
      {sel && <ArticleModal article={sel} onClose={() => setSel(null)} />}
      <div style={{ width:118, borderRight:"1.5px solid #f0f0f0", flexShrink:0, overflowY:"auto", padding:"10px 0" }}>
        <p style={{ margin:"0 0 6px", padding:"0 10px", fontSize:10.5, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:0.6 }}>Categories</p>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            style={{ width:"100%", textAlign:"left", padding:"7px 10px", fontSize:12, border:"none", background:activeCategory===cat.id?"#fff5f5":"none", color:activeCategory===cat.id?RED:"#555", fontWeight:activeCategory===cat.id?600:400, cursor:"pointer", lineHeight:1.35, borderRight:activeCategory===cat.id?`2.5px solid ${RED}`:"2.5px solid transparent" }}>
            {cat.label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"10px 10px 6px", borderBottom:"1px solid #f5f5f5" }}>
          <div style={{ position:"relative" }}>
            <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles..."
              style={{ width:"100%", padding:"7px 10px 7px 28px", fontSize:12.5, border:"1.5px solid #eee", borderRadius:8, outline:"none", background:"#fafafa", boxSizing:"border-box", color:"#333" }}
              onFocus={e => (e.target.style.borderColor=RED)} onBlur={e => (e.target.style.borderColor="#eee")} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
          {filtered.map(a => (
            <button key={a.id} onClick={() => setSel(a)}
              style={{ width:"100%", textAlign:"left", padding:"10px 12px", background:"none", border:"none", borderBottom:"1px solid #f5f5f5", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:10 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background="#fafafa"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background="none"}>
              <div style={{ width:32, height:32, borderRadius:8, background:"#fff5f5", border:"1px solid #fce4e4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>{a.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#111", lineHeight:1.3 }}>{a.title}</p>
                <p style={{ margin:"3px 0 0", fontSize:11.5, color:"#888", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.preview}</p>
              </div>
              <svg style={{ flexShrink:0, marginTop:4 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
          {filtered.length === 0 && <p style={{ fontSize:13, color:"#aaa", textAlign:"center", paddingTop:32 }}>No articles found.</p>}
        </div>
      </div>
    </div>
  );
}
export default function ChatWidget() {
  const { isOpen, activeTab, messages, isTyping, hasUnread, toggleWidget, closeWidget, setActiveTab, sendMessage, clearMessages } = useChatWidget();
  const [input, setInput] = useState("");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLen = useRef(0);
  useEffect(() => {
    if (messages.length > prevLen.current) {
      const id = messages[messages.length-1].id;
      setNewIds(p => new Set([...p, id]));
      setTimeout(() => setNewIds(p => { const n=new Set(p); n.delete(id); return n; }), 300);
    }
    prevLen.current = messages.length;
  }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 250); }, [isOpen]);
  const send = useCallback(async () => {
    const t = input.trim(); if (!t) return;
    setInput(""); await sendMessage(t);
  }, [input, sendMessage]);
  const newChat = useCallback(() => { clearMessages(); }, [clearMessages]);
  return (
    <>
      <style>{`
        @keyframes wSlide { from { transform: translateY(20px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes wDot   { 0%,60%,100% { transform: translateY(0); opacity:.4; } 30% { transform: translateY(-5px); opacity:1; } }
        @keyframes wPop   { from { transform: translateY(6px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes wPulse { 0%,100% { box-shadow: 0 4px 24px rgba(200,16,46,0.45); } 50% { box-shadow: 0 4px 32px rgba(200,16,46,0.7); } }
      `}</style>
      {isOpen && (
        <div style={{ position:"fixed", bottom:84, right:24, zIndex:9998, width:390, height:570, background:"#fff", borderRadius:18, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", overflow:"hidden", animation:"wSlide 240ms cubic-bezier(.22,1,.36,1) forwards" }}>
          <div style={{ background:"linear-gradient(135deg, #C8102E 0%, #a50d25 100%)", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#fff", flexShrink:0 }}>N</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:14 }}>NUMockBuddy Assistant</p>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                <span style={{ color:"rgba(255,255,255,0.8)", fontSize:11.5 }}>Online · Northeastern Career AI</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={newChat} title="New conversation" style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.28)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.15)"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
              <button onClick={closeWidget} title="Minimize" style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.28)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.15)"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
              </button>
              <button onClick={closeWidget} title="Close" style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.28)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.15)"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div style={{ display:"flex", background:"#fff", borderBottom:"1.5px solid #f0f0f0", flexShrink:0 }}>
            {(["messages","articles"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex:1, padding:"11px 0", fontSize:13, fontWeight:600, background:"none", border:"none", borderBottom:activeTab===tab?"2.5px solid "+RED:"2.5px solid transparent", marginBottom:-1.5, cursor:"pointer", color:activeTab===tab?RED:"#aaa", textTransform:"capitalize", transition:"color 140ms" }}>
                {tab === "messages" ? "Messages" : "Articles"}
              </button>
            ))}
          </div>
          {activeTab === "articles" ? (
            <div style={{ flex:1, overflow:"hidden" }}><ArticlesTab /></div>
          ) : (
            <>
              <div style={{ flex:1, overflowY:"auto", padding:"16px 14px", display:"flex", flexDirection:"column", gap:10, background:"#fafafa" }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                  <BotAvatar />
                  <div style={{ background:"#fff", border:"1.5px solid #eee", padding:"10px 14px", borderRadius:"18px 18px 18px 4px", fontSize:13.5, color:"#1a1a1a", lineHeight:1.55, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", maxWidth:"76%" }}>
                    Hi! I am your <strong>NUMockBuddy</strong> career assistant. Ask me anything about interviews, resumes, or co-ops.
                  </div>
                </div>
                {messages.map(m => <Bubble key={m.id} msg={m} isNew={newIds.has(m.id)} />)}
                {isTyping && (
                  <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                    <BotAvatar />
                    <div style={{ background:"#fff", border:"1.5px solid #eee", borderRadius:"18px 18px 18px 4px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}><TypingDots /></div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <div style={{ padding:"10px 12px 12px", borderTop:"1.5px solid #f0f0f0", background:"#fff", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, background:"#f5f5f5", borderRadius:24, padding:"5px 5px 5px 12px", border:"1.5px solid #ebebeb" }}
                  onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor=RED}
                  onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor="#ebebeb"}>
                  <button title="Attach file (coming soon)" style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", padding:"2px", display:"flex", flexShrink:0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Ask about resumes, interviews, co-ops"
                    style={{ flex:1, border:"none", background:"transparent", fontSize:13.5, outline:"none", color:"#222", minWidth:0 }} />
                  <button onClick={send} disabled={!input.trim() || isTyping}
                    style={{ width:34, height:34, borderRadius:"50%", background:input.trim()?RED:"#e0e0e0", border:"none", cursor:input.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 180ms" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                  </button>
                </div>
                <p style={{ margin:"6px 0 0", fontSize:10.5, color:"#ccc", textAlign:"center" }}>Powered by Northeastern Career AI · <a href="/feedback" style={{ color:"#bbb", textDecoration:"none" }}>Feedback</a></p>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={toggleWidget} aria-label="Open chat" data-chat-widget-trigger="true"
        style={{ position:"fixed", bottom:24, right:24, zIndex:9999, width:52, height:52, borderRadius:"50%", background:RED, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 24px rgba(200,16,46,0.45)", transition:"transform 160ms", animation:"wPulse 2.4s ease-in-out infinite" }}
        onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.transform="scale(1.1)"; b.style.animation="none"; }}
        onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.transform="scale(1)"; b.style.animation="wPulse 2.4s ease-in-out infinite"; }}>
        {isOpen
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {hasUnread && !isOpen && (
          <span style={{ position:"absolute", top:2, right:2, width:12, height:12, borderRadius:"50%", background:"#22c55e", border:"2px solid white" }} />
        )}
      </button>
    </>
  );
}