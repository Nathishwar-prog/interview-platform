const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '../public/interview-storage/problems');

function titleFromSlug(slug) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function migrateProblem(old, fallbackSlug, fallbackCategory) {
  return {
    metadata: {
      id: old.id || fallbackSlug || "",
      title: old.title || titleFromSlug(fallbackSlug) || "",
      slug: old.slug || fallbackSlug || "",
      difficulty: old.difficulty || "Medium",
      category: old.category || fallbackCategory || "",
      subcategory: old.subcategory || "",
      pattern: old.pattern || "",
      tags: old.topics || [],
      companies: old.companies || old.askedIn || [],
      frequency: old.frequency || "",
      acceptance: old.acceptance || "",
      estimatedTime: old.estimatedTime || "",
      practiceLevel: old.practiceLevel || "",
      premium: old.premium || false
    },
    learning: {
      whatWillYouLearn: old.prerequisites && old.prerequisites.length ? `Prerequisites: ${old.prerequisites.join(', ')}` : "Core pattern and intuition",
      whyDoesThisExist: old.realWorldExample || "Common interview concept",
      realWorldAnalogy: old.realWorldExample || "",
      prerequisites: old.prerequisites || [],
      whenToUseThis: old.whenToUse || "",
      patternRecognitionKeywords: old.patternRecognition?.keywords || [],
      signals: old.patternRecognition?.howToIdentify || "",
      redFlags: "",
      expectedLearningOutcome: "I will know when to use this pattern."
    },
    problem: {
      problemStatement: old.problemStatement || "",
      examples: old.examples || [],
      constraints: old.constraints || [],
      edgeCases: old.edgeCases || []
    },
    thinkingProcess: {
      firstThought: "",
      initialAssumptions: "",
      naiveIdea: old.bruteForce?.description || "",
      whyItSeemsCorrect: "",
      whereItFails: "",
      observation: "",
      keyInsight: old.intuition || "",
      ahaMoment: old.cheatSheet?.keyObservation || "",
      mentalModel: "",
      patternRecognition: old.patternRecognition?.howToIdentify || "",
      deriveTheAlgorithm: "",
      whyItWorks: old.optimalApproach?.whyOptimal || "",
      howToRecognizeSimilar: old.patternRecognition?.howToIdentify || "",
      commonWrongPaths: old.commonMistakes || []
    },
    thinkingCoach: {
      hints: old.hints || [],
      guidedQuestions: [],
      commonMisconceptions: old.commonMistakes || [],
      correctMindset: "",
      reasoningCheckpoints: []
    },
    pattern: {
      name: old.pattern || "",
      recognitionSignals: old.patternRecognition?.howToIdentify || "",
      whenNotToUse: "",
      mentalModel: "",
      templateAlgorithm: "",
      reusablePseudocode: "",
      similarPatterns: []
    },
    approaches: [
      old.bruteForce && mapApproach(old.bruteForce),
      old.betterApproach && mapApproach(old.betterApproach),
      old.optimalApproach && mapApproach(old.optimalApproach)
    ].filter(Boolean),
    visualization: {
      description: old.visualExplanation?.description || "",
      steps: old.visualExplanation?.steps || []
    },
    practice: {
      revisionNotes: old.revisionNotes || [],
      practiceLevel: old.practiceLevel || "",
      mistakeChecklist: []
    },
    interview: {
      interviewFollowUps: old.interviewFollowUps || [],
      interviewTips: old.interviewTips || [],
      communicationExpectations: "Explain your thought process clearly.",
      tradeOffs: ""
    },
    revision: {
      cheatSheet: old.cheatSheet || {},
      importantPoints: old.importantPoints || [],
      commonMistakes: old.commonMistakes || []
    },
    resources: {
      leetcode: old.leetcode || "",
      neetcode: old.neetcode || "",
      youtube: old.youtube || [],
      relatedProblems: old.relatedProblems || []
    },
    analytics: {
      completionStatus: false,
      timeSpent: 0,
      confidence: 0,
      attempts: 0,
      hintsUsed: 0,
      mistakes: 0,
      revisionCount: 0
    }
  };
}

function mapApproach(appr) {
  if (!appr) return null;
  return {
    title: appr.title || "",
    idea: appr.description || "",
    intuition: appr.whyOptimal || "",
    whenToUse: "",
    algorithm: appr.algorithm || [],
    dryRun: appr.dryRun || "",
    visualization: {},
    code: {
      java: appr.java || "",
      python: appr.python || "",
      cpp: appr.cpp || "",
      javascript: appr.javascript || ""
    },
    complexities: {
      time: appr.timeComplexity || "",
      space: appr.spaceComplexity || ""
    },
    pros: [],
    cons: [],
    interviewExplanation: "",
    optimizationPath: "",
    edgeCases: []
  };
}

async function run() {
  const categories = fs.readdirSync(PROBLEMS_DIR).filter(d => fs.statSync(path.join(PROBLEMS_DIR, d)).isDirectory());
  let migratedCount = 0;
  
  for (const cat of categories) {
    const catDir = path.join(PROBLEMS_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(catDir, file);
      const slug = file.replace('.json', '');
      let oldData = {};
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
        if (fileContent.length > 0) {
          oldData = JSON.parse(fileContent);
        }
        
        // Skip if already migrated (check if data has metadata object)
        if (oldData.metadata && oldData.metadata.slug) {
            // It is already migrated, just continue
            continue;
        }

        const migrated = migrateProblem(oldData, slug, cat);
        fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2), 'utf-8');
        migratedCount++;
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
      }
    }
  }
  console.log(`Successfully migrated ${migratedCount} problem files to the new architecture.`);
}

run();
