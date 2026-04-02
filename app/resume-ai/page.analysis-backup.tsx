"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { lookupATS } from "@/lib/ats-companies";
import PdfPreview from "@/components/PdfPreview";

type Tab = "jd" | "ats" | "chat";
type Mode = "jd" | "role";
type ResumeInputMode = "upload" | "paste";

interface QuickWin {
  action: string;
  effort: string;
  impact: string;
}

interface AnalysisResult {
  score: number;
  atsProbability?: number;
  atsProbabilityExplanation?: string;
  senioritySignal?: string;
  quickWins?: QuickWin[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  semanticMatches?: string[];
  requiredKeywords?: string[];
  preferredKeywords?: string[];
  suggestions?: string[];
  bars?: Record<string, number>;
  weakVerbs?: string[];
  missingMetrics?: string[];
  firstPersonIssues?: boolean;
  tenseMixing?: boolean;
  resumeLength?: string;
  hasGPA?: boolean;
  hasGitHub?: boolean;
  hasLinkedIn?: boolean;
  strongestBullets?: string[];
  topImprovements?: string[];
  formattingIssues?: string[];
  leadershipSignals?: string;
  impactVsResponsibility?: string;
  seniorityMatch?: string;
  seniorityNote?: string;
  experienceYearsMatch?: boolean;
  experienceNote?: string;
  educationMatch?: boolean | string;
  educationNote?: string;
  domainMatch?: string;
  domainNote?: string;
  impactScore?: number;
  impactNote?: string;
  achievementRatio?: string;
  achievementNote?: string;
  bulletLengthIssues?: string[];
  buzzwordsFound?: string[];
  repeatedVerbs?: string[];
  dateConsistency?: string;
  dateNote?: string;
  sectionOrder?: string;
  sectionOrderNote?: string;
  densityScore?: string;
  industryKeywordDensity?: string;
  industryKeywordNote?: string;
  projectedScore?: number;
  projectedScoreNote?: string;
  atsSystemBreakdown?: Record<string, { status: string; note: string }>;
}

interface ATSCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  note: string;
}

interface SeverityIssue {
  severity: "high" | "medium" | "low";
  issue: string;
  fix: string;
}

interface MissingSection {
  name: string;
  importance: string;
  why: string;
}

interface QuickFixItem {
  id: number;
  action: string;
  effort: string;
  impact: string;
  scoreGain: string;
  checked?: boolean;
}

interface ATSResult {
  overallScore: number;
  verdict: string;
  scoreExplanation?: string;
  projectedScore?: number;
  projectedScoreNote?: string;
  isMultiColumn: boolean;
  checks: ATSCheck[];
  atsSystems?: Record<string, string>;
  atsSystemDetails?: Record<string, string>;
  detectedSections?: string[];
  missingSections?: MissingSection[];
  contactFields?: Record<string, boolean>;
  quickFixChecklist?: QuickFixItem[];
  severityIssues?: SeverityIssue[];
  parseSimulation?: { garbled: string; clean: string };
}

interface ScanRecord {
  id: string;
  score: number;
  createdAt: string;
  scanType: string;
  fileName?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: { role: string; content: string }[];
}

interface AttachedFile {
  name: string;
  content: string;
  type: string;
}

const ROLES = ["Software Engineer", "SWE Intern", "Product Manager", "PM Intern", "Data Engineer", "ML Engineer", "Data Science Intern", "Solutions Architect", "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "DevOps Engineer"];

const QUICK_CHIPS = [
  { label: "Write a cover letter", prompt: "I need help writing a cover letter. Can you help me get started?" },
  { label: "Strengthen bullet points", prompt: "I want to strengthen my resume bullet points. Can you help?" },
  { label: "Application outreach message", prompt: "I need to write a LinkedIn outreach message to a recruiter. Can you help?" },
  { label: "Interview advice", prompt: "I have an upcoming interview. Can you help me prepare?" },
  { label: "Find gaps in my resume", prompt: "Can you help me find gaps or weaknesses in my resume?" },
  { label: "Rewrite LinkedIn summary", prompt: "I want to rewrite my LinkedIn summary. Can you help?" },
];

const WEAK_VERB_REPLACEMENTS: Record<string, string[]> = {
  "helped": ["accelerated", "drove", "enabled", "facilitated"],
  "worked on": ["engineered", "built", "delivered", "shipped"],
  "assisted": ["spearheaded", "championed", "led", "owned"],
  "supported": ["optimized", "streamlined", "enhanced", "strengthened"],
  "handled": ["orchestrated", "executed", "directed", "managed"],
  "did": ["achieved", "accomplished", "delivered", "produced"],
  "made": ["architected", "designed", "created", "developed"],
  "used": ["leveraged", "implemented", "deployed", "utilized"],
  "worked with": ["collaborated with", "partnered with", "coordinated"],
  "responsible for": ["owned", "led", "directed", "oversaw"],
};

function getLetterGrade(score: number) {
  if (score >= 90) return { grade: "A+", color: "#16a34a" };
  if (score >= 80) return { grade: "A", color: "#16a34a" };
  if (score >= 70) return { grade: "B+", color: "#2d7a2d" };
  if (score >= 60) return { grade: "B", color: "#ca8a04" };
  if (score >= 50) return { grade: "C+", color: "#ca8a04" };
  if (score >= 40) return { grade: "C", color: "#dc2626" };
  return { grade: "D", color: "#dc2626" };
}

function ScoreGauge({ score, label }: { score: number; label?: string }) {
  const { grade, color } = getLetterGrade(score);
  const r = 50;
  const half = Math.PI * r;
  const fill = (score / 100) * half;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="124" height="68" viewBox="0 0 124 68">
        <path d="M 12 64 A 50 50 0 0 1 112 64" fill="none" stroke="var(--color-gray-200)" strokeWidth="9" strokeLinecap="round" />
        <path d="M 12 64 A 50 50 0 0 1 112 64" fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={`${fill} ${half}`} />
      </svg>
      <div style={{ marginTop: -8, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 400, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 12, color: "var(--color-gray-400)" }}>/100</span>
        </div>
        <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 12px", borderRadius: "var(--radius-full)", border: `1.5px solid ${color}`, background: `${color}10` }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color, fontWeight: 400 }}>{grade}</span>
          {label && <span style={{ fontSize: 11, color: "var(--color-gray-400)" }}>{label}</span>}
        </div>
      </div>
    </div>
  );
}

function ScanTimeline({ scans, showAll, onToggle }: { scans: ScanRecord[]; showAll: boolean; onToggle: () => void }) {
  const filtered = scans.filter(s => s.score > 0);
  if (!filtered.length) return null;

  // Group by fileName for "all scans" view
  const grouped: Record<string, ScanRecord[]> = {};
  for (const s of filtered) {
    const key = s.fileName || "Unknown file";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  // For current file view — just show last 5 of current file
  const currentFileScans = filtered.slice(-5);

  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--color-gray-200)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {showAll ? "All Resume Scans" : "This Resume — Progress"}
        </p>
        <button onClick={onToggle} style={{ fontSize: 11, color: "var(--color-red)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", padding: "3px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-red-border)" }}>
          {showAll ? "Show current file only" : "All scans →"}
        </button>
      </div>

      {showAll ? (
        // Option A — grouped by filename
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([fileName, fileScans]) => (
            <div key={fileName}>
              <p style={{ fontSize: 11, color: "var(--color-gray-600)", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", background: "var(--color-gray-100)", borderRadius: 4, color: "var(--color-gray-400)" }}>
                  {fileName.split(".").pop()?.toUpperCase()}
                </span>
                {fileName}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {fileScans.map((s, i) => {
                  const { grade, color } = getLetterGrade(s.score);
                  return (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                          <span style={{ fontSize: 9, fontWeight: 700 }}>{grade}</span>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>{s.score}</span>
                        </div>
                        <p style={{ fontSize: 10, color: "var(--color-gray-400)", marginTop: 3 }}>
                          {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      {i < fileScans.length - 1 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ height: 1, width: 20, background: "var(--color-gray-200)" }} />
                          {fileScans[i + 1].score !== s.score && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: fileScans[i + 1].score > s.score ? "#16a34a" : "#dc2626" }}>
                              {fileScans[i + 1].score > s.score ? "+" : ""}{fileScans[i + 1].score - s.score}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Option B — current file progress only
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {currentFileScans.map((s, i) => {
            const { grade, color } = getLetterGrade(s.score);
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{grade}</span>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{s.score}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 4 }}>
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                {i < currentFileScans.length - 1 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ height: 1, width: 24, background: "var(--color-gray-200)" }} />
                    {currentFileScans[i + 1].score !== s.score && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: currentFileScans[i + 1].score > s.score ? "#16a34a" : "#dc2626" }}>
                        {currentFileScans[i + 1].score > s.score ? "+" : ""}{currentFileScans[i + 1].score - s.score}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {currentFileScans.length === 1 && (
            <p style={{ fontSize: 12, color: "var(--color-gray-400)", fontStyle: "italic" }}>Scan again after editing to track progress</p>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--color-gray-200)",
      borderRadius: "var(--radius-lg)",
      display: "flex",
      flexDirection: "column" as const,
      height: "100%",
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
      {children}
    </p>
  );
}

function IssuePill({ level }: { level: "critical" | "improve" | "nice" }) {
  const styles = {
    critical: { background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" },
    improve: { background: "rgba(202,138,4,0.08)", color: "#ca8a04", border: "1px solid rgba(202,138,4,0.2)" },
    nice: { background: "rgba(107,114,128,0.08)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.2)" },
  };
  const labels = { critical: "● Critical", improve: "● Improve", nice: "● Nice to have" };
  return (
    <span style={{ ...styles[level], borderRadius: "var(--radius-full)", padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
      {labels[level]}
    </span>
  );
}

function WeakVerbRow({ verb }: { verb: string }) {
  const replacements = WEAK_VERB_REPLACEMENTS[verb.toLowerCase()] || ["strengthen", "drive", "lead", "build"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-gray-100)" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#dc2626", textDecoration: "line-through", minWidth: 100 }}>{verb}</span>
      <span style={{ fontSize: 12, color: "var(--color-gray-400)" }}>→ try</span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {replacements.map(r => (
          <span key={r} style={{ padding: "2px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-gray-200)", fontSize: 12, fontWeight: 500, color: "var(--color-gray-600)", background: "var(--color-gray-100)" }}>{r}</span>
        ))}
      </div>
    </div>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = { pdf: "#dc2626", docx: "#2563eb", doc: "#2563eb" };
  return <span style={{ fontSize: 10, fontWeight: 700, color: colors[ext || ""] || "#6b7280" }}>{(ext || "file").toUpperCase()}</span>;
}

export default function ResumeAIPage() {
  const [activeTab, setActiveTab] = useState<Tab>("jd");
  const userId = "demo-user";

  const [mode, setMode] = useState<Mode>("jd");
  const [resumeFile, setResumeFile] = useState<{ name: string; content: string } | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeInputMode, setResumeInputMode] = useState<"upload" | "paste">("upload");
  const [jdInputMode, setJdInputMode] = useState<"paste" | "upload">("paste");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdPreviewUrl, setJdPreviewUrl] = useState<string | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [pdfZoom, setPdfZoom] = useState(100);
  const previewRef = useRef<HTMLDivElement>(null);
  const [rawResumeFile, setRawResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [company, setCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tab1History, setTab1History] = useState<ScanRecord[]>([]);
  const [showAllTab1, setShowAllTab1] = useState(false);
  const [showAllTab2, setShowAllTab2] = useState(false);
  const atsInfo = company ? lookupATS(company) : null;

  const [atsResumeFile, setAtsResumeFile] = useState<{ name: string; content: string } | null>(null);
  const [atsResumeText, setAtsResumeText] = useState("");
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [atsScanning, setAtsScanning] = useState(false);
  const [showAtsGood, setShowAtsGood] = useState(false);
  const [tab2History, setTab2History] = useState<ScanRecord[]>([]);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [chatSearch, setChatSearch] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async (scanType: string, setter: (s: ScanRecord[]) => void, fileName?: string, allScans = false) => {
    const params = new URLSearchParams({ userId, scanType });
    if (fileName && !allScans) params.set("fileName", fileName);
    if (allScans) params.set("all", "true");
    const res = await fetch(`/api/resume-ai/history?${params}`);
    setter(await res.json());
  }, [userId]);

  const loadSessions = useCallback(async () => {
    const res = await fetch(`/api/resume-ai/chat?userId=${userId}`);
    setSessions(await res.json());
  }, [userId]);

  useEffect(() => {
    loadHistory("JD_MATCH", setTab1History);
    loadSessions();
  }, [loadHistory, loadSessions]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const parseFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/resume-ai/parse", { method: "POST", body: formData });
    const data = await res.json();
    return data.text || "";
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (raw) {
      setRawResumeFile(raw);
      if (raw.type === "application/pdf") {
        setResumePreviewUrl(URL.createObjectURL(raw));
      } else {
        setResumePreviewUrl(null);
      }
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await parseFile(file);
    setResumeFile({ name: file.name, content });
  };

  const handleAtsResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await parseFile(file);
    setAtsResumeFile({ name: file.name, content });
  };

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      const content = await parseFile(file);
      newFiles.push({ name: file.name, content, type: file.name.split(".").pop() || "txt" });
    }
    setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 3));
    e.target.value = "";
  };

  const handleAnalyze = async () => {
    const text = resumeFile?.content || resumeText;
    if (!text) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/resume-ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, jdText: mode === "jd" ? jdText : undefined, role: mode === "role" ? (customRole || selectedRole) : undefined, mode, userId, fileName: resumeFile?.name }),
      });
      setAnalysisResult(await res.json());
      loadHistory(mode === "jd" ? "JD_MATCH" : "ROLE_RATE", setTab1History, resumeFile?.name, showAllTab1);
    } finally { setAnalyzing(false); }
  };

  const handleATSScan = async () => {
    const text = atsResumeFile?.content || atsResumeText;
    if (!text) return;
    setAtsScanning(true);
    setAtsResult(null);
    try {
      const res = await fetch("/api/resume-ai/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, userId, fileName: atsResumeFile?.name }),
      });
      setAtsResult(await res.json());
      loadHistory("ATS", setTab2History, atsResumeFile?.name, showAllTab2);
    } finally { setAtsScanning(false); }
  };

  const startNewChat = () => {
    setActiveSession(null);
    setChatMessages([]);
    setShowWelcome(true);
    setAttachedFiles([]);
  };

  const loadSession = (session: ChatSession) => {
    setActiveSession(session.id);
    setChatMessages(session.messages.map(m => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })));
    setShowWelcome(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() && attachedFiles.length === 0) return;
    const fileLabel = attachedFiles.length > 0 ? attachedFiles.map(f => `📎 ${f.name}`).join("  ") + "\n\n" : "";
    const displayContent = fileLabel + content;
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: displayContent }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    setShowWelcome(false);
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    try {
      const combinedFileContent = filesToSend.map(f => `=== ${f.name} ===\n${f.content}`).join("\n\n");
      const res = await fetch("/api/resume-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages, sessionId: activeSession, userId,
          newSession: !activeSession, title: content.slice(0, 40) || filesToSend.map(f => f.name).join(", "),
          fileContent: filesToSend.length > 0 ? combinedFileContent : undefined,
          fileName: filesToSend.length > 0 ? filesToSend.map(f => f.name).join(", ") : undefined,
        }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
      if (!activeSession) { setActiveSession(data.sessionId); loadSessions(); }
    } finally { setChatLoading(false); }
  };

  const groupSessionsByMonth = () => {
    const groups: Record<string, ChatSession[]> = {};
    for (const s of sessions) {
      const month = new Date(s.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!groups[month]) groups[month] = [];
      groups[month].push(s);
    }
    return groups;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: 14, padding: "11px 14px",
    border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)", color: "var(--color-black)",
    background: "#fff", outline: "none", transition: "border-color 0.15s",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle, resize: "none", lineHeight: 1.6,
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px 28px", borderRadius: "var(--radius-full)",
    background: "var(--color-red)", color: "#fff",
    fontWeight: 600, fontSize: 14, border: "none",
    cursor: "pointer", fontFamily: "var(--font-body)",
    boxShadow: "var(--shadow-red)", transition: "all 0.15s ease",
  };

  const btnOutline: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 20px", borderRadius: "var(--radius-full)",
    background: "transparent", color: "var(--color-black)",
    fontWeight: 500, fontSize: 13, fontFamily: "var(--font-body)",
    border: "1.5px solid var(--color-gray-200)", cursor: "pointer",
    transition: "all 0.15s ease",
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>


      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "56px 32px 48px", borderBottom: "1px solid var(--color-gray-200)", background: "#fff" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(var(--color-gray-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-gray-200) 1px, transparent 1px)",
          backgroundSize: "40px 40px", opacity: 0.4, pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", top: -80, right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,16,46,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          {/* Left: text */}
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ padding: "4px 14px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-red-border)", background: "var(--color-red-muted)", color: "var(--color-red)", fontSize: 12, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-red)", display: "inline-block", marginRight: 6, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                AI Resume Intelligence · Built for Northeastern Students
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-1px", color: "var(--color-black)", marginBottom: 14 }}>
              Know exactly what&apos;s{" "}
              <span style={{ color: "var(--color-red)", fontStyle: "italic" }}>missing.</span>
            </h1>
            <p style={{ fontSize: 15, color: "var(--color-gray-600)", lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
              Deep resume analysis for NU students — keyword gaps, ATS scores, bullet rewrites, and AI career coaching for co-ops, internships, and full-time roles.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["JD vs Resume", "ATS Scanner", "Career Assistant"].map((label, i) => {
                const tabs: Tab[] = ["jd", "ats", "chat"];
                const active = activeTab === tabs[i];
                return (
                  <button key={label} onClick={() => setActiveTab(tabs[i])}
                    style={active ? btnPrimary : btnOutline}>
                    {label}
                    {active && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: animated score mockup */}
          <div style={{ flexShrink: 0, width: 260, display: "flex", flexDirection: "column", gap: 10 }} className="animate-fade-up">
            <div style={{ background: "#fff", border: "1.5px solid var(--color-gray-200)", borderRadius: 16, padding: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#f0f0f0" strokeWidth="6"/>
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#C8102E" strokeWidth="6" strokeDasharray="113" strokeDashoffset="28" strokeLinecap="round" transform="rotate(-90 28 28)" style={{ animation: "dashIn 1.2s ease-out forwards" }}/>
                  </svg>
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#C8102E" }}>78</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>ATS Score</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Good · 3 issues found</p>
                </div>
              </div>
              {[["Keywords matched", 14, 18, "#16a34a"], ["Missing skills", 4, 4, "#C8102E"], ["Bullet strength", 7, 10, "#d97706"]].map(([label, val, max, color]) => (
                <div key={label as string} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: color as string }}>{val}/{max}</span>
                  </div>
                  <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(Number(val)/Number(max))*100}%`, background: color as string, borderRadius: 99, animation: "barIn 1s ease-out forwards" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes dashIn { from { stroke-dashoffset: 150; } to { stroke-dashoffset: 28; } }
          @keyframes barIn { from { width: 0; } }
        `}</style>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>

        {/* ===== TAB 1: JD vs Resume ===== */}
        {activeTab === "jd" && (
          <div className="animate-fade-up animate-delay-1">
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["jd", "role"] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setAnalysisResult(null); }}
                  style={mode === m ? { ...btnPrimary, padding: "9px 20px", fontSize: 13 } : { ...btnOutline, padding: "8px 20px", fontSize: 13 }}>
                  {m === "jd" ? "I have a JD" : "No JD, pick a role"}
                </button>
              ))}
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24, background: "#f9fafb", borderRadius: 12, padding: "10px 20px", border: "1px solid var(--color-gray-200)" }}>
              {[
                { n: "1", label: "Upload Resume", done: !!(resumeFile || resumeText) },
                { n: "2", label: mode === "jd" ? "Add Job Description" : "Pick Target Role", done: !!(jdText || jdFile || selectedRole || customRole) },
                { n: "3", label: "Get Analysis", done: false },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.done ? "#16a34a" : i === 0 && !(resumeFile || resumeText) ? "var(--color-red)" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {step.done
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                        : <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 && !(resumeFile || resumeText) ? "#fff" : "#999" }}>{step.n}</span>
                      }
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: step.done ? "#16a34a" : "#555", whiteSpace: "nowrap" }}>{step.label}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 1.5, background: step.done ? "#16a34a" : "#e5e7eb", margin: "0 12px" }} />}
                </div>
              ))}
            </div>

            {/* Target role selector above resume when mode is role */}
            {mode === "role" && (
              <div style={{ marginBottom: 16, maxWidth: 600, margin: "0 auto 20px" }}>
                <SectionLabel>Target Role</SectionLabel>
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <select
                    value={selectedRole || customRole}
                    onChange={e => { setSelectedRole(e.target.value); setCustomRole(e.target.value); }}
                    style={{ width: "100%", padding: "12px 36px 12px 14px", fontSize: 14, border: "1.5px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", outline: "none", appearance: "none" as const, background: "#fff", cursor: "pointer", color: selectedRole ? "var(--color-black)" : "var(--color-gray-400)", fontFamily: "var(--font-body)" }}>
                    <option value="">Select a target role...</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" as const }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <input value={customRole} onChange={e => { setCustomRole(e.target.value); setSelectedRole(""); }}
                  placeholder="Or type a custom role..."
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" as const }} />
              </div>
            )}

            <div style={{ display: mode === "role" ? "flex" : "grid", gridTemplateColumns: "1fr 1fr", justifyContent: "center", gap: 20, marginBottom: 20, alignItems: "stretch" }}>
              {/* Resume */}
              <Card style={{ width: mode === "role" ? "min(600px, 100%)" : undefined, borderColor: "var(--color-red)", borderWidth: 2 }}>
                <SectionLabel>Your Resume</SectionLabel>
                {/* Segmented control */}
                <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 10, padding: 3, marginBottom: 14, gap: 2 }}>
                  {(["upload", "paste"] as ResumeInputMode[]).map(m => (
                    <button key={m} onClick={() => { setResumeInputMode(m); setResumeFile(null); setRawResumeFile(null); setResumeText(""); setResumePreviewUrl(null); }}
                      style={{ padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: resumeInputMode === m ? "#fff" : "transparent", color: resumeInputMode === m ? "var(--color-red)" : "var(--color-gray-500)", boxShadow: resumeInputMode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
                      {m === "upload" ? "📎 Upload file" : "✏️ Paste text"}
                    </button>
                  ))}
                </div>

                {resumeInputMode === "upload" ? (
                  <>
                    {/* Show dropzone only when no file uploaded */}
                    {!rawResumeFile && (
                      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed var(--color-gray-200)", borderRadius: "var(--radius-md)", padding: 40, cursor: "pointer", background: "var(--color-gray-100)", marginBottom: 12, transition: "all 0.15s", minHeight: 420 }}>
                        <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleResumeUpload} />
                        <span style={{ fontSize: 28, marginBottom: 6 }}>📄</span>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-gray-600)", margin: 0 }}>Click to upload PDF or DOCX</p>
                        <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 3 }}>Supports PDF, DOCX, TXT</p>
                      </label>
                    )}
                    {/* PDF preview */}
                    {resumePreviewUrl && (
                      <PdfPreview
                        url={resumePreviewUrl}
                        fileName={rawResumeFile?.name ?? ""}
                        fileSize={rawResumeFile ? (rawResumeFile.size / 1024).toFixed(0) + " KB" : ""}
                        onReplace={() => { setResumeFile(null); setResumePreviewUrl(null); setRawResumeFile(null); setPdfZoom(100); }}
                        onFileChange={handleResumeUpload}
                      />
                    )}
                    {/* DOCX notice */}
                    {rawResumeFile && !resumePreviewUrl && (
                      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 9, fontWeight: 800, color: "#2563eb" }}>DOC</span>
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#111" }}>{rawResumeFile?.name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#16a34a" }}>✅ Ready for analysis</p>
                            </div>
                          </div>
                          <button onClick={() => { setResumeFile(null); setRawResumeFile(null); }}
                            style={{ background: "none", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#555", padding: "4px 12px", fontWeight: 500 }}>
                            Replace
                          </button>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "#fff", cursor: "pointer", fontSize: 12, color: "#666", fontWeight: 500 }}>
                          <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleResumeUpload} />
                          📎 Upload a different file
                        </label>
                      </div>
                    )}
                  </>
                ) : (
                  <textarea value={resumeText} onChange={e => { setResumeText(e.target.value); setResumeFile(null); }}
                    placeholder="Paste your full resume text here..."
                    rows={16} style={{ ...textareaStyle, resize: "vertical", minHeight: 420 }} />
                )}
              </Card>

              {/* JD / Role — only show when mode is jd */}
              {mode === "jd" && <Card>
                {mode === "jd" ? (
                  <>
                    <SectionLabel>Job Description</SectionLabel>
                    {/* Segmented control */}
                    <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 10, padding: 3, marginBottom: 14, gap: 2 }}>
                      {(["paste", "upload"] as const).map(m => (
                        <button key={m} onClick={() => { setJdInputMode(m); setJdFile(null); setJdText(""); setJdPreviewUrl(null); }}
                          style={{ padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: jdInputMode === m ? "#fff" : "transparent", color: jdInputMode === m ? "var(--color-red)" : "var(--color-gray-500)", boxShadow: jdInputMode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s", fontFamily: "var(--font-body)" }}>
                          {m === "upload" ? "📎 Upload file" : "✏️ Paste text"}
                        </button>
                      ))}
                    </div>

                    {jdInputMode === "paste" ? (
                      <>
                      <textarea value={jdText} onChange={e => setJdText(e.target.value)}
                        placeholder="Paste the full job description..."
                        rows={16} style={{ ...textareaStyle, minHeight: 420, height: "100%", resize: "none" as const, flex: 1 }} />
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: jdText.split(/\s+/).filter(Boolean).length >= 200 ? "#16a34a" : "#aaa", textAlign: "right" }}>
                        {jdText.split(/\s+/).filter(Boolean).length} words{jdText.split(/\s+/).filter(Boolean).length < 200 ? " · paste 200+ words for best results" : " · ✓ great length"}
                      </p>
                    </>
                    ) : (
                      <>
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${jdFile ? "#16a34a" : "var(--color-gray-200)"}`, borderRadius: "var(--radius-md)", padding: 40, cursor: "pointer", background: jdFile ? "rgba(22,163,74,0.04)" : "var(--color-gray-100)", marginBottom: 12, transition: "all 0.15s", minHeight: 420 }}>
                          <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={async e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setJdFile(f);
                            if (f.type === "application/pdf") {
                              setJdPreviewUrl(URL.createObjectURL(f));
                            } else {
                              setJdPreviewUrl(null);
                              const text = await f.text();
                              setJdText(text);
                            }
                          }} />
                          {jdFile ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>{jdFile.name.split(".").pop()?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", margin: 0 }}>{jdFile.name}</p>
                                <p style={{ fontSize: 11, color: "#16a34a", opacity: 0.7, margin: 0 }}>{(jdFile.size / 1024).toFixed(0)} KB · click to replace</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span style={{ fontSize: 28, marginBottom: 6 }}>📄</span>
                              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-gray-600)", margin: 0 }}>Click to upload JD file</p>
                              <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 3 }}>Supports PDF, DOCX, TXT</p>
                            </>
                          )}
                        </label>
                        {jdPreviewUrl && (
                          <div style={{ border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--color-gray-100)", borderBottom: "1px solid var(--color-gray-200)" }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--color-gray-600)" }}>📄 {jdFile?.name}</p>
                              <button onClick={() => { setJdFile(null); setJdPreviewUrl(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--color-gray-400)", lineHeight: 1 }}>×</button>
                            </div>
                            <iframe src={jdPreviewUrl} style={{ width: "100%", height: "calc(100vh - 400px)", minHeight: 500, border: "none", display: "block" }} title="JD preview" />
                          </div>
                        )}
                        {jdFile && !jdPreviewUrl && (
                          <div style={{ padding: "10px 12px", background: "rgba(22,163,74,0.06)", borderRadius: "var(--radius-md)", border: "1px solid rgba(22,163,74,0.2)" }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✅ {jdFile.name} uploaded and ready for analysis</p>
                          </div>
                        )}
                      </>
                    )}
                  </>) : (
                  <>
                    <SectionLabel>Target Role</SectionLabel>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedRole || customRole}
                        onChange={e => { setSelectedRole(e.target.value); setCustomRole(e.target.value); }}
                        style={{ width: "100%", padding: "12px 36px 12px 14px", fontSize: 14, border: "1.5px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", outline: "none", appearance: "none" as const, background: "#fff", cursor: "pointer", color: selectedRole ? "var(--color-black)" : "var(--color-gray-400)", fontFamily: "var(--font-body)" }}>
                        <option value="">Select a target role...</option>
                        {ROLES.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" as const }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    <input
                      value={customRole}
                      onChange={e => { setCustomRole(e.target.value); setSelectedRole(""); }}
                      placeholder="Or type a custom role..."
                      style={{ ...inputStyle, marginTop: 10, width: "100%", boxSizing: "border-box" as const }}
                    />
                  </>
                )}
              </Card>}
            </div>

            <div style={{ marginBottom: 40, marginTop: 8 }}>
              <button onClick={handleAnalyze} disabled={analyzing || (!resumeFile && !resumeText)}
                style={{ ...btnPrimary, width: "100%", justifyContent: "center", padding: "16px 32px", fontSize: 16, borderRadius: 14, opacity: analyzing || (!resumeFile && !resumeText) ? 0.5 : 1, boxShadow: analyzing || (!resumeFile && !resumeText) ? "none" : "0 4px 20px rgba(200,16,46,0.35)" }}>
                {analyzing
                  ? <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Analyzing your resume...</>
                  : <> Analyze Resume <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>
                }
              </button>
              {(!resumeFile && !resumeText) && <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8 }}>Upload or paste your resume to continue</p>}
            </div>

            {analyzing && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 40, height: 40, border: "3px solid var(--color-gray-200)", borderTopColor: "var(--color-red)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ fontSize: 14, color: "var(--color-gray-400)" }}>Analyzing your resume like a real ATS...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {analysisResult && !analyzing && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Score Hero */}
                <Card>
                  <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <ScoreGauge score={analysisResult.score} label="Match Score" />
                      {analysisResult.atsProbability !== undefined && (
                        <div style={{ textAlign: "center", marginTop: 8 }}>
                          <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 2 }}>ATS Pass Probability</p>
                          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, color: analysisResult.atsProbability >= 70 ? "#16a34a" : analysisResult.atsProbability >= 50 ? "#ca8a04" : "#dc2626" }}>
                            {analysisResult.atsProbability}%
                          </p>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                        {[
                          { label: "Length", value: analysisResult.resumeLength || "—" },
                          { label: "GPA", value: analysisResult.hasGPA ? "✓ Present" : "✗ Missing", ok: analysisResult.hasGPA },
                          { label: "GitHub", value: analysisResult.hasGitHub ? "✓ Present" : "✗ Missing", ok: analysisResult.hasGitHub },
                          { label: "LinkedIn", value: analysisResult.hasLinkedIn ? "✓ Present" : "✗ Missing", ok: analysisResult.hasLinkedIn },
                        ].map(item => (
                          <div key={item.label} style={{ padding: "12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                            <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 4 }}>{item.label}</p>
                            <p style={{ fontSize: 12, fontWeight: 600, color: item.ok === false ? "#dc2626" : item.ok === true ? "#16a34a" : "var(--color-black)" }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {analysisResult.firstPersonIssues && <IssuePill level="critical" />}
                        {analysisResult.tenseMixing && <IssuePill level="improve" />}
                        {analysisResult.impactVsResponsibility && (
                          <span style={{ fontSize: 12, color: "var(--color-gray-400)" }}>Impact style: <strong style={{ color: "var(--color-black)" }}>{analysisResult.impactVsResponsibility}</strong></span>
                        )}
                        <button onClick={() => setActiveTab("chat")} style={{ ...btnOutline, padding: "6px 14px", fontSize: 12, marginLeft: "auto" }}>
                          Fix with Career Assistant →
                        </button>
                      </div>
                      {/* Score breakdown */}
                      {analysisResult.atsProbabilityExplanation && (
                        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--color-gray-100)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--color-red)" }}>
                          <p style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: 1.5 }}>
                            <strong style={{ color: "var(--color-black)" }}>Score breakdown: </strong>
                            {analysisResult.atsProbabilityExplanation}
                          </p>
                        </div>
                      )}
                      {/* Projected score */}
                      {analysisResult.projectedScoreNote && (
                        <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(22,163,74,0.04)", borderRadius: "var(--radius-md)", border: "1px solid rgba(22,163,74,0.2)" }}>
                          <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>📈 {analysisResult.projectedScoreNote}</p>
                        </div>
                      )}
                      {/* ATS System Breakdown */}
                      {analysisResult.atsSystemBreakdown && (
                        <div style={{ marginTop: 12 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>ATS System Breakdown</p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {Object.entries(analysisResult.atsSystemBreakdown).map(([sys, info]) => {
                              const color = info.status === "pass" ? "#16a34a" : info.status === "warn" ? "#ca8a04" : "#dc2626";
                              return (
                                <div key={sys} style={{ flex: 1, minWidth: 140, padding: "10px 12px", border: `1px solid ${color}30`, borderRadius: "var(--radius-md)", background: `${color}06` }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <p style={{ fontSize: 11, color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{sys}</p>
                                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{info.status === "pass" ? "✓ Pass" : info.status === "warn" ? "⚠ Warn" : "✗ Fail"}</span>
                                  </div>
                                  <p style={{ fontSize: 11, color: "var(--color-gray-600)", lineHeight: 1.4 }}>{info.note}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <ScanTimeline scans={tab1History} showAll={showAllTab1} onToggle={() => { setShowAllTab1(!showAllTab1); loadHistory(mode === "jd" ? "JD_MATCH" : "ROLE_RATE", setTab1History, resumeFile?.name, !showAllTab1); }} />
                </Card>

                {/* Seniority Signal */}
                {analysisResult.senioritySignal && (
                  <Card style={{ borderLeft: "4px solid var(--color-red)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>🎯</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-red)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Seniority Signal</p>
                        <p style={{ fontSize: 14, color: "var(--color-black)", lineHeight: 1.6 }}>{analysisResult.senioritySignal}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Wins */}
                {(analysisResult.quickWins?.length || 0) > 0 && (
                  <Card>
                    <SectionLabel>⚡ Quick Wins — fix these first</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {analysisResult.quickWins?.map((win, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", background: win.impact === "high" ? "rgba(200,16,46,0.02)" : "#fff" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: win.impact === "high" ? "var(--color-red)" : "var(--color-gray-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: win.impact === "high" ? "#fff" : "var(--color-gray-600)" }}>{i + 1}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, color: "var(--color-black)", fontWeight: 500, marginBottom: 4 }}>{win.action}</p>
                            <div style={{ display: "flex", gap: 8 }}>
                              <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-gray-200)", color: "var(--color-gray-400)" }}>⏱ {win.effort}</span>
                              <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: "var(--radius-full)", background: win.impact === "high" ? "rgba(200,16,46,0.08)" : "rgba(202,138,4,0.08)", color: win.impact === "high" ? "var(--color-red)" : "#ca8a04", fontWeight: 600 }}>{win.impact} impact</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Keywords */}
                {mode === "jd" && (
                  <Card>
                    <SectionLabel>Keyword Analysis</SectionLabel>
                    {(analysisResult.requiredKeywords?.length || 0) > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gray-600)", marginBottom: 8 }}>Required</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {analysisResult.requiredKeywords?.map(k => {
                            const matched = analysisResult.matchedKeywords?.includes(k);
                            const semantic = analysisResult.semanticMatches?.includes(k);
                            const color = matched ? "#16a34a" : semantic ? "#ca8a04" : "#dc2626";
                            const bg = matched ? "rgba(22,163,74,0.06)" : semantic ? "rgba(202,138,4,0.06)" : "rgba(220,38,38,0.06)";
                            return (
                              <span key={k} style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", border: `1px solid ${color}40`, background: bg, fontSize: 12, fontWeight: 500, color }}>
                                {matched ? "✓ " : semantic ? "~ " : "✗ "}{k}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {(analysisResult.preferredKeywords?.length || 0) > 0 && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gray-600)", marginBottom: 8 }}>Preferred</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {analysisResult.preferredKeywords?.map(k => {
                            const matched = analysisResult.matchedKeywords?.includes(k);
                            return (
                              <span key={k} style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-gray-200)", background: matched ? "rgba(22,163,74,0.06)" : "var(--color-gray-100)", fontSize: 12, fontWeight: 500, color: matched ? "#16a34a" : "var(--color-gray-600)" }}>
                                {matched ? "✓ " : ""}{k}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-gray-200)" }}>
                      {[["#16a34a", "Exact match"], ["#ca8a04", "Semantic match"], ["#dc2626", "Missing"]].map(([color, label]) => (
                        <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--color-gray-400)" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />{label}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Role scores */}
                {mode === "role" && analysisResult.bars && (
                  <Card>
                    <SectionLabel>Role Fit Scores</SectionLabel>
                    {Object.entries(analysisResult.bars).map(([k, v]) => {
                      const { grade, color } = getLetterGrade(v);
                      return (
                        <div key={k} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "var(--color-gray-600)", fontWeight: 500 }}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 4, background: `${color}15`, color }}>{grade}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color }}>{v}</span>
                            </div>
                          </div>
                          <div style={{ height: 6, background: "var(--color-gray-200)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 99, background: color, width: `${v}%`, transition: "width 0.7s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                )}

                {/* Role Fit */}
                {mode === "jd" && (analysisResult.seniorityMatch || analysisResult.domainMatch) && (
                  <Card>
                    <SectionLabel>Role Fit Analysis</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Seniority Match", value: analysisResult.seniorityMatch, note: analysisResult.seniorityNote },
                        { label: "Domain Match", value: analysisResult.domainMatch, note: analysisResult.domainNote },
                        { label: "Experience Years", value: analysisResult.experienceYearsMatch ? "strong" : "weak", note: analysisResult.experienceNote },
                        { label: "Leadership Signals", value: analysisResult.leadershipSignals, note: undefined },
                      ].filter(i => i.value).map(item => {
                        const isGood = item.value === "strong" || item.value === "moderate";
                        return (
                          <div key={item.label} style={{ padding: 14, border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", background: "var(--color-gray-100)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                              <span style={{ padding: "2px 10px", borderRadius: "var(--radius-full)", fontSize: 11, fontWeight: 600, background: isGood ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)", color: isGood ? "#16a34a" : "#dc2626" }}>
                                {item.value}
                              </span>
                            </div>
                            {item.note && <p style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: 1.5 }}>{item.note}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* Weak Verbs */}
                {(analysisResult.weakVerbs?.length || 0) > 0 && (
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <SectionLabel>Weak Verbs — swap these out</SectionLabel>
                      <IssuePill level="improve" />
                    </div>
                    {analysisResult.weakVerbs?.slice(0, 5).map(v => <WeakVerbRow key={v} verb={v} />)}
                  </Card>
                )}

                {/* Impact Score + Achievement Ratio */}
                {(analysisResult.impactScore !== undefined || analysisResult.achievementRatio) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {analysisResult.impactScore !== undefined && (
                      <Card>
                        <SectionLabel>📊 Impact Score</SectionLabel>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                          <div style={{ position: "relative", width: 64, height: 64 }}>
                            <svg width="64" height="64" viewBox="0 0 64 64">
                              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-gray-200)" strokeWidth="6" />
                              <circle cx="32" cy="32" r="26" fill="none"
                                stroke={analysisResult.impactScore >= 70 ? "#16a34a" : analysisResult.impactScore >= 50 ? "#ca8a04" : "#dc2626"}
                                strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={`${(analysisResult.impactScore / 100) * 163} 163`}
                                transform="rotate(-90 32 32)" />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: analysisResult.impactScore >= 70 ? "#16a34a" : analysisResult.impactScore >= 50 ? "#ca8a04" : "#dc2626" }}>{analysisResult.impactScore}</span>
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-black)" }}>{analysisResult.impactScore >= 70 ? "Strong quantification" : analysisResult.impactScore >= 50 ? "Needs more numbers" : "Most bullets lack metrics"}</p>
                            {analysisResult.impactNote && <p style={{ fontSize: 12, color: "var(--color-gray-400)", marginTop: 2 }}>{analysisResult.impactNote}</p>}
                          </div>
                        </div>
                      </Card>
                    )}
                    {analysisResult.achievementRatio && (
                      <Card>
                        <SectionLabel>🏆 Achievement vs Responsibility</SectionLabel>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600, background: analysisResult.achievementRatio === "mostly achievements" ? "rgba(22,163,74,0.08)" : analysisResult.achievementRatio === "mixed" ? "rgba(202,138,4,0.08)" : "rgba(220,38,38,0.08)", color: analysisResult.achievementRatio === "mostly achievements" ? "#16a34a" : analysisResult.achievementRatio === "mixed" ? "#ca8a04" : "#dc2626" }}>
                            {analysisResult.achievementRatio}
                          </span>
                        </div>
                        {analysisResult.achievementNote && <p style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: 1.5 }}>{analysisResult.achievementNote}</p>}
                        <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 8 }}>Achievements: "increased X by Y%" · Responsibilities: "responsible for X"</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Buzzwords + Repeated Verbs */}
                {((analysisResult.buzzwordsFound?.length || 0) > 0 || (analysisResult.repeatedVerbs?.length || 0) > 0) && (
                  <Card>
                    <SectionLabel>🚩 Language Issues</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(analysisResult.buzzwordsFound?.length || 0) > 0 && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <IssuePill level="improve" />
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-black)" }}>Buzzwords — remove these</p>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {analysisResult.buzzwordsFound?.map(b => (
                              <span key={b} style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", background: "rgba(202,138,4,0.06)", border: "1px solid rgba(202,138,4,0.2)", fontSize: 12, fontWeight: 500, color: "#ca8a04" }}>"{b}"</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(analysisResult.repeatedVerbs?.length || 0) > 0 && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <IssuePill level="nice" />
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-black)" }}>Repeated verbs — vary these</p>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {analysisResult.repeatedVerbs?.map(v => (
                              <span key={v} style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", background: "var(--color-gray-100)", border: "1px solid var(--color-gray-200)", fontSize: 12, fontWeight: 500, color: "var(--color-gray-600)" }}>{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Structure & Formatting */}
                {(analysisResult.dateConsistency || analysisResult.sectionOrder || analysisResult.densityScore || analysisResult.industryKeywordDensity) && (
                  <Card>
                    <SectionLabel>📐 Structure & Formatting</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {analysisResult.dateConsistency && (
                        <div style={{ padding: "10px 12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 3 }}>Date Format</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: analysisResult.dateConsistency === "consistent" ? "#16a34a" : "#ca8a04" }}>{analysisResult.dateConsistency === "consistent" ? "✓" : "⚠"}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-black)" }}>{analysisResult.dateConsistency}</span>
                          </div>
                          {analysisResult.dateNote && <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 3 }}>{analysisResult.dateNote}</p>}
                        </div>
                      )}
                      {analysisResult.sectionOrder && (
                        <div style={{ padding: "10px 12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 3 }}>Section Order</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: analysisResult.sectionOrder === "correct" ? "#16a34a" : "#ca8a04" }}>{analysisResult.sectionOrder === "correct" ? "✓" : "⚠"}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-black)" }}>{analysisResult.sectionOrder}</span>
                          </div>
                          {analysisResult.sectionOrderNote && <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 3 }}>{analysisResult.sectionOrderNote}</p>}
                        </div>
                      )}
                      {analysisResult.densityScore && (
                        <div style={{ padding: "10px 12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 3 }}>Density</p>
                          <span style={{ fontSize: 12, fontWeight: 600, color: analysisResult.densityScore === "well-spaced" ? "#16a34a" : "#ca8a04" }}>{analysisResult.densityScore}</span>
                        </div>
                      )}
                      {analysisResult.industryKeywordDensity && (
                        <div style={{ padding: "10px 12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)" }}>
                          <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginBottom: 3 }}>Industry Language</p>
                          <span style={{ fontSize: 12, fontWeight: 600, color: analysisResult.industryKeywordDensity === "strong" ? "#16a34a" : analysisResult.industryKeywordDensity === "moderate" ? "#ca8a04" : "#dc2626" }}>{analysisResult.industryKeywordDensity}</span>
                          {analysisResult.industryKeywordNote && <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 3 }}>{analysisResult.industryKeywordNote}</p>}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Bullet Length Issues */}
                {(analysisResult.bulletLengthIssues?.length || 0) > 0 && (
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <SectionLabel>📏 Bullet Length Issues</SectionLabel>
                      <IssuePill level="nice" />
                    </div>
                    {analysisResult.bulletLengthIssues?.slice(0, 3).map((b, i) => (
                      <div key={i} style={{ padding: "10px 12px", background: "var(--color-gray-100)", borderRadius: "var(--radius-md)", marginBottom: 8, borderLeft: "3px solid var(--color-gray-200)" }}>
                        <p style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: 1.5 }}>"{b}"</p>
                        <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 4 }}>→ Keep bullets to 1-2 lines, start with a strong verb</p>
                      </div>
                    ))}
                  </Card>
                )}

                {/* Missing Metrics */}
                {(analysisResult.missingMetrics?.length || 0) > 0 && (
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <SectionLabel>Bullets Missing Numbers</SectionLabel>
                      <IssuePill level="improve" />
                    </div>
                    {analysisResult.missingMetrics?.slice(0, 3).map((b, i) => (
                      <div key={i} style={{ padding: "12px 14px", background: "var(--color-gray-100)", borderRadius: "var(--radius-md)", marginBottom: 8, borderLeft: "3px solid var(--color-red)" }}>
                        <p style={{ fontSize: 13, color: "var(--color-gray-600)", marginBottom: 4, lineHeight: 1.5 }}>"{b}"</p>
                        <p style={{ fontSize: 12, color: "var(--color-red)", fontWeight: 500 }}>→ Add scale, %, users, or time saved</p>
                      </div>
                    ))}
                  </Card>
                )}

                {/* Strongest Bullets */}
                {(analysisResult.strongestBullets?.length || 0) > 0 && (
                  <Card>
                    <SectionLabel>⭐ Your Strongest Bullets</SectionLabel>
                    {analysisResult.strongestBullets?.map((b, i) => (
                      <div key={i} style={{ padding: "12px 14px", background: "rgba(22,163,74,0.04)", borderRadius: "var(--radius-md)", marginBottom: 8, borderLeft: "3px solid #16a34a" }}>
                        <p style={{ fontSize: 13, color: "var(--color-black)", lineHeight: 1.6 }}>{b}</p>
                        <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 500, marginTop: 4 }}>✓ Strong action verb + measurable result</p>
                      </div>
                    ))}
                  </Card>
                )}

                {/* Improvements */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {(analysisResult.topImprovements?.length || 0) > 0 && (
                    <Card>
                      <SectionLabel>🎯 Top Things to Add</SectionLabel>
                      {analysisResult.topImprovements?.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-red-muted)", color: "var(--color-red)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <p style={{ fontSize: 13, color: "var(--color-gray-600)", lineHeight: 1.5 }}>{s}</p>
                        </div>
                      ))}
                    </Card>
                  )}
                  {(analysisResult.suggestions?.length || 0) > 0 && (
                    <Card>
                      <SectionLabel>✏️ Rewrite Suggestions</SectionLabel>
                      {analysisResult.suggestions?.map((s, i) => (
                        <div key={i} style={{ padding: "10px 12px", background: "var(--color-gray-100)", borderRadius: "var(--radius-md)", marginBottom: 8, borderLeft: "3px solid var(--color-red)" }}>
                          <p style={{ fontSize: 13, color: "var(--color-gray-600)", lineHeight: 1.5 }}>{s}</p>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ===== TAB 2: ATS Scanner ===== */}
        {activeTab === "ats" && (
          <div className="animate-fade-up animate-delay-1">
            <Card style={{ marginBottom: 20 }}>
              <SectionLabel>Your Resume</SectionLabel>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                border: `2px dashed ${atsResumeFile ? "#16a34a" : "var(--color-gray-200)"}`,
                borderRadius: "var(--radius-md)", padding: 20, cursor: "pointer",
                background: atsResumeFile ? "rgba(22,163,74,0.04)" : "var(--color-gray-100)", marginBottom: 12,
              }}>
                <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleAtsResumeUpload} />
                {atsResumeFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>{atsResumeFile.name.split(".").pop()?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{atsResumeFile.name}</p>
                      <p style={{ fontSize: 11, color: "#16a34a", opacity: 0.7 }}>Ready · click to replace</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 24, marginBottom: 6 }}>📄</span>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-gray-600)" }}>Upload PDF or DOCX</p>
                    <p style={{ fontSize: 11, color: "var(--color-gray-400)", marginTop: 2 }}>or paste below</p>
                  </>
                )}
              </label>
              <textarea value={atsResumeText} onChange={e => { setAtsResumeText(e.target.value); setAtsResumeFile(null); }}
                placeholder="Or paste resume text here..."
                rows={5} style={textareaStyle} />
            </Card>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
              <button onClick={handleATSScan} disabled={atsScanning || (!atsResumeFile && !atsResumeText)}
                style={{ ...btnPrimary, opacity: atsScanning || (!atsResumeFile && !atsResumeText) ? 0.5 : 1 }}>
                {atsScanning ? "Scanning..." : "Scan Resume →"}
              </button>
            </div>

            {atsScanning && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 40, height: 40, border: "3px solid var(--color-gray-200)", borderTopColor: "var(--color-red)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ fontSize: 14, color: "var(--color-gray-400)" }}>Running through Taleo, Workday, Greenhouse parsers...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {atsResult && !atsScanning && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Score */}
                <Card>
                  <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <ScoreGauge score={atsResult.overallScore} label={atsResult.verdict} />
                    </div>
                    <div style={{ flex: 1 }}>
                      {/* Score explanation */}
                      {atsResult.scoreExplanation && (
                        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--color-gray-100)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--color-red)" }}>
                          <p style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: 1.5 }}>
                            <strong style={{ color: "var(--color-black)" }}>Score breakdown: </strong>{atsResult.scoreExplanation}
                          </p>
                        </div>
                      )}
                      {/* Projected score */}
                      {atsResult.projectedScoreNote && (
                        <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(22,163,74,0.04)", borderRadius: "var(--radius-md)", border: "1px solid rgba(22,163,74,0.2)" }}>
                          <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                            📈 {atsResult.projectedScoreNote}
                          </p>
                        </div>
                      )}
                      <SectionLabel>ATS System Breakdown</SectionLabel>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                        {Object.entries(atsResult.atsSystems || {}).map(([sys, status]) => {
                          const color = status === "pass" ? "#16a34a" : status === "warn" ? "#ca8a04" : "#dc2626";
                          const detail = atsResult.atsSystemDetails?.[sys];
                          return (
                            <div key={sys} style={{ padding: "12px 16px", border: `1px solid ${color}30`, borderRadius: "var(--radius-md)", background: `${color}06`, flex: 1, minWidth: 120 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: detail ? 6 : 0 }}>
                                <p style={{ fontSize: 11, color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{sys}</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color }}>{status === "pass" ? "✓ Pass" : status === "warn" ? "⚠ Warn" : "✗ Fail"}</p>
                              </div>
                              {detail && <p style={{ fontSize: 11, color: "var(--color-gray-600)", lineHeight: 1.4 }}>{detail}</p>}
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => setActiveTab("chat")} style={{ ...btnOutline, padding: "8px 16px", fontSize: 12 }}>
                        Fix with Career Assistant →
                      </button>
                    </div>
                  </div>
                  <ScanTimeline scans={tab2History} showAll={showAllTab2} onToggle={() => { setShowAllTab2(!showAllTab2); loadHistory("ATS", setTab2History, atsResumeFile?.name, !showAllTab2); }} />
                </Card>

                {/* Contact + Sections */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {atsResult.contactFields && (
                    <Card>
                      <SectionLabel>Contact Info Detected</SectionLabel>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {Object.entries(atsResult.contactFields).map(([field, found]) => (
                          <div key={field} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: "var(--radius-md)", background: found ? "rgba(22,163,74,0.04)" : "rgba(220,38,38,0.04)", border: `1px solid ${found ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)"}` }}>
                            <span style={{ fontSize: 13, color: found ? "#16a34a" : "#dc2626" }}>{found ? "✓" : "✗"}</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-gray-600)", textTransform: "capitalize" }}>{field}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {(atsResult.detectedSections?.length || 0) > 0 && (
                    <Card>
                      <SectionLabel>Sections</SectionLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {atsResult.detectedSections?.map(s => (
                          <span key={s} style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", fontSize: 12, fontWeight: 500, color: "#16a34a" }}>✓ {s}</span>
                        ))}
                        {atsResult.missingSections?.map((s, idx) => {
                          const sec = typeof s === "string" ? { name: s, importance: "Recommended" } : s as { name: string; importance: string };
                          const isOptional = sec.importance?.toLowerCase().includes("optional");
                          return (
                            <span key={idx} style={{ padding: "3px 12px", borderRadius: "var(--radius-full)", background: isOptional ? "rgba(107,114,128,0.06)" : "rgba(220,38,38,0.06)", border: `1px solid ${isOptional ? "rgba(107,114,128,0.2)" : "rgba(220,38,38,0.2)"}`, fontSize: 12, fontWeight: 500, color: isOptional ? "#6b7280" : "#dc2626" }}>
                              ✗ {sec.name} · {isOptional ? "Optional" : "Recommended"}
                            </span>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Quick Fix Checklist */}
                {(atsResult.quickFixChecklist?.length || 0) > 0 && (
                  <Card>
                    <SectionLabel>⚡ Fix These First — ranked by impact</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {atsResult.quickFixChecklist?.map((item) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", background: item.impact === "high" ? "rgba(200,16,46,0.02)" : "#fff" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: item.impact === "high" ? "var(--color-red)" : item.impact === "medium" ? "#ca8a04" : "var(--color-gray-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: item.impact !== "low" ? "#fff" : "var(--color-gray-600)" }}>{item.id}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-black)", marginBottom: 4 }}>{item.action}</p>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-gray-200)", color: "var(--color-gray-400)" }}>⏱ {item.effort}</span>
                              <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: "var(--radius-full)", background: item.impact === "high" ? "rgba(200,16,46,0.08)" : "rgba(202,138,4,0.08)", color: item.impact === "high" ? "var(--color-red)" : "#ca8a04", fontWeight: 600 }}>{item.impact} impact</span>
                              {item.scoreGain && <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: "var(--radius-full)", background: "rgba(22,163,74,0.08)", color: "#16a34a", fontWeight: 600 }}>{item.scoreGain}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Checks grid */}
                <Card>
                  <SectionLabel>Detailed Parse Checks</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {(atsResult.checks || []).map(c => {
                      const color = c.status === "pass" ? "#16a34a" : c.status === "warn" ? "#ca8a04" : "#dc2626";
                      const icon = c.status === "pass" ? "✓" : c.status === "warn" ? "⚠" : "✗";
                      return (
                        <div key={c.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)" }}>
                          <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}10`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-black)", marginBottom: 2 }}>{c.name}</p>
                            <p style={{ fontSize: 11, color: "var(--color-gray-400)", lineHeight: 1.4 }}>{c.note}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Severity issues */}
                {(atsResult.severityIssues?.length || 0) > 0 && (
                  <Card>
                    <SectionLabel>Issues by Priority</SectionLabel>
                    {atsResult.severityIssues?.map((issue, i) => {
                      const level: "critical" | "improve" | "nice" = issue.severity === "high" ? "critical" : issue.severity === "medium" ? "improve" : "nice";
                      return (
                        <div key={i} style={{ padding: "12px 14px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <IssuePill level={level} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-black)" }}>{issue.issue}</p>
                          </div>
                          <p style={{ fontSize: 12, color: "var(--color-gray-600)", paddingLeft: 2 }}>Fix: {issue.fix}</p>
                        </div>
                      );
                    })}
                  </Card>
                )}

                {/* Before/after */}
                {(atsResult.isMultiColumn || atsResult.parseSimulation) && (
                  <Card style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid var(--color-gray-200)" }}>
                      {[{ label: "✗ How ATS reads it", good: false }, { label: "✓ How it should look", good: true }].map(item => (
                        <button key={item.label} onClick={() => setShowAtsGood(item.good)}
                          style={{ flex: 1, padding: "12px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", background: showAtsGood === item.good ? (item.good ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.06)") : "#fff", color: showAtsGood === item.good ? (item.good ? "#16a34a" : "#dc2626") : "var(--color-gray-400)", borderBottom: showAtsGood === item.good ? `2px solid ${item.good ? "#16a34a" : "#dc2626"}` : "2px solid transparent", transition: "all 0.15s" }}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ padding: 20, background: "var(--color-gray-100)", fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, minHeight: 120 }}>
                      <pre style={{ color: showAtsGood ? "#16a34a" : "#dc2626", whiteSpace: "pre-wrap" }}>
                        {showAtsGood ? (atsResult.parseSimulation?.clean || "Clean format — ATS reads this correctly.") : (atsResult.parseSimulation?.garbled || "Multi-column detected — content may be scrambled.")}
                      </pre>
                    </div>
                  </Card>
                )}

              </div>
            )}
          </div>
        )}

        {/* ===== TAB 3: Career Assistant ===== */}
        {activeTab === "chat" && (
          <div className="animate-fade-up animate-delay-1" style={{ display: "flex", gap: 20, height: "calc(100vh - 200px)", minHeight: 640 }}>

            {/* Sidebar */}
            <div style={{ width: 240, flexShrink: 0, border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column", background: "#fff" }}>
              <div style={{ padding: 12, borderBottom: "1px solid var(--color-gray-200)", display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={startNewChat} style={{ ...btnPrimary, width: "100%", justifyContent: "center", padding: "9px 16px", fontSize: 13 }}>
                  + New Chat
                </button>
                <div style={{ position: "relative" }}>
                  <input
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                    placeholder="Search chats..."
                    style={{ width: "100%", fontSize: 12, padding: "7px 10px 7px 28px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", color: "var(--color-black)", background: "var(--color-gray-100)", outline: "none", boxSizing: "border-box" }}
                  />
                  <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
                {sessions.filter(s => !chatSearch || s.title?.toLowerCase().includes(chatSearch.toLowerCase()) || s.messages?.[0]?.content?.toLowerCase().includes(chatSearch.toLowerCase())).length === 0 && chatSearch ? (
                  <p style={{ fontSize: 12, color: "var(--color-gray-400)", textAlign: "center", padding: "20px 10px" }}>No chats found</p>
                ) : (
                  Object.entries(
                    sessions
                      .filter(s => !chatSearch || s.title?.toLowerCase().includes(chatSearch.toLowerCase()) || s.messages?.[0]?.content?.toLowerCase().includes(chatSearch.toLowerCase()))
                      .reduce((groups: Record<string, ChatSession[]>, s) => {
                        const month = new Date(s.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                        if (!groups[month]) groups[month] = [];
                        groups[month].push(s);
                        return groups;
                      }, {})
                  ).map(([month, sess]) => (
                    <div key={month}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-red)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 8px 4px" }}>{month}</p>
                      {sess.map(s => (
                        <button key={s.id} onClick={() => loadSession(s)}
                          style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", background: activeSession === s.id ? "var(--color-red-muted)" : "transparent", borderLeft: `2px solid ${activeSession === s.id ? "var(--color-red)" : "transparent"}`, marginBottom: 2, transition: "all 0.1s" }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: activeSession === s.id ? "var(--color-red)" : "var(--color-gray-600)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.title || "Untitled chat"}
                          </p>
                          {s.messages?.[0] && (
                            <p style={{ fontSize: 11, color: "var(--color-gray-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                              {s.messages[0].content.slice(0, 36)}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat panel */}
            <div style={{ flex: 1, border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column", background: "#fff", minHeight: 600 }}>
              {/* Header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-gray-200)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontSize: 16 }}>M</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-black)" }}>NUMockBuddy Assistant</p>
                  <p style={{ fontSize: 11, color: "var(--color-gray-400)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                    online · NEU career intelligence
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {showWelcome ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--color-red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontSize: 24, margin: "0 auto 16px" }}>M</div>
                      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "var(--color-black)", marginBottom: 8 }}>
                        How can I help <span style={{ color: "var(--color-red)", fontStyle: "italic" }}>today?</span>
                      </h2>
                      <p style={{ fontSize: 14, color: "var(--color-gray-400)", maxWidth: 360 }}>Upload your resume or cover letter and ask me anything about your job search.</p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 480 }}>
                      {QUICK_CHIPS.map(chip => (
                        <button key={chip.label} onClick={() => sendMessage(chip.prompt)}
                          style={{ ...btnOutline, padding: "8px 16px", fontSize: 12 }}>
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {chatMessages.map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
                        {m.role === "assistant" && (
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--color-red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontFamily: "var(--font-display)", flexShrink: 0, marginTop: 2 }}>M</div>
                        )}
                        <div style={{
                          maxWidth: "75%", padding: "12px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
                          ...(m.role === "user"
                            ? { background: "var(--color-red)", color: "#fff", borderBottomRightRadius: 4 }
                            : { background: "var(--color-gray-100)", color: "var(--color-black)", borderBottomLeftRadius: 4, border: "1px solid var(--color-gray-200)", borderLeft: "3px solid var(--color-red)" })
                        }}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--color-red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontFamily: "var(--font-display)" }}>M</div>
                        <div style={{ padding: "10px 16px", background: "var(--color-gray-100)", borderRadius: 16, borderBottomLeftRadius: 4, border: "1px solid var(--color-gray-200)" }}>
                          <p style={{ fontSize: 13, color: "var(--color-gray-400)", fontStyle: "italic", animation: "pulse-dot 1.5s ease-in-out infinite" }}>NUMockBuddy is thinking...</p>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                )}
              </div>

              {/* File tray */}
              {attachedFiles.length > 0 && (
                <div style={{ padding: "8px 16px", borderTop: "1px solid var(--color-gray-200)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {attachedFiles.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-full)", background: "var(--color-gray-100)", fontSize: 12 }}>
                      <FileIcon name={f.name} />
                      <span style={{ color: "var(--color-gray-600)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-400)", fontSize: 13, lineHeight: 1, padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-gray-200)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "8px 12px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", background: "#fff", transition: "border-color 0.15s" }}>
                  <input type="file" ref={chatFileRef} style={{ display: "none" }} accept=".pdf,.docx,.txt" multiple onChange={handleChatFileUpload} />
                  <button onClick={() => chatFileRef.current?.click()}
                    style={{ background: "none", border: "none", cursor: "pointer", color: attachedFiles.length > 0 ? "var(--color-red)" : "var(--color-gray-400)", padding: "4px", flexShrink: 0, transition: "color 0.15s" }}
                    title="Attach files (up to 3)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput); } }}
                    placeholder="Ask anything, or attach your resume first..."
                    rows={2}
                    style={{ flex: 1, border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--color-black)", lineHeight: 1.5, background: "transparent" }} />
                  <button onClick={() => sendMessage(chatInput)} disabled={chatLoading || (!chatInput.trim() && attachedFiles.length === 0)}
                    style={{ ...btnPrimary, padding: "8px 14px", fontSize: 13, flexShrink: 0, opacity: chatLoading || (!chatInput.trim() && attachedFiles.length === 0) ? 0.4 : 1 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: 11, color: "var(--color-gray-400)", marginTop: 8 }}>attach up to 3 files · enter to send · shift+enter for newline</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
