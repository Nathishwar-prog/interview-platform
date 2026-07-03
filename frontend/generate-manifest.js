import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROBLEMS_DIR = path.join(__dirname, "public", "interview-storage", "problems");
const CATEGORIES_DIR = path.join(__dirname, "public", "interview-storage", "categories");
const MANIFEST_PATH = path.join(__dirname, "public", "interview-storage", "problems-manifest.json");

function formatTitle(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function run() {
  if (!fs.existsSync(PROBLEMS_DIR)) {
    console.error("Problems directory not found:", PROBLEMS_DIR);
    return;
  }

  const categoryFolders = fs.readdirSync(PROBLEMS_DIR).filter((item) => {
    const full = path.join(PROBLEMS_DIR, item);
    return fs.statSync(full).isDirectory();
  });

  const allManifestProblems = [];
  const categoryMap = {};

  categoryFolders.forEach((catSlug) => {
    const catPath = path.join(PROBLEMS_DIR, catSlug);
    const files = fs.readdirSync(catPath).filter((f) => f.endsWith(".json"));

    const categoryProblems = [];

    files.forEach((file) => {
      const slug = file.replace(".json", "");
      const fullPath = path.join(catPath, file);
      const stat = fs.statSync(fullPath);

      let problemData = null;
      if (stat.size > 0) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          problemData = JSON.parse(content);
        } catch (e) {
          // Empty or invalid
        }
      }

      const meta = problemData?.metadata || {};
      const prob = problemData?.problem || {};

      const title = meta.title || formatTitle(slug);
      const difficulty = meta.difficulty || "Medium";
      const acceptance = meta.acceptance || "50.0%";
      const frequency = meta.frequency || "High";
      const topics = meta.tags || meta.topics || [formatTitle(catSlug)];
      const companies = meta.companies || meta.askedIn || ["Google", "Amazon", "Meta"];
      const statement = prob.problemStatement || prob.statement || `Solve ${title} using optimal ${formatTitle(catSlug)} techniques.`;

      const problemItem = {
        id: meta.id || slug,
        title,
        slug,
        category: catSlug,
        difficulty,
        acceptance,
        frequency,
        topics,
        companies,
        statement,
      };

      categoryProblems.push(problemItem);
      allManifestProblems.push(problemItem);
    });

    categoryMap[catSlug] = categoryProblems;

    // Write category JSON file
    if (!fs.existsSync(CATEGORIES_DIR)) {
      fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
    }
    const catJsonPath = path.join(CATEGORIES_DIR, `${catSlug}.json`);
    fs.writeFileSync(catJsonPath, JSON.stringify(categoryProblems, null, 2), "utf8");
    console.log(`Generated ${catSlug}.json (${categoryProblems.length} problems)`);
  });

  // Write manifest file
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(allManifestProblems, null, 2), "utf8");
  console.log(`Successfully generated problems-manifest.json with ${allManifestProblems.length} total problems.`);
}

run();
