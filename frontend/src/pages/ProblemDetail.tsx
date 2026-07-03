import { useEffect, useState } from "react";
import { useParams as useReactParams, Link as ReactLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Copy, Check, Code2, Play, RotateCcw, Terminal, AlertTriangle
} from "lucide-react";
import { type Company, type Problem, getCompanyBySlug, getProblemBySlug } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { getToken } from "@/lib/auth";
import Editor from "@monaco-editor/react";

import LearningLayout from "@/components/layout/LearningLayout";
import LearningHeader from "@/components/learning/LearningHeader";
import ProblemSection from "@/components/learning/ProblemSection";
import ThinkingProcessSection from "@/components/learning/ThinkingProcessSection";
import ApproachesSection from "@/components/learning/ApproachesSection";

// Existing code templates
interface LanguageTemplate {
  name: string;
  monacoLang: string;
  generate: (problem: any) => string;
}

const getCodeStr = (problem: any, lang: string): string => {
  const codeObj = problem.optimal?.code || problem.bruteForce?.code;
  if (typeof codeObj === 'object' && codeObj !== null) {
    return codeObj[lang] || codeObj.javascript || codeObj.java || codeObj.python || "";
  }
  return codeObj || "";
};

const LANGUAGE_TEMPLATES: Record<string, LanguageTemplate> = {
  javascript: {
    name: "JavaScript",
    monacoLang: "javascript",
    generate: (problem) => {
      const codeStr = getCodeStr(problem, 'javascript');
      const match = codeStr.match(/function\s+(\w+)/);
      const funcName = match ? match[1] : "solution";
      const argsMatch = codeStr.match(/function\s+\w+\s*\(([^)]*)\)/);
      const args = argsMatch ? argsMatch[1] : "";

      const defaultCode = codeStr || `function ${funcName}(${args}) {\n  // Write code here\n}`;

      let testCalls = "";
      if (problem.examples && problem.examples.length > 0) {
        problem.examples.forEach((ex: any) => {
          if (!ex.input) return;
          const parts = ex.input.split(",").map((part: string) => {
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
      const codeStr = getCodeStr(problem, 'python');
      const match = codeStr.match(/def\s+(\w+)/);
      const funcName = match ? match[1] : "solution";
      const argsMatch = codeStr.match(/def\s+\w+\s*\(([^)]*)\)/);
      const args = argsMatch ? argsMatch[1] : "";

      const defaultCode = codeStr || `def ${funcName}(${args}):\n    # Write code here\n    pass`;
      return `${defaultCode}\n`;
    },
  },
  java: {
    name: "Java",
    monacoLang: "java",
    generate: () => `class Solution {\n    public void solve() {\n        // Write code here\n    }\n}`,
  },
  cpp: {
    name: "C++",
    monacoLang: "cpp",
    generate: () => `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`,
  },
};

export default function ProblemDetailPage() {
  const { slug, problemSlug } = useReactParams<{ slug?: string; problemSlug?: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [problem, setProblem] = useState<any>(null);
  
  const [activeSection, setActiveSection] = useState("overview");
  
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

  const { theme, addRecentItem } = useAppStore();

  const targetProblemSlug = problemSlug || slug;
  const companySlug = problemSlug ? slug : undefined;

  useEffect(() => {
    if (targetProblemSlug) {
      getProblemBySlug(targetProblemSlug, companySlug).then((p) => {
        if (p) {
          setProblem(p);
          addRecentItem({
            title: p.title || targetProblemSlug,
            slug: `/problem/${targetProblemSlug}`,
            type: "problem",
          });
        }
      });
    }
  }, [companySlug, targetProblemSlug]);

  useEffect(() => {
    if (problem) {
      const template = LANGUAGE_TEMPLATES[selectedLanguage];
      if (template) {
        setCode(template.generate(problem));
      }
      setRunnerOutput({ status: "idle", logs: [], error: null, executionTime: "0.000" });
      setShowConsole(false);
    }
  }, [problem, selectedLanguage]);

  if (!problem) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("Reset editor to default code template? All changes will be lost.")) {
      const template = LANGUAGE_TEMPLATES[selectedLanguage];
      if (template && problem) setCode(template.generate(problem));
      setRunnerOutput({ status: "idle", logs: [], error: null, executionTime: "0.000" });
    }
  };

  const handleRunCode = async () => {
    setShowConsole(true);
    setRunnerOutput((prev) => ({ ...prev, status: "running" }));
    const token = getToken();
    if (!token) {
      setRunnerOutput({ status: "error", logs: [], error: "Security Notice: Session token is missing or expired. Please sign in.", executionTime: "0.000" });
      return;
    }

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, language: selectedLanguage }),
      });

      if (!response.ok) throw new Error(await response.text() || "Sandbox compilation failure.");
      const data = await response.json();
      setRunnerOutput({
        status: data.stderr ? "error" : "success",
        logs: data.stdout ? data.stdout.trim().split("\n") : [],
        error: data.stderr ? data.stderr.trim() : null,
        executionTime: data.executionTime,
      });
    } catch (err: any) {
      setRunnerOutput({ status: "error", logs: [], error: err.message || String(err), executionTime: "0.000" });
    }
  };

  return (
    <LearningLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <LearningHeader problem={problem} />

        <div className="space-y-16">
          {activeSection === "overview" && (
            <ProblemSection problem={problem} />
          )}

          {activeSection === "thinking" && (
            <ThinkingProcessSection thinkingProcess={problem.thinkingProcess} />
          )}

          {activeSection === "approaches" && (
            <ApproachesSection approaches={problem.approaches || (problem.bruteForce ? [problem.bruteForce, problem.optimal] : [])} />
          )}

          {activeSection === "code" && (
            <section id="code" className="space-y-6 pt-8">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" />
                <span>Code & Dry Run</span>
              </h2>

              <div className="rounded-2xl border border-border/40 bg-card/30 p-1 overflow-hidden shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/20 bg-background/50 px-4 py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-card text-slate-300 text-sm font-bold font-mono px-3 py-2 rounded-lg border border-border/30 outline-none focus:border-primary/50 transition-all select-none cursor-pointer"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleRunCode}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/20 active:scale-95"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Run Code</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center p-2.5 rounded-lg border border-border/30 bg-card text-slate-300 transition-all hover:bg-muted hover:text-foreground"
                      title="Reset Code"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center justify-center p-2.5 rounded-lg border border-border/30 bg-card text-slate-300 transition-all hover:bg-muted hover:text-foreground"
                      title="Copy Code"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="h-[500px] w-full">
                  <Editor
                    height="100%"
                    language={LANGUAGE_TEMPLATES[selectedLanguage]?.monacoLang || "javascript"}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                      fontSize: 14,
                      fontFamily: "JetBrains Mono",
                      minimap: { enabled: false },
                      padding: { top: 16 },
                      scrollbar: { vertical: "auto", horizontal: "auto" }
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
                          <span>Running...</span>
                        </div>
                      )}
                      {runnerOutput.status === "error" && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 flex gap-2 items-start">
                          <AlertTriangle className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-destructive">Execution Error</p>
                            <p className="text-destructive/80 mt-1 whitespace-pre-wrap select-all">{runnerOutput.error}</p>
                          </div>
                        </div>
                      )}
                      {runnerOutput.status === "success" && (
                        <div className="space-y-3">
                          {runnerOutput.logs.length > 0 ? (
                            <div className="space-y-1">
                              {runnerOutput.logs.map((log, i) => (
                                <p key={i} className="text-emerald-300 font-bold select-all pl-1 border-l border-emerald-500/20">{log}</p>
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
            </section>
          )}

          {activeSection === "interview" && (
             <section className="space-y-6 pt-8">
               <h2 className="text-xl font-bold text-foreground">Interview Tips</h2>
               <div className="rounded-xl border border-border/40 bg-card/30 p-8 text-muted-foreground">
                 {problem.interview?.interviewTips?.length > 0 ? (
                   <ul className="list-disc pl-5 space-y-2">
                     {problem.interview.interviewTips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                   </ul>
                 ) : (
                   "Interview insights will be available soon."
                 )}
               </div>
             </section>
          )}
        </div>
      </motion.div>
    </LearningLayout>
  );
}