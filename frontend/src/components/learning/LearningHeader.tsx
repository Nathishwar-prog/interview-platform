import React from 'react';
import { motion } from 'framer-motion';
import { getDifficultyColor, getDifficultyBg, getCategoryIcon } from '@/lib/data';

interface LearningHeaderProps {
  problem: any;
}

export default function LearningHeader({ problem }: LearningHeaderProps) {
  const diffColor = getDifficultyColor(problem.difficulty || "Medium");
  const diffBg = getDifficultyBg(problem.difficulty || "Medium");

  return (
    <header className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${diffBg}`}>
          {problem.difficulty || "Medium"}
        </span>
        {problem.category && (
          <span className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span dangerouslySetInnerHTML={{ __html: getCategoryIcon(problem.category) }} className="text-[10px]" />
            {problem.category.replace('-', ' ')}
          </span>
        )}
        {(problem.companies || []).slice(0, 3).map((comp: string) => (
          <span key={comp} className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
            {comp}
          </span>
        ))}
      </div>
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {problem.title || "Problem Title"}
        </h1>
        {problem.learning?.whatWillYouLearn && (
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            {problem.learning.whatWillYouLearn}
          </p>
        )}
      </div>
    </header>
  );
}
