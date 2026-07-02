import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Building2,
  Code2,
  Users,
  Star,
  Zap,
  BookOpen,
  Trophy,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { type Company, type Problem, fetchData, getAllProblems, getDifficultyBg } from "@/lib/data";

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalQuestions: 0,
    totalProblems: 0,
    totalExperiences: 0,
    activeUsers: 0,
  });
  const [trendingProblems, setTrendingProblems] = useState<
    (Problem & { companyName: string; companySlug: string })[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    fetchData().then((data) => {
      setCompanies(data.companies);
      setStats(data.stats);
    });

    getAllProblems().then((problems) => {
      setTrendingProblems(problems.slice(0, 6));
    });
  }, []);

  const featuredCompanies = companies.filter((c) =>
    ["google", "amazon", "microsoft", "meta"].includes(c.slug)
  );

  const handleSearchFocus = () => {
    setCommandPaletteOpen(true);
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/80 via-card/30 to-primary/5 p-8 sm:p-12 md:p-16 shadow-2xl backdrop-blur-sm">
        {/* Glow ambient spots */}
        <div className="absolute right-0 top-0 h-[400px] w-[400px] bg-primary/10 blur-[140px] rounded-full" />
        <div className="absolute left-1/3 bottom-0 h-80 w-80 bg-purple-500/10 blur-[130px] rounded-full" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Developer-First Interview Prep Console</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1]"
            >
              Cracking the Coding
              <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mt-1.5">
                & Systems Interview
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              Master company-specific interview archives. Explore real Q&A, DSA coding challenges, system architecture questions, and verified candidate experiences from top tech companies.
            </motion.p>

            {/* Interactive Search Bar Trigger */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-xl pt-2"
            >
              <div
                onClick={handleSearchFocus}
                className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-border bg-background/80 px-8 py-4 shadow-lg hover:border-primary/40 hover:shadow-primary/5 transition-all group backdrop-blur-sm"
              >
                <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search companies, topics, coding problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground cursor-pointer"
                  readOnly
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual Column - Custom Uploaded Image */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 80 }}
              className="relative rounded-2xl border border-border/60 bg-card/60 p-3 shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-primary/40 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/hero-neon.jpg"
                alt="PrepCrack Neon Dashboard Illustration"
                className="w-full max-w-[420px] rounded-xl object-cover shadow-inner relative z-10 transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </motion.div>
          </div>
        </div>

        {/* Hero Quick Metrics */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 w-full pt-16 border-t border-border/20 mt-16">
          {[
            { label: "Target Companies", value: `${stats.totalCompanies}+`, icon: Building2 },
            { label: "Real Interview Q&A", value: `${stats.totalQuestions}+`, icon: BookOpen },
            { label: "DSA Problems", value: `${stats.totalProblems}+`, icon: Code2 },
            { label: "Developer Logs", value: `${stats.totalExperiences}+`, icon: Users },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-2xl border border-border/40 bg-card/40 p-5 backdrop-blur-sm hover:border-primary/20 transition-all hover:bg-card/70 flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground tracking-tight">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Companies Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Targets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Top technology corporations actively looking for engineers
            </p>
          </div>
          <Link
            to="/companies"
            className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>View All Directory</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCompanies.map((company, i) => (
            <motion.div
              key={company.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <Link
                to={`/company/${company.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-border/50 bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/75 hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl border border-border bg-background p-2 flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=2563eb&color=fff`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{company.industry}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getDifficultyBg(
                      company.difficulty
                    )}`}
                  >
                    {company.difficulty}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border/20 bg-muted px-2.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                    {company.roles?.length || 0} roles
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                  <span>{company.questionCount || 0} questions</span>
                  <span>{company.problemCount || 0} problems</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Directory Grid of All Companies */}
      <section className="rounded-3xl border border-border/40 bg-card/20 p-8 sm:p-10 backdrop-blur-sm space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Explore Full Index</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Browse full index of {companies.length} targets
            </p>
          </div>
          <Link
            to="/companies"
            className="flex items-center gap-0.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span>Explore All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {companies.map((company) => (
            <Link
              key={company.slug}
              to={`/company/${company.slug}`}
              className="flex items-center gap-3.5 rounded-xl border border-border/40 bg-card/30 p-4 hover:border-primary/20 hover:bg-card/80 transition-all group"
            >
              <div className="h-8 w-8 rounded-lg border border-border bg-background p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&background=2563eb&color=fff&size=32`;
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {company.name}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{company.type}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Problems Section */}
      {trendingProblems.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Trending DSA Challenges</h2>
            </div>
            <p className="hidden sm:block text-xs text-muted-foreground font-semibold">
              Coding problems frequently asked on tech screens
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trendingProblems.map((problem) => (
              <Link
                key={problem.id}
                to={`/company/${problem.companySlug}/problem/${problem.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-border/50 bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/75 hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">
                    {problem.title}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getDifficultyBg(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {problem.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="rounded bg-muted px-2.5 py-1 text-[9px] font-semibold text-muted-foreground border border-border/20"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex-grow" />

                <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{problem.companyName}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500/10" />
                    <span>{problem.frequency}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Modern CTA Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/85 via-card/50 to-primary/5 p-12 sm:p-16 text-center">
        <div className="absolute right-0 top-0 h-48 w-48 bg-primary/10 blur-[100px] rounded-full" />
        <div className="relative z-10 space-y-6 max-w-xl mx-auto">
          <Trophy className="mx-auto h-12 w-12 text-primary stroke-[1.2]" />
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Scale Up Your Prep
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ready to pass the technical rounds? Pick your target employer, solve coding algorithms, study architect flow patterns, and learn from other candidates' strategies.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-sm font-bold text-primary-foreground transition-all duration-300 hover:bg-primary/95 shadow-lg hover:shadow-primary/20"
            >
              <span>Start Preparing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}