import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock,
  BookOpen,
  Code2,
  Users,
  Star,
  CheckCircle2,
  MessageSquare,
  Lightbulb,
  Building,
  HelpCircle,
} from "lucide-react";
import { type Company, getCompanyBySlug, getDifficultyBg, getCategoryIcon } from "@/lib/data";
import { useAppStore } from "@/lib/store";

type TabId = "overview" | "questions" | "problems" | "experiences";

export default function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { addRecentItem } = useAppStore();

  useEffect(() => {
    if (slug) {
      getCompanyBySlug(slug).then((c) => {
        if (c) {
          setCompany(c);
          addRecentItem({ title: c.name, slug: `/company/${c.slug}`, type: "company" });
        }
      });
    }
  }, [slug]);

  if (!company) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const interviewQuestions = company.interviewQuestions || [];
  const problems = company.problems || [];
  const experiences = company.experiences || [];

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "questions", label: "Interview Questions", icon: MessageSquare, count: interviewQuestions.length },
    { id: "problems", label: "DSA Problems", icon: Code2, count: problems.length },
    { id: "experiences", label: "Experiences", icon: Users, count: experiences.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/companies" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Companies</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{company.name}</span>
      </div>

      {/* Premium Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-card/60 via-card/30 to-primary/5 p-6 sm:p-8 shadow-md"
      >
        <div className="absolute right-0 top-0 h-64 w-64 bg-primary/10 blur-[120px] rounded-full" />
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="h-16 w-16 rounded-xl border border-border bg-background p-3 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={company.logo}
                alt={company.name}
                className="h-full w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=2563eb&color=fff&size=64`; }}
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                {company.name}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {company.industry} • {company.type} Company
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getDifficultyBg(company.difficulty)}`}>
                  {company.difficulty}
                </span>
                {company.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0">
            <a
              href={company.careerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:bg-primary/95 shadow-sm hover:shadow-primary/20"
            >
              <span>Apply & Careers</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border/30 pt-6">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{company.location}</p>
              <p className="text-[10px]">Location</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Briefcase className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{company.packageRange}</p>
              <p className="text-[10px]">Package Range</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{company.interviewRounds?.length || 0} rounds</p>
              <p className="text-[10px]">Interview Process</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{company.roles?.length || 0} roles</p>
              <p className="text-[10px]">Hiring Roles</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Tabs Navigation */}
      <div className="border-b border-border/40">
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab company={company} />}
            {activeTab === "questions" && <QuestionsTab company={company} />}
            {activeTab === "problems" && <ProblemsTab company={company} />}
            {activeTab === "experiences" && <ExperiencesTab company={company} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewTab({ company }: { company: Company }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* About */}
        <section className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <span>About {company.name}</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{company.overview}</p>
        </section>

        {/* Hiring Process */}
        <section className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground">Hiring Process</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{company.hiringProcess}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {(company.interviewRounds || []).map((round, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary border border-primary/20">
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{round}</span>
                {i < (company.interviewRounds?.length || 0) - 1 && <span className="text-muted-foreground/40 font-mono">→</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility */}
        <section className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-3">
          <h2 className="text-lg font-bold text-foreground">Eligibility Criteria</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{company.eligibility}</p>
        </section>

        {/* Preparation Tips */}
        <section className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <span>Preparation Strategy</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{company.preparationTips}</p>
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Required Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {(company.skills || []).map((skill) => (
              <span key={skill} className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">{skill}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Hiring Roles</h3>
          <div className="space-y-2">
            {(company.roles || []).map((role) => (
              <div key={role} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/20 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Job Types</h3>
          <div className="flex flex-wrap gap-1.5">
            {(company.hiringType || []).map((type) => (
              <span key={type} className="rounded-lg border border-border/40 bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{type}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ company }: { company: Company }) {
  const interviewQuestions = company.interviewQuestions || [];
  const categories = [...new Set(interviewQuestions.map((q) => q.category))];

  if (interviewQuestions.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
        <p className="mt-4 text-base font-semibold text-foreground">No interview questions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Questions for {company.name} will be added soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Pills Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const count = interviewQuestions.filter((q) => q.category === cat).length;
          return (
            <div key={cat} className="rounded-xl border border-border/40 bg-card/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{getCategoryIcon(cat)}</span>
                <span className="text-sm font-bold capitalize">{cat}</span>
              </div>
              <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5">{count} Qs</span>
            </div>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {interviewQuestions.map((question) => (
          <Link
            key={question.id}
            to={`/company/${company.slug}/question/${question.id}`}
            className="group block rounded-xl border border-border/40 bg-card/30 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 shrink-0">{getCategoryIcon(question.category)}</span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed">
                    {question.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                  <span className="capitalize">{question.category}</span>
                  <span>•</span>
                  <span>{question.round}</span>
                  <span>•</span>
                  <span>{question.expectedTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDifficultyBg(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/70">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
                  <span>{question.frequency} freq</span>
                </div>
              </div>
            </div>
            {question.topics.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-border/20 pt-3">
                {question.topics.map((topic) => (
                  <span key={topic} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/20">{topic}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProblemsTab({ company }: { company: Company }) {
  const problems = company.problems || [];
  const categories = [...new Set(problems.map((p) => p.category))];
  const { solvedProblems } = useAppStore();

  if (problems.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
        <Code2 className="mx-auto h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
        <p className="mt-4 text-base font-semibold text-foreground">No coding problems yet</p>
        <p className="mt-1 text-sm text-muted-foreground">DSA coding problems for {company.name} will be added soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Pills Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const count = problems.filter((p) => p.category === cat).length;
          return (
            <div key={cat} className="rounded-xl border border-border/40 bg-card/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{getCategoryIcon(cat)}</span>
                <span className="text-sm font-bold capitalize">{cat.replace("-", " ")}</span>
              </div>
              <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5">{count} DSA</span>
            </div>
          );
        })}
      </div>

      {/* Problems List */}
      <div className="space-y-2.5">
        {problems.map((problem) => {
          const isSolved = solvedProblems.includes(problem.id);
          return (
            <Link
              key={problem.id}
              to={`/company/${company.slug}/problem/${problem.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 border ${
                  isSolved ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-muted/50 border-border"
                }`}>
                  {isSolved ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 group-hover:bg-primary/40 transition-colors" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {problem.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] font-semibold text-muted-foreground">
                    <span className="capitalize">{problem.category}</span>
                    <span>•</span>
                    <span>Acceptance: {problem.acceptance}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="hidden md:flex flex-wrap gap-1">
                  {problem.topics.slice(0, 2).map((t) => (
                    <span key={t} className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/10">{t}</span>
                  ))}
                </div>
                <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDifficultyBg(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ExperiencesTab({ company }: { company: Company }) {
  const experiences = company.experiences || [];

  if (experiences.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
        <p className="mt-4 text-base font-semibold text-foreground">No shared experiences yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Experiences for {company.name} will be added soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {experiences.map((exp) => (
        <div key={exp.id} className="rounded-2xl border border-border/40 bg-card/30 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-foreground">{exp.role}</h3>
              <p className="text-xs text-muted-foreground font-semibold mt-1">
                {exp.candidate} • {exp.date}
              </p>
            </div>
            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              exp.result === "Selected" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
              {exp.result}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Timeline: {exp.timeline}</span>
          </div>

          {/* Rounds details */}
          <div className="space-y-2.5 mt-3">
            {exp.rounds.map((round, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{round.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${getDifficultyBg(round.difficulty)} rounded-md border px-2 py-0.5`}>
                    {round.difficulty}
                  </span>
                </div>
                {round.questions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {round.questions.map((q, j) => (
                      <span key={j} className="rounded-md bg-card border border-border/40 px-2 py-1 text-xs text-muted-foreground font-medium">{q}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Key takeaway */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Interview Advice</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{exp.lessons}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}