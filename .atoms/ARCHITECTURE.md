Architecture Design
System Overview
A React SPA with file-based CMS. Content lives in interview-storage/ as JSON and Markdown files. The app dynamically loads and renders this content using react-router for navigation, Fuse.js for search, and Zustand for client state (bookmarks, progress, theme).

Tech Stack
React 18 + TypeScript + Vite
Tailwind CSS + shadcn/ui
react-router-dom for routing
Zustand for state management
Fuse.js for fuzzy search
Framer Motion for animations
markdown-to-jsx for MD rendering
gray-matter equivalent (yaml frontmatter parsing)
Lucide React for icons
Module Design
Module	Responsibility	Key Files
Pages	Route components	src/pages/*.tsx
Components	Reusable UI	src/components/*.tsx
Store	Zustand state	src/lib/store.ts
Data	Types, loaders, search	src/lib/data.ts
Content	Sample MD/JSON	public/interview-storage/
Tech Decisions
Decision	Choice	Rationale
Routing	react-router-dom	Template standard, supports dynamic routes
State	Zustand	Minimal boilerplate, persistent localStorage
Search	Fuse.js	Client-side fuzzy search, no server needed
Content	Static JSON in public/	Fetched at runtime, easy to scale
Styling	Tailwind + shadcn/ui	Pre-built accessible components
File Tree Plan
src/
├── pages/
│   ├── Index.tsx (Home)
│   ├── Companies.tsx
│   ├── CompanyDetail.tsx
│   ├── QuestionDetail.tsx
│   └── ProblemDetail.tsx
├── components/
│   ├── Layout.tsx (Nav, Footer, Theme, CommandPalette)
│   ├── CompanyCard.tsx
│   └── ui/ (shadcn pre-built)
├── lib/
│   ├── store.ts (Zustand)
│   └── data.ts (types, loaders, search)
├── App.tsx
├── main.tsx
└── index.css
public/
└── interview-storage/
    └── companies.json (all company data)
Implementation Guide
Create interview-storage data (companies.json with sample companies, questions, problems)
Build data layer (TypeScript types, fetch utilities, Fuse.js search)
Build Zustand store (theme, bookmarks, search history)
Create Layout component (navbar, footer, command palette, theme toggle)
Build pages: Home → Companies → CompanyDetail → QuestionDetail → ProblemDetail
Wire up routing in App.tsx
Style with dark-first Tailwind theme
Lint and build