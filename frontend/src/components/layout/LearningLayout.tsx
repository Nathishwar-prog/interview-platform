import React from 'react';
import { BookOpen, Brain, GitCompare, Code2, Users } from 'lucide-react';

interface LearningLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function LearningLayout({ children, activeSection, onSectionChange }: LearningLayoutProps) {
  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'thinking', label: 'Thinking Process', icon: Brain },
    { id: 'approaches', label: 'Approaches', icon: GitCompare },
    { id: 'code', label: 'Code & Dry Run', icon: Code2 },
    { id: 'interview', label: 'Interview', icon: Users },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] mt-16 bg-[#08080c] overflow-hidden text-foreground">
      {/* Sticky Learning Navigator */}
      <aside className="w-64 border-r border-border/20 bg-card/10 backdrop-blur-md hidden lg:flex flex-col h-full overflow-y-auto">
        <div className="p-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Learning Path</h3>
          <nav className="space-y-1">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => onSectionChange(sec.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeSection === sec.id
                    ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.15)]'
                    : 'text-slate-400 hover:text-foreground hover:bg-muted'
                }`}
              >
                <sec.icon className={`h-4 w-4 ${activeSection === sec.id ? 'text-primary' : 'text-slate-500'}`} />
                <span>{sec.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative pb-24 scroll-smooth">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
