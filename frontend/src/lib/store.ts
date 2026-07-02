import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getToken } from "./auth";

interface Bookmark {
  id: string;
  type: "company" | "question" | "problem";
  title: string;
  slug: string;
  addedAt: number;
}

interface RecentItem {
  title: string;
  slug: string;
  type: "company" | "question" | "problem";
  visitedAt: number;
}

interface AppState {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Bookmarks
  bookmarks: Bookmark[];
  fetchBookmarks: () => Promise<void>;
  addBookmark: (bookmark: Omit<Bookmark, "addedAt">) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;

  // Recent
  recentItems: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, "visitedAt">) => void;

  // Search
  searchHistory: string[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;

  // Progress
  solvedProblems: string[];
  fetchSolvedProblems: () => Promise<void>;
  markSolved: (problemId: string) => void;
  unmarkSolved: (problemId: string) => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: "dark",
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      // Bookmarks
      bookmarks: [],
      fetchBookmarks: async () => {
        const token = getToken();
        if (!token) return;

        try {
          const response = await fetch("/api/bookmarks", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            set({ bookmarks: data });
          }
        } catch (err) {
          console.error("Fetch bookmarks from database failed:", err);
        }
      },
      addBookmark: async (bookmark) => {
        const addedAt = Date.now();
        const newBookmark: Bookmark = { ...bookmark, addedAt };

        // Optimistically update frontend state
        set((state) => ({
          bookmarks: [...state.bookmarks, newBookmark],
        }));

        const token = getToken();
        if (!token) return;

        try {
          const res = await fetch("/api/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bookmark),
          });
          if (!res.ok) {
            console.error("Server error saving bookmark:", await res.text());
          }
        } catch (err) {
          console.error("Failed to save bookmark to Neon database:", err);
        }
      },
      removeBookmark: async (id) => {
        // Optimistically remove from frontend state
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));

        const token = getToken();
        if (!token) return;

        try {
          const res = await fetch(`/api/bookmarks/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            console.error("Server error deleting bookmark:", await res.text());
          }
        } catch (err) {
          console.error("Failed to delete bookmark from Neon database:", err);
        }
      },
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),

      // Recent
      recentItems: [],
      addRecentItem: (item) =>
        set((state) => {
          const filtered = state.recentItems.filter((r) => r.slug !== item.slug);
          return {
            recentItems: [{ ...item, visitedAt: Date.now() }, ...filtered].slice(0, 20),
          };
        }),

      // Search
      searchHistory: [],
      addSearchQuery: (query) =>
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 10),
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),

      // Progress
      solvedProblems: [],
      fetchSolvedProblems: async () => {
        const token = getToken();
        if (!token) return;

        try {
          const response = await fetch("/api/solved", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            set({ solvedProblems: data });
          }
        } catch (err) {
          console.error("Fetch solved problems from database failed:", err);
        }
      },
      markSolved: async (problemId) => {
        // Optimistically update frontend state
        set((state) => ({
          solvedProblems: [...new Set([...state.solvedProblems, problemId])],
        }));

        const token = getToken();
        if (!token) return;

        try {
          const res = await fetch("/api/solved", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId }),
          });
          if (!res.ok) {
            console.error("Server error saving solved problem:", await res.text());
          }
        } catch (err) {
          console.error("Failed to mark problem as solved in Neon DB:", err);
        }
      },
      unmarkSolved: async (problemId) => {
        // Optimistically remove from frontend state
        set((state) => ({
          solvedProblems: state.solvedProblems.filter((id) => id !== problemId),
        }));

        const token = getToken();
        if (!token) return;

        try {
          const res = await fetch(`/api/solved/${problemId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            console.error("Server error removing solved problem:", await res.text());
          }
        } catch (err) {
          console.error("Failed to mark problem as unsolved in Neon DB:", err);
        }
      },

      // Command Palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: "interview-prep-storage",
      partialize: (state) => ({
        theme: state.theme,
        recentItems: state.recentItems,
        searchHistory: state.searchHistory,
      }),
    }
  )
);