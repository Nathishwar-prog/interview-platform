import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, Search, ArrowRight, CheckCircle2, Layers } from "lucide-react";
import { getCategoriesWithStats, type CategoryStats } from "@/lib/data";
import { useAppStore } from "@/lib/store";

export default function ProblemsPage() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { solvedProblems } = useAppStore();

  useEffect(() => {
    getCategoriesWithStats().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const filteredCategories = categories.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.slug.toLowerCase().includes(term) ||
      c.topics.some((t) => t.toLowerCase().includes(term))
    );
  });

  const totalProblemsCount = categories.reduce((sum, c) => sum + c.totalProblems, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/40 bg-gradient-to-r from-card/80 via-card/50 to-primary/5 p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 h-48 w-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
            <Layers className="h-3.5 w-3.5" />
            <span>Problem Topic Categories</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight leading-relaxed">
            DSA Problem Index
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explore curated coding challenges grouped by core Data Structures, Algorithms, and System Patterns.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mt-8 flex flex-wrap gap-6 border-t border-border/20 pt-6 relative z-10">
          <div>
            <p className="text-2xl font-black text-foreground tracking-tight">{categories.length}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Topic Categories
            </p>
          </div>
          <div className="border-l border-border/30 pl-6">
            <p className="text-2xl font-black text-foreground tracking-tight">{totalProblemsCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Coding Challenges
            </p>
          </div>
          <div className="border-l border-border/30 pl-6">
            <p className="text-2xl font-black text-emerald-400 tracking-tight">{solvedProblems.length}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Solved Problems
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search categories or algorithm topics (e.g. Arrays, Trees, DP)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border/60 bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-sm"
        />
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/45" />
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
          >
            <Link
              to={`/problems/category/${cat.slug}`}
              className="group flex flex-col h-full rounded-2xl border border-border/50 bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/75 hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border border-border/60 bg-background p-2.5 flex items-center justify-center shrink-0 shadow-sm text-2xl">
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      {cat.totalProblems} {cat.totalProblems === 1 ? "problem" : "problems"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-primary mt-1" />
              </div>

              {/* Topics preview tags */}
              {cat.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {cat.topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-md bg-muted px-2.5 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border/20"
                    >
                      {topic}
                    </span>
                  ))}
                  {cat.topics.length > 4 && (
                    <span className="text-[9px] text-muted-foreground/60 font-bold self-center">
                      +{cat.topics.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex-grow" />

              {/* Difficulty Stats footer */}
              <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[11px] font-semibold">
                <div className="flex items-center gap-2">
                  {cat.easyCount > 0 && (
                    <span className="text-emerald-400 font-bold">{cat.easyCount} Easy</span>
                  )}
                  {cat.mediumCount > 0 && (
                    <span className="text-amber-400 font-bold">{cat.mediumCount} Med</span>
                  )}
                  {cat.hardCount > 0 && (
                    <span className="text-red-400 font-bold">{cat.hardCount} Hard</span>
                  )}
                </div>
                <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
