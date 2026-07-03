import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

interface ProblemSectionProps {
  problem: any;
}

export default function ProblemSection({ problem }: ProblemSectionProps) {
  const examples = problem.examples || problem.problem?.examples || [];
  const constraints = problem.constraints || problem.problem?.constraints || [];

  return (
    <section id="overview" className="space-y-6">
      <div className="rounded-2xl border border-border/30 bg-card/30 p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Problem Statement</h2>
        <div className="prose prose-invert max-w-none text-muted-foreground">
          {problem.statement || problem.problem?.problemStatement || "Problem statement not available."}
        </div>
      </div>

      {examples.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Target className="h-5 w-5 text-emerald-400" />
            <span>Examples</span>
          </h3>
          <div className="grid gap-4">
            {examples.map((ex: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Example {idx + 1}</p>
                <div className="space-y-2 text-sm font-mono text-slate-300">
                  <div><span className="text-emerald-400">Input:</span> {ex.input}</div>
                  <div><span className="text-amber-400">Output:</span> {ex.output}</div>
                  {ex.explanation && (
                    <div className="mt-2 text-muted-foreground font-sans text-sm border-t border-border/20 pt-2">
                      <span className="font-bold text-primary">Explanation:</span> {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {constraints.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>Constraints</span>
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
            {constraints.map((c: string, idx: number) => (
              <li key={idx} className="font-mono text-[13px]">{c}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
