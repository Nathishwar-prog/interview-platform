import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Code2,
  Building2,
  Star,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  getCategoryProblems,
  getCategoryIcon,
  getDifficultyBg,
  type Problem,
} from "@/lib/data";
import { useAppStore } from "@/lib/store";

export default function CategoryDetailPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [problems, setProblems] = useState<(Problem & { companyName?: string; companySlug?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const { solvedProblems } = useAppStore();

  const currentCategory = categorySlug || "arrays";
  const formattedCategoryName = currentCategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    setLoading(true);
    getCategoryProblems(currentCategory).then((data) => {
      setProblems(data);
      setLoading(false);
    });
  }, [currentCategory]);

  // Apply filters
  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff =
      difficultyFilter === "all" ||
      p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    return matchesSearch && matchesDiff;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/problems" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Category Directory</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{formattedCategoryName}</span>
      </div>

      {/* Category Header Banner */}
      <div className="rounded-3xl border border-border/40 bg-gradient-to-r from-card/80 via-card/50 to-primary/5 p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getCategoryIcon(currentCategory)}</span>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl tracking-tight">
              {formattedCategoryName} Challenges
            </h1>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Master {formattedCategoryName} algorithms with step-by-step solutions, multi-language runnable code, and complexity analysis.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 relative z-10">
          <div className="rounded-2xl border border-border/40 bg-background/50 p-4 text-center">
            <p className="text-xl font-extrabold text-foreground">{problems.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Problems
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${formattedCategoryName} challenges...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground/45" />
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex rounded-xl border border-border/40 bg-muted/50 p-0.5 self-start sm:self-center">
          {["all", "easy", "medium", "hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                difficultyFilter === diff
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-card/30 p-12 text-center text-muted-foreground space-y-2">
            <Code2 className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-semibold">No problems match your search criteria.</p>
          </div>
        ) : (
          filteredProblems.map((problem, i) => {
            const isSolved = solvedProblems.includes(problem.id);
            const detailPath = problem.companySlug
              ? `/company/${problem.companySlug}/problem/${problem.slug}`
              : `/problem/${problem.slug}`;

            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={detailPath}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 border ${
                        isSolved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-muted/50 border-border/50 text-muted-foreground"
                      }`}
                    >
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
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getDifficultyBg(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                        <span>•</span>
                        <span>Acceptance: {problem.acceptance}</span>
                        {problem.topics.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="truncate">{problem.topics.slice(0, 2).join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/20">
                    {problem.companies && problem.companies.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>{problem.companies[0]}</span>
                      </div>
                    )}
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center gap-1">
                      <span>Solve</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
