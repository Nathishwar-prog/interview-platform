import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  SortAsc,
  Building2,
  MapPin,
  Briefcase,
  Star,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Code,
} from "lucide-react";
import { type Company, getCompanies, getDifficultyBg } from "@/lib/data";

type SortOption = "alphabetical" | "difficulty" | "questions" | "problems";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedHiringType, setSelectedHiringType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.roles.some((r) => r.toLowerCase().includes(q))
      );
    }

    // Filters
    if (selectedDifficulty !== "all") {
      result = result.filter((c) =>
        c.difficulty.toLowerCase().includes(selectedDifficulty.toLowerCase())
      );
    }
    if (selectedType !== "all") {
      result = result.filter(
        (c) => c.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    if (selectedHiringType !== "all") {
      result = result.filter((c) =>
        c.hiringType.some(
          (h) => h.toLowerCase() === selectedHiringType.toLowerCase()
        )
      );
    }

    // Sort
    const diffOrder: Record<string, number> = {
      easy: 1,
      "easy-medium": 2,
      medium: 3,
      "medium-hard": 4,
      hard: 5,
      "very hard": 6,
    };
    switch (sortBy) {
      case "alphabetical":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "difficulty":
        result.sort(
          (a, b) =>
            (diffOrder[a.difficulty.toLowerCase()] || 3) -
            (diffOrder[b.difficulty.toLowerCase()] || 3)
        );
        break;
      case "questions":
        result.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
        break;
      case "problems":
        result.sort((a, b) => (b.problemCount || 0) - (a.problemCount || 0));
        break;
    }

    return result;
  }, [
    companies,
    searchQuery,
    selectedDifficulty,
    selectedType,
    selectedHiringType,
    sortBy,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-card/80 to-primary/5 p-8 shadow-md">
        <div className="absolute right-0 top-0 h-48 w-48 bg-primary/10 blur-[100px] rounded-full" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Targeted Interview Prep</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Explore Tech Companies
          </h1>
          <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
            Target company-specific interviews. Browse through {companies.length} top tech employers, analyze their interview pipelines, and unlock curated libraries of questions and coding problems.
          </p>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by company name, technology, or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card/60 pl-11 pr-4 py-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                showFilters
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                  : "border-border/60 bg-card hover:bg-muted hover:border-border text-muted-foreground"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="relative flex items-center">
              <SortAsc className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-border/60 bg-card pl-9 pr-8 py-3 text-sm outline-none focus:border-primary/50 hover:bg-muted hover:border-border transition-colors cursor-pointer appearance-none"
              >
                <option value="alphabetical">Sort: A → Z</option>
                <option value="difficulty">Sort: Difficulty</option>
                <option value="questions">Sort: Most Questions</option>
                <option value="problems">Sort: Most Problems</option>
              </select>
              <ChevronDown className="absolute right-3.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-border/40 bg-card/40 p-5 backdrop-blur-sm shadow-lg shadow-black/5"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Interview Difficulty
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50 cursor-pointer appearance-none pr-8"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="very hard">Very Hard</option>
                  </select>
                  <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Company Model
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50 cursor-pointer appearance-none pr-8"
                  >
                    <option value="all">All Models</option>
                    <option value="product">Product Based</option>
                    <option value="service">Service Based</option>
                  </select>
                  <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hiring Audience
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedHiringType}
                    onChange={(e) => setSelectedHiringType(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50 cursor-pointer appearance-none pr-8"
                  >
                    <option value="all">All Cohorts</option>
                    <option value="full time">Full Time</option>
                    <option value="intern">Internships</option>
                    <option value="fresher">New Grads</option>
                    <option value="experienced">Experienced Professionals</option>
                  </select>
                  <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Grid listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{filteredCompanies.length}</strong> of{" "}
            {companies.length} targets
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company, i) => (
            <motion.div
              key={company.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.25) }}
              whileHover={{ y: -3 }}
            >
              <Link
                to={`/company/${company.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-border/50 bg-card/30 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/70 hover:shadow-xl hover:shadow-primary/5 backdrop-blur-sm"
              >
                {/* Logo & Basic Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-xl border border-border bg-background p-2 flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:border-primary/20">
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
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {company.industry} • {company.type}
                      </p>
                    </div>
                  </div>
                  <Star className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-amber-400 group-hover:fill-amber-400/10" />
                </div>

                {/* Difficulty & tags */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getDifficultyBg(
                      company.difficulty
                    )}`}
                  >
                    {company.difficulty}
                  </span>
                  {company.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta details */}
                <div className="mt-5 space-y-2 text-xs text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="truncate">{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>{company.packageRange}</span>
                  </div>
                </div>

                {/* Footer metrics summary */}
                <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-primary/70" />
                    <span>{company.interviewRounds?.length || 0} rounds</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-emerald-500/70" />
                    <span>{company.questionCount || 0} QA</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Code className="h-3.5 w-3.5 text-purple-500/70" />
                    <span>{company.problemCount || 0} DSA</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {filteredCompanies.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
          <div>
            <p className="text-base font-semibold text-foreground">No matches found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or query to explore other companies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}