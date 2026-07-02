import { useEffect, useState } from "react";
import { useParams as useReactParams, Link as ReactLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  Code2,
  Zap,
  Brain,
  Play,
  RotateCcw,
  Terminal,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { type Company, type Problem, getCompanyBySlug, getProblemBySlug, getDifficultyBg } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { getToken } from "@/lib/auth";
import Editor from "@monaco-editor/react";

interface LanguageTemplate {
  name: string;
  monacoLang: string;
  generate: (problem: Problem) => string;
}

const LANGUAGE_TEMPLATES: Record<string, LanguageTemplate> = {
  javascript: {
    name: "JavaScript",
    monacoLang: "javascript",
    generate: (problem) => {
      const match = (problem.optimal?.code || "").match(/function\s+(\w+)/);
      const funcName = match ? match[1] : "solution";
      const argsMatch = (problem.optimal?.code || "").match(/function\s+\w+\s*\(([^)]*)\)/);
      const args = argsMatch ? argsMatch[1] : "";

      const defaultCode = problem.optimal?.code || `function ${funcName}(${args}) {\n  // Write code here\n}`;

      let testCalls = "";
      if (problem.examples && problem.examples.length > 0) {
        problem.examples.forEach((ex) => {
          const parts = ex.input.split(",").map((part) => {
            const index = part.indexOf("=");
            return index !== -1 ? part.substring(index + 1).trim() : part.trim();
          });
          testCalls += `console.log(${funcName}(${parts.join(", ")})); // Expected: ${ex.output}\n`;
        });
      }

      return `${defaultCode}\n\n// --- Test Cases ---\n${testCalls}`;
    },
  },
  python: {
    name: "Python",
    monacoLang: "python",
    generate: (problem) => {
      const match = (problem.optimal?.code || "").match(/function\s+(\w+)/);
      const funcName = match ? match[1] : "solution";
      const argsMatch = (problem.optimal?.code || "").match(/function\s+\w+\s*\(([^)]*)\)/);
      const args = argsMatch ? argsMatch[1] : "";

      const defaultCode = `def ${funcName}(${args}):\n    # Write code here\n    pass`;

      let testCalls = "";
      if (problem.examples && problem.examples.length > 0) {
        problem.examples.forEach((ex) => {
          const parts = ex.input
            .split(",")
            .map((part) => {
              const index = part.indexOf("=");
              return index !== -1 ? part.substring(index + 1).trim() : part.trim();
            })
            .map((part) => {
              return part.replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None");
            });
          testCalls += `print(${funcName}(${parts.join(", ")})) # Expected: ${ex.output}\n`;
        });
      }

      return `${defaultCode}\n\n# --- Test Cases ---\n${testCalls}`;
    },
  },
  java: {
    name: "Java",
    monacoLang: "java",
    generate: (problem) => {
      const match = (problem.optimal?.code || "").match(/function\s+(\w+)/);
      const funcName = match ? match[1] : "solution";

      let testCalls = "";
      if (problem.examples && problem.examples.length > 0) {
        problem.examples.forEach((ex) => {
          const parts = ex.input.split(",").map((part) => {
            const index = part.indexOf("=");
            const val = index !== -1 ? part.substring(index + 1).trim() : part.trim();
            if (val.startsWith("[") && val.endsWith("]")) {
              return `new int[]{${val.substring(1, val.length - 1)}}`;
            }
            return val;
          });

          testCalls += `        System.out.println(Arrays.toString(${funcName}(${parts.join(", ")}))); // Expected: ${ex.output}\n`;
        });
      }

      return `import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write code here\n        return new int[0];\n    }\n\n    public static void main(String[] args) {\n        // --- Test Cases ---\n${testCalls}    }\n}`;
    },
  },
  cpp: {
    name: "C++",
    monacoLang: "cpp",
    generate: (problem) => {
      const match = (problem.optimal?.code || "").match(/function\s+(\w+)/);
      const funcName = match ? match[1] : "solution";

      let testCalls = "";
      if (problem.examples && problem.examples.length > 0) {
        problem.examples.forEach((ex) => {
          const parts = ex.input.split(",").map((part) => {
            const index = part.indexOf("=");
            const val = index !== -1 ? part.substring(index + 1).trim() : part.trim();
            if (val.startsWith("[") && val.endsWith("]")) {
              return `{${val.substring(1, val.length - 1)}}`;
            }
            return val;
          });

          testCalls += `    vector<int> res = ${funcName}(${parts.join(", ")});\n    cout << "[" << res[0] << ", " << res[1] << "]" << endl; // Expected: ${ex.output}\n`;
        });
      }

      return `#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write code here\n    return {};\n}\n\nint main() {\n    // --- Test Cases ---\n${testCalls}    return 0;\n}`;
    },
  },
};

export default function ProblemDetailPage() {
  const { slug, problemSlug } = useReactParams<{ slug?: string; problemSlug?: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [activeApproach, setActiveApproach] = useState<"bruteForce" | "optimal">("optimal");
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [showConsole, setShowConsole] = useState(false);
  const [runnerOutput, setRunnerOutput] = useState<{
    status: "idle" | "running" | "success" | "error";
    logs: string[];
    error: string | null;
    executionTime: string;
  }>({
    status: "idle",
    logs: [],
    error: null,
    executionTime: "0.000",
  });

  const {
    theme,
    addBookmark,
    removeBookmark,
    isBookmarked,
    markSolved,
    unmarkSolved,
    solvedProblems,
    addRecentItem,
  } = useAppStore();

  const targetProblemSlug = problemSlug || slug;
  const companySlug = problemSlug ? slug : undefined;

  useEffect(() => {
    if (companySlug && targetProblemSlug) {
      getCompanyBySlug(companySlug).then((c) => {
        if (c) {
          setCompany(c);
          const p = (c.problems || []).find((item) => item.slug === targetProblemSlug);
          if (p) {
            setProblem(p);
            addRecentItem({
              title: p.title,
              slug: `/company/${companySlug}/problem/${targetProblemSlug}`,
              type: "problem",
            });
          }
        }
      });
    } else if (targetProblemSlug) {
      getProblemBySlug(targetProblemSlug).then((p) => {
        if (p) {
          setProblem(p);
          if (p.companySlug) {
            getCompanyBySlug(p.companySlug).then((c) => {
              if (c) setCompany(c);
            });
          } else {
            const companyName = p.companies?.[0] || p.askedIn?.[0] || "Target";
            setCompany({
              name: companyName,
              slug: "target",
              logo: "",
              website: "",
              careerLink: "",
              industry: "Technology",
              type: "Product",
              packageRange: "",
              difficulty: p.difficulty || "Easy",
              interviewRounds: [],
              tags: [],
              roles: [],
              location: "Remote",
              hiringType: [],
              skills: [],
              overview: "",
              hiringProcess: "",
              eligibility: "",
              preparationTips: "",
            });
          }
          addRecentItem({
            title: p.title,
            slug: `/problem/${targetProblemSlug}`,
            type: "problem",
          });
        }
      });
    }
  }, [companySlug, targetProblemSlug]);

  // Load language templates on mount/language switch
  useEffect(() => {
    if (problem) {
      const template = LANGUAGE_TEMPLATES[selectedLanguage];
      if (template) {
        setCode(template.generate(problem));
      }
      setRunnerOutput({
        status: "idle",
        logs: [],
        error: null,
        executionTime: "0.000",
      });
      setShowConsole(false);
    }
  }, [problem, selectedLanguage, activeApproach]);

  if (!problem) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const bookmarked = isBookmarked(problem.id);
  const isSolved = solvedProblems.includes(problem.id);
  const currentApproach =
    (activeApproach === "bruteForce" ? problem.bruteForce : problem.optimal) ||
    problem.optimal ||
    problem.bruteForce || {
      approach: "Standard Approach",
      code: "// Code solution unavailable",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    };

  const handleBookmark = () => {
    if (bookmarked) removeBookmark(problem.id);
    else
      addBookmark({
        id: problem.id,
        type: "problem",
        title: problem.title,
        slug: `/company/${slug}/problem/${problem.slug}`,
      });
  };

  const handleSolved = () => {
    if (isSolved) unmarkSolved(problem.id);
    else markSolved(problem.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("Reset editor to default code template? All changes will be lost.")) {
      const template = LANGUAGE_TEMPLATES[selectedLanguage];
      if (template && problem) {
        setCode(template.generate(problem));
      }
      setRunnerOutput({
        status: "idle",
        logs: [],
        error: null,
        executionTime: "0.000",
      });
    }
  };

  // Run the code via backend system compiler sandbox
  const handleRunCode = async () => {
    setShowConsole(true);
    setRunnerOutput((prev) => ({ ...prev, status: "running" }));

    const token = getToken();
    if (!token) {
      setRunnerOutput({
        status: "error",
        logs: [],
        error: "Security Notice: Session token is missing or expired. Please sign in.",
        executionTime: "0.000",
      });
      return;
    }

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Sandbox compilation failure.");
      }

      const data = await response.json();

      setRunnerOutput({
        status: data.stderr ? "error" : "success",
        logs: data.stdout ? data.stdout.trim().split("\n") : [],
        error: data.stderr ? data.stderr.trim() : null,
        executionTime: data.executionTime,
      });
    } catch (err: any) {
      setRunnerOutput({
        status: "error",
        logs: [],
        error: err.message || String(err),
        executionTime: "0.000",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ReactLink
          to={company && company.slug !== "target" ? `/company/${company.slug}` : "/problems"}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{company && company.slug !== "target" ? company.name : "Problems Directory"}</span>
        </ReactLink>
        <span>/</span>
        <span className="capitalize">{(problem.category || "DSA").replace("-", " ")}</span>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{problem.title}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header Block */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-card/80 to-primary/5 p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-primary/15 blur-[100px] rounded-full" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl tracking-tight leading-relaxed">
                {problem.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold pt-1">
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDifficultyBg(
                    problem.difficulty
                  )}`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-muted-foreground">Acceptance: {problem.acceptance}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
                  <span>{problem.frequency} frequency</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSolved}
                className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isSolved
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground"
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${isSolved ? "fill-emerald-400/10" : ""}`} />
                <span>{isSolved ? "Solved" : "Mark Solved"}</span>
              </button>
              <button
                onClick={handleBookmark}
                className={`rounded-xl p-2.5 border transition-all ${
                  bookmarked
                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground"
                }`}
                aria-label="Bookmark"
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-border/20 pt-4 relative z-10">
            {/* Topics list */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mr-1">
                  Topics:
                </span>
                {problem.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Asked In Companies list */}
            {problem.companies && problem.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider shrink-0 mr-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>Asked At:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {problem.companies.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg bg-muted/60 hover:bg-muted border border-border/40 px-2.5 py-1 text-xs font-semibold text-foreground transition-colors shadow-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Problem Statement Card */}
        <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Problem Description</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border/20 font-medium">
            {problem.statement}
          </p>

          {/* Examples list */}
          <div className="grid gap-3.5 pt-1">
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/30 bg-muted/40 p-4 space-y-2"
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Example {i + 1}
                </p>
                <div className="space-y-1 font-mono text-xs leading-relaxed text-muted-foreground pl-1">
                  <p>
                    <span className="text-muted-foreground/60">Input:</span> {ex.input}
                  </p>
                  <p>
                    <span className="text-muted-foreground/60">Output:</span>{" "}
                    <span className="text-primary font-semibold">{ex.output}</span>
                  </p>
                  {ex.explanation && (
                    <p className="text-[11px] text-muted-foreground/50 mt-2 italic font-sans leading-normal">
                      Explanation: {ex.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Intuition & Real-World Analogy */}
          {(problem.intuition || problem.realWorldExample) && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {problem.intuition && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Brain className="h-4 w-4" />
                    <span>Intuition</span>
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                    {problem.intuition}
                  </p>
                </div>
              )}
              {problem.realWorldExample && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Lightbulb className="h-4 w-4" />
                    <span>Real-World Analogy</span>
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                    {problem.realWorldExample}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hints & Edge Cases */}
          {(problem.hints?.length > 0 || problem.edgeCases?.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {problem.hints && problem.hints.length > 0 && (
                <div className="rounded-xl border border-border/30 bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-bold text-foreground">💡 Helpful Hints:</p>
                  <ul className="grid gap-1 pl-1 text-xs text-muted-foreground">
                    {problem.hints.map((h: string, idx: number) => (
                      <li key={idx}>• {h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {problem.edgeCases && problem.edgeCases.length > 0 && (
                <div className="rounded-xl border border-border/30 bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-bold text-foreground">⚠️ Edge Cases to Test:</p>
                  <ul className="grid gap-1 pl-1 text-xs text-muted-foreground font-mono">
                    {problem.edgeCases.map((ec: string, idx: number) => (
                      <li key={idx}>• {ec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Code solution Approach Card */}
        <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Brain className="h-4 w-4 text-purple-400" />
              <span>Solution Methods</span>
            </h2>
            <div className="flex rounded-xl border border-border/40 bg-muted/50 p-0.5 self-start">
              <button
                onClick={() => setActiveApproach("bruteForce")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                  activeApproach === "bruteForce"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Brute Force
              </button>
              <button
                onClick={() => setActiveApproach("optimal")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                  activeApproach === "optimal"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Optimal Solution
              </button>
            </div>
          </div>

          {/* Approach summary */}
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Zap className="h-4 w-4" />
              <span>Approach: {currentApproach.approach}</span>
            </p>
          </div>

          {/* Monaco Editor Interactive Code Container */}
          <div className="rounded-xl border border-border/40 bg-[#1e1e1e] overflow-hidden shadow-lg relative">
            <div className="flex items-center justify-between border-b border-border/20 bg-background/50 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-card text-slate-300 text-xs font-bold font-mono px-3 py-1.5 rounded-lg border border-border/30 outline-none focus:border-primary/50 transition-all select-none cursor-pointer"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary select-none">
                  Editable
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-all hover:bg-primary/20 active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Code</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 rounded-lg border border-border/30 bg-card px-2.5 py-1 text-xs font-semibold text-slate-300 transition-all hover:bg-muted hover:text-foreground active:scale-95"
                  title="Reset Code"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg border border-border/30 bg-card px-2.5 py-1 text-xs font-semibold text-slate-300 transition-all hover:bg-muted hover:text-foreground active:scale-95"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
            <div className="h-80 w-full overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage={LANGUAGE_TEMPLATES[selectedLanguage]?.monacoLang || "javascript"}
                language={LANGUAGE_TEMPLATES[selectedLanguage]?.monacoLang || "javascript"}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  fontFamily: "JetBrains Mono",
                  lineNumbers: "on",
                  folding: true,
                  renderLineHighlight: "all",
                  automaticLayout: true,
                  scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                  },
                }}
              />
            </div>
          </div>

          {/* Code Execution Sandbox Console Output Panel */}
          <AnimatePresence>
            {showConsole && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-border/50 bg-[#0c0a12] overflow-hidden shadow-inner"
              >
                <div className="flex items-center justify-between border-b border-border/20 bg-background/30 px-4 py-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span>Console Output</span>
                  </span>
                  {runnerOutput.status !== "running" && (
                    <span className="text-[10px] font-bold font-mono text-muted-foreground">
                      Executed in {runnerOutput.executionTime}ms
                    </span>
                  )}
                </div>

                <div className="p-4 font-mono text-xs leading-relaxed space-y-3 max-h-60 overflow-y-auto">
                  {runnerOutput.status === "running" && (
                    <div className="flex items-center gap-2 text-primary font-semibold animate-pulse">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                      <span>Running compiler sandbox tests...</span>
                    </div>
                  )}

                  {runnerOutput.status === "error" && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 flex gap-2 items-start">
                      <AlertTriangle className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-destructive">Execution / Compiler Error</p>
                        <p className="text-destructive/80 mt-1 whitespace-pre-wrap select-all">{runnerOutput.error}</p>
                      </div>
                    </div>
                  )}

                  {runnerOutput.status === "success" && (
                    <div className="space-y-3">
                      {/* Console stdout lines */}
                      {runnerOutput.logs.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Standard Output (stdout)
                          </p>
                          {runnerOutput.logs.map((log, i) => (
                            <p key={i} className="text-emerald-300 font-bold select-all pl-1 border-l border-emerald-500/20">
                              {log}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">Execution finished with zero output logs.</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complexity details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Time Complexity
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-primary">
                {currentApproach.timeComplexity}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Space Complexity
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-primary">
                {currentApproach.spaceComplexity}
              </p>
            </div>
          </div>
        </section>

        {/* Related Problems */}
        {problem.relatedProblems.length > 0 && (
          <section className="rounded-2xl border border-border/30 bg-card/30 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-base font-bold text-foreground">Related Problems</h2>
            <div className="flex flex-wrap gap-2">
              {problem.relatedProblems.map((rp) => (
                <span
                  key={rp}
                  className="rounded-lg border border-border/30 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  {rp}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Interview Tips Card */}
        <section className="rounded-2xl border border-border/30 bg-card/30 p-6 backdrop-blur-sm space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Lightbulb className="h-4.5 w-4.5 text-amber-400" />
            <span>Interview Strategy Tips</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{problem.interviewTips}</p>
        </section>
      </motion.div>
    </div>
  );
}