import Fuse from "fuse.js";

// ==================== TYPES ====================

export interface Company {
  name: string;
  slug: string;
  logo: string;
  website: string;
  careerLink: string;
  industry: string;
  type: string;
  packageRange: string;
  difficulty: string;
  interviewRounds: string[];
  tags: string[];
  roles: string[];
  location: string;
  hiringType: string[];
  skills: string[];
  overview: string;
  hiringProcess: string;
  eligibility: string;
  preparationTips: string;
  interviewQuestions?: InterviewQuestion[];
  problems?: Problem[];
  experiences?: Experience[];
}

export interface InterviewQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  frequency: string;
  round: string;
  expectedTime: string;
  topics: string[];
  content: string;
  expectedAnswer: string;
  sampleAnswer: string;
  tips: string[];
  followUp: string[];
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  acceptance: string;
  frequency: string;
  topics: string[];
  companies: string[];
  statement: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  bruteForce: SolutionApproach;
  optimal: SolutionApproach;
  relatedProblems: string[];
  interviewTips: string;
}

export interface SolutionApproach {
  approach: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface Experience {
  id: string;
  candidate: string;
  role: string;
  date: string;
  result: string;
  difficulty: string;
  rounds: { name: string; questions: string[]; difficulty: string }[];
  lessons: string;
  timeline: string;
}

export interface DataStore {
  companies: Company[];
  categories: {
    dsa: string[];
    interview: string[];
  };
  stats: {
    totalCompanies: number;
    totalQuestions: number;
    totalProblems: number;
    totalExperiences: number;
    activeUsers: number;
  };
}

// ==================== DATA FETCHING ====================

let cachedData: DataStore | null = null;
const companyCache: Record<string, Company> = {};
let cachedProblems: (Problem & { companyName: string; companySlug: string })[] | null = null;
let cachedQuestions: (InterviewQuestion & { companyName: string; companySlug: string })[] | null = null;

export async function fetchData(): Promise<DataStore> {
  if (cachedData) return cachedData;
  const response = await fetch("/interview-storage/companies-metadata.json");
  const data = await response.json();
  cachedData = data;
  return data;
}

export async function getCompanies(): Promise<Company[]> {
  const data = await fetchData();
  return data.companies;
}

export async function getCompanyBySlug(slug: string): Promise<Company | undefined> {
  if (companyCache[slug]) return companyCache[slug];
  try {
    const response = await fetch(`/interview-storage/companies/${slug}.json`);
    if (!response.ok) return undefined;
    const company = await response.json();
    companyCache[slug] = company;
    return company;
  } catch (e) {
    console.error(`Failed to fetch company: ${slug}`, e);
    return undefined;
  }
}

export async function safeFetchJson<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        return JSON.parse(text) as T;
      }
    }
  } catch (e) {
    // Return null if empty or invalid JSON file
  }
  return null;
}

export async function getAllProblems(): Promise<(Problem & { companyName?: string; companySlug?: string })[]> {
  if (cachedProblems) return cachedProblems;

  // 1. Load from problems-manifest.json for instant access to all 2,110+ problems
  const manifest = await safeFetchJson<Problem[]>("/interview-storage/problems-manifest.json");
  if (manifest && Array.isArray(manifest) && manifest.length > 0) {
    cachedProblems = manifest as any;
    return cachedProblems;
  }

  const problemMap = new Map<string, Problem & { companyName?: string; companySlug?: string }>();

  // 1. Load main all-problems.json
  const mainProblems = await safeFetchJson<Problem[]>("/interview-storage/all-problems.json");
  if (mainProblems && Array.isArray(mainProblems)) {
    mainProblems.forEach((p) => {
      if (p.slug) problemMap.set(p.slug, p as any);
    });
  }

  // 2. Load from all category JSON files
  for (const catKey of ALL_CATEGORY_SLUGS) {
    const catProblems = await safeFetchJson<Problem[]>(`/interview-storage/categories/${catKey}.json`);
    if (catProblems && Array.isArray(catProblems)) {
      catProblems.forEach((p) => {
        if (p.slug && !problemMap.has(p.slug)) {
          problemMap.set(p.slug, {
            ...p,
            category: p.category || catKey,
          } as any);
        }
      });
    }
  }

  // 3. Load from company JSON files
  const companies = await getCompanies();
  for (const compMeta of companies) {
    const company = await getCompanyBySlug(compMeta.slug);
    if (company && company.problems) {
      company.problems.forEach((p) => {
        if (p.slug && !problemMap.has(p.slug)) {
          problemMap.set(p.slug, {
            ...p,
            companyName: company.name,
            companySlug: company.slug,
          });
        }
      });
    }
  }

  const result = Array.from(problemMap.values());
  cachedProblems = result;
  return result;
}

export async function getAllQuestions(): Promise<(InterviewQuestion & { companyName: string; companySlug: string })[]> {
  if (cachedQuestions) return cachedQuestions;
  try {
    const response = await fetch("/interview-storage/all-questions.json");
    const data = await response.json();
    cachedQuestions = data;
    return data;
  } catch (e) {
    console.error("Failed to fetch all questions", e);
    return [];
  }
}

// ==================== SEARCH ====================

export interface SearchResult {
  type: "company" | "question" | "problem";
  title: string;
  subtitle: string;
  slug: string;
  difficulty?: string;
  category?: string;
}

export async function buildSearchIndex(): Promise<Fuse<SearchResult>> {
  const companies = await getCompanies();
  const problems = await getAllProblems();
  const questions = await getAllQuestions();
  const items: SearchResult[] = [];

  for (const company of companies) {
    items.push({
      type: "company",
      title: company.name,
      subtitle: `${company.industry} • ${company.difficulty}`,
      slug: `/company/${company.slug}`,
    });
  }

  for (const q of questions) {
    items.push({
      type: "question",
      title: q.title,
      subtitle: `${q.companyName} • ${q.category}`,
      slug: `/company/${q.companySlug}/question/${q.id}`,
      difficulty: q.difficulty,
      category: q.category,
    });
  }

  for (const p of problems) {
    items.push({
      type: "problem",
      title: p.title,
      subtitle: `${p.companyName} • ${p.category}`,
      slug: `/company/${p.companySlug}/problem/${p.slug}`,
      difficulty: p.difficulty,
      category: p.category,
    });
  }

  return new Fuse(items, {
    keys: ["title", "subtitle", "category", "difficulty"],
    threshold: 0.3,
    includeScore: true,
  });
}

// ==================== HELPERS ====================

export function getDifficultyColor(difficulty: string): string {
  const d = difficulty.toLowerCase();
  if (d === "easy") return "text-emerald-400";
  if (d === "medium" || d === "medium-hard") return "text-amber-400";
  if (d === "hard" || d === "very hard") return "text-red-400";
  return "text-slate-400";
}

export function getDifficultyBg(difficulty: string): string {
  const d = difficulty.toLowerCase();
  if (d === "easy") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (d === "medium" || d === "medium-hard") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (d === "hard" || d === "very hard") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    arrays: "📊", strings: "🔤", "linked-list": "🔗", stacks: "📚",
    queues: "🚶", trees: "🌳", graphs: "🕸️", dp: "💡",
    recursion: "🔄", sorting: "📈", searching: "🔍", math: "🧮",
    greedy: "🎯", "bit-manipulation": "⚡", heap: "🏔️",
    "binary-search": "✂️", "sliding-window": "🪟", "two-pointer": "👆",
    behavioral: "🗣️", technical: "💻", hr: "🤝",
    oa: "📝", "system-design": "🏗️",
  };
  return icons[category] || "📄";
}

const problemDetailCache: Record<string, any> = {};

export async function getCategoryProblems(categorySlug: string): Promise<Problem[]> {
  const catKey = categorySlug.toLowerCase();
  const data = await safeFetchJson<Problem[]>(`/interview-storage/categories/${catKey}.json`);
  if (data && Array.isArray(data) && data.length > 0) {
    return data;
  }

  const all = await getAllProblems();
  const filtered = all.filter((p) => (p.category || "").toLowerCase() === catKey);
  if (filtered.length > 0) return filtered;

  const normKey = catKey.replace(/-/g, "");
  return all.filter((p) => (p.category || "").toLowerCase().replace(/-/g, "") === normKey);
}

export async function getProblemBySlug(
  problemSlug: string,
  categorySlug?: string
): Promise<any | undefined> {
  if (problemDetailCache[problemSlug]) return problemDetailCache[problemSlug];

  const categoriesToTry = categorySlug
    ? [categorySlug.toLowerCase()]
    : [
        "arrays",
        "two-pointers",
        "sliding-window",
        "strings",
        "linked-list",
        "stack",
        "binary-search",
        "trees",
        "graph",
        "dynamic-programming",
        "heap",
        "greedy",
        "backtracking",
        "matrix",
        "hashing",
        "intervals",
        "bit-manipulation",
        "math",
        "recursion",
        "sorting",
        "queue",
        "binary-search-tree",
        "trie",
        "design",
        "concurrency",
        "prefix-sum",
      ];

  for (const cat of categoriesToTry) {
    const data = await safeFetchJson(`/interview-storage/problems/${cat}/${problemSlug}.json`);
    if (data) {
      // Normalize fields for layout rendering compatibility
      if (data.metadata) {
        Object.assign(data, data.metadata);
        if (data.problem) {
          data.statement = data.problem.problemStatement || data.statement;
          data.examples = data.problem.examples || data.examples;
          data.constraints = data.problem.constraints || data.constraints;
          data.edgeCases = data.problem.edgeCases || data.edgeCases;
        }
        if (data.approaches && data.approaches.length > 0) {
          data.bruteForce = data.approaches[0];
          data.optimal = data.approaches[data.approaches.length - 1];
        }
        if (data.learning) {
          data.intuition = data.learning.whyDoesThisExist;
          data.whenToUse = data.learning.whenToUseThis;
        }
        if (data.interview) {
          data.interviewTips = data.interview.interviewTips;
        }
        if (data.resources) {
          data.relatedProblems = data.resources.relatedProblems;
        }
      }

      if (!data.statement && data.problemStatement) {
        data.statement = data.problemStatement;
      }
      if (!data.companies && data.askedIn) {
        data.companies = data.askedIn;
      }
      
      // Normalize bruteForce
      if (data.bruteForce) {
        if (!data.bruteForce.approach) {
          data.bruteForce.approach = data.bruteForce.description || data.bruteForce.title || data.bruteForce.idea || "Brute Force Approach";
        }
        if (!data.bruteForce.code) {
          data.bruteForce.code = (data.bruteForce.code && typeof data.bruteForce.code === 'object' ? (data.bruteForce.code.javascript || data.bruteForce.code.java || data.bruteForce.code.python) : null) || data.bruteForce.javascript || data.bruteForce.java || data.bruteForce.python || "";
        }
        if (data.bruteForce.complexities) {
            data.bruteForce.timeComplexity = data.bruteForce.complexities.time || "";
            data.bruteForce.spaceComplexity = data.bruteForce.complexities.space || "";
        }
      } else if (data.bruteForceApproach) {
        data.bruteForce = {
          approach: data.bruteForceApproach.description || data.bruteForceApproach.title || "Brute Force Approach",
          code: data.bruteForceApproach.javascript || data.bruteForceApproach.java || data.bruteForceApproach.python || "",
          timeComplexity: data.bruteForceApproach.timeComplexity || "",
          spaceComplexity: data.bruteForceApproach.spaceComplexity || "",
        };
      }

      // Normalize optimal
      if (data.optimal) {
        if (!data.optimal.approach) {
          data.optimal.approach = data.optimal.description || data.optimal.title || data.optimal.idea || "Optimal Solution";
        }
        if (!data.optimal.code) {
          data.optimal.code = (data.optimal.code && typeof data.optimal.code === 'object' ? (data.optimal.code.javascript || data.optimal.code.java || data.optimal.code.python) : null) || data.optimal.javascript || data.optimal.java || data.optimal.python || "";
        }
        if (data.optimal.complexities) {
            data.optimal.timeComplexity = data.optimal.complexities.time || "";
            data.optimal.spaceComplexity = data.optimal.complexities.space || "";
        }
      } else if (data.optimalApproach) {
        data.optimal = {
          approach: data.optimalApproach.description || data.optimalApproach.title || "Optimal Solution",
          code: data.optimalApproach.javascript || data.optimalApproach.java || data.optimalApproach.python || "",
          timeComplexity: data.optimalApproach.timeComplexity || "",
          spaceComplexity: data.optimalApproach.spaceComplexity || "",
        };
      }

      problemDetailCache[problemSlug] = data;
      return data;
    }
  }

  const allProblems = await getAllProblems();
  const found = allProblems.find((p) => p.slug === problemSlug);
  if (found) return found;

  const companies = await getCompanies();
  for (const compMeta of companies) {
    const company = await getCompanyBySlug(compMeta.slug);
    if (company && company.problems) {
      const p = company.problems.find((item) => item.slug === problemSlug);
      if (p) {
        return { ...p, companyName: company.name, companySlug: company.slug };
      }
    }
  }
  return undefined;
}

export interface CategoryStats {
  name: string;
  slug: string;
  icon: string;
  totalProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topics: string[];
}

const ALL_CATEGORY_SLUGS = [
  "arrays",
  "strings",
  "linked-list",
  "two-pointers",
  "sliding-window",
  "binary-search",
  "trees",
  "graph",
  "dynamic-programming",
  "stack",
  "queue",
  "heap",
  "greedy",
  "backtracking",
  "hashing",
  "intervals",
  "bit-manipulation",
  "math",
  "matrix",
  "prefix-sum",
  "recursion",
  "sorting",
  "binary-search-tree",
  "trie",
  "design",
  "concurrency",
];

export async function getCategoriesWithStats(): Promise<CategoryStats[]> {
  const result: CategoryStats[] = [];

  for (const catKey of ALL_CATEGORY_SLUGS) {
    const formattedName = catKey
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    let categoryProblems: Problem[] = [];
    try {
      const res = await fetch(`/interview-storage/categories/${catKey}.json`);
      if (res.ok) {
        categoryProblems = await res.json();
      }
    } catch (e) {
      // Ignore fetch error
    }

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    const topicSet = new Set<string>();

    categoryProblems.forEach((p) => {
      const diff = (p.difficulty || "").toLowerCase();
      if (diff === "easy") easyCount += 1;
      else if (diff === "medium" || diff === "medium-hard") mediumCount += 1;
      else if (diff === "hard" || diff === "very hard") hardCount += 1;

      if (p.topics) {
        p.topics.forEach((t) => topicSet.add(t));
      }
    });

    result.push({
      name: formattedName,
      slug: catKey,
      icon: getCategoryIcon(catKey),
      totalProblems: categoryProblems.length,
      easyCount,
      mediumCount,
      hardCount,
      topics: Array.from(topicSet),
    });
  }

  return result.sort((a, b) => b.totalProblems - a.totalProblems);
}