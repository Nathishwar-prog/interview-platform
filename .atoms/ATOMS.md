Project Context
Project Overview
Interview Preparation Platform - A modern, scalable platform organized company-wise, similar to LeetCode + Glassdoor + InterviewBit. Built with React + TypeScript + Vite + Tailwind CSS + shadcn/ui. Uses file-based CMS with markdown files for content, Fuse.js for search, Zustand for state, and Framer Motion for animations.

Key Decisions
Date	Decision	By	Rationale
2026-06-30	Use Vite + React instead of Next.js	Alex	Template uses Vite; maintains compatibility while delivering same features via react-router
2026-06-30	File-based CMS with static JSON/MD	Alex	Scalable, no database needed, easy admin workflow
2026-06-30	Zustand for state management	Alex	Lightweight, simple API for bookmarks/progress/theme
2026-06-30	Fuse.js for client-side search	Alex	Fast fuzzy search without backend dependency
Constraints
Dark-first design with light mode toggle
Color Palette: Primary #2563EB (blue-600), Secondary #3B82F6 (blue-500), Accent #F97316 (orange-500), Background dark #0F172A (slate-900), Background light #F8FAFC (slate-50)
Typography: Inter for body, JetBrains Mono for code blocks
Glassmorphism cards with subtle borders and backdrop blur
Framer Motion animations for page transitions and micro-interactions
All data loaded dynamically from markdown/JSON files in interview-storage/
No hardcoded company or question data
Maximum scalability: support 10,000+ companies, 100,000+ questions
File limit: 8 code files maximum