import React from 'react';
import { Lightbulb, BrainCircuit, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThinkingProcessSectionProps {
  thinkingProcess?: any;
}

export default function ThinkingProcessSection({ thinkingProcess }: ThinkingProcessSectionProps) {
  if (!thinkingProcess) {
    return (
      <section id="thinking" className="space-y-6 pt-8">
        <h2 className="text-xl font-bold text-foreground">Thinking Process</h2>
        <div className="rounded-xl border border-border/40 bg-card/30 p-8 text-center text-muted-foreground">
          Detailed thinking process will be available soon.
        </div>
      </section>
    );
  }

  const steps = [
    {
      title: "Naive Idea",
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      content: thinkingProcess.naiveIdea
    },
    {
      title: "Observation & Insight",
      icon: BrainCircuit,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      content: thinkingProcess.keyInsight
    },
    {
      title: "Aha Moment!",
      icon: Lightbulb,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      content: thinkingProcess.ahaMoment
    },
    {
      title: "Optimal Strategy",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      content: thinkingProcess.whyItWorks
    }
  ].filter(s => s.content);

  return (
    <section id="thinking" className="space-y-6 pt-8">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <span>How to Think About This</span>
      </h2>
      
      {steps.length > 0 ? (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#08080c] ${step.bg} ${step.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${step.border} ${step.bg} backdrop-blur-sm shadow-xl`}>
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <h3 className={`font-bold ${step.color}`}>{step.title}</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{step.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card/30 p-8 text-center text-muted-foreground">
          Thinking process breakdown is being generated for this problem.
        </div>
      )}
    </section>
  );
}
