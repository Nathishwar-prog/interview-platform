import React, { useState } from 'react';
import { GitCompare, Clock, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApproachesSectionProps {
  approaches?: any[];
}

export default function ApproachesSection({ approaches }: ApproachesSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!approaches || approaches.length === 0) {
    return (
      <section id="approaches" className="space-y-6 pt-8">
        <h2 className="text-xl font-bold text-foreground">Approaches</h2>
        <div className="rounded-xl border border-border/40 bg-card/30 p-8 text-center text-muted-foreground">
          Detailed approaches will be available soon.
        </div>
      </section>
    );
  }

  return (
    <section id="approaches" className="space-y-6 pt-8">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <GitCompare className="h-6 w-6 text-primary" />
        <span>Approaches</span>
      </h2>

      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border/20 bg-background/50">
          {approaches.map((appr, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === idx 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-slate-400 hover:bg-muted hover:text-foreground'
              }`}
            >
              {appr.title || `Approach ${idx + 1}`}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">{approaches[activeTab].title}</h3>
                <p className="text-muted-foreground leading-relaxed">{approaches[activeTab].idea || approaches[activeTab].intuition}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-card border border-border/40 p-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Time Complexity</p>
                    <p className="font-mono text-sm font-bold text-foreground">{approaches[activeTab].complexities?.time || "O(?)"}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-card border border-border/40 p-4 flex items-center gap-3">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Space Complexity</p>
                    <p className="font-mono text-sm font-bold text-foreground">{approaches[activeTab].complexities?.space || "O(?)"}</p>
                  </div>
                </div>
              </div>

              {approaches[activeTab].algorithm && approaches[activeTab].algorithm.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground">Algorithm</h4>
                  <ul className="list-inside list-decimal space-y-1.5 text-sm text-slate-300">
                    {approaches[activeTab].algorithm.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
