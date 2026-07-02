import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Building2,
  Code2,
  BookOpen,
  Command,
  Sparkles,
  Terminal,
  Bookmark,
  History,
  CornerDownLeft,
  LogOut,
  Users,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { buildSearchIndex, type SearchResult, getDifficultyBg } from "@/lib/data";
import Fuse from "fuse.js";
import { getSession, logout } from "@/lib/auth";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchIndexRef = useRef<Fuse<SearchResult> | null>(null);

  const session = getSession();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const {
    theme,
    toggleTheme,
    commandPaletteOpen,
    setCommandPaletteOpen,
    bookmarks,
    fetchBookmarks,
    fetchSolvedProblems,
    searchHistory,
    addSearchQuery,
    clearSearchHistory,
  } = useAppStore();

  // Apply theme class to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const username = session?.username;

  // Fetch bookmarks and solved problems from database when session is active
  useEffect(() => {
    if (username) {
      fetchBookmarks();
      fetchSolvedProblems();
    }
  }, [username]);

  // Handle global keyboard shortcut for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Load Search Index when palette is opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setActiveIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      if (!searchIndexRef.current) {
        buildSearchIndex().then((index) => {
          searchIndexRef.current = index;
        });
      }
    }
  }, [commandPaletteOpen]);

  // Execute Search
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setActiveIndex(0);
      return;
    }

    if (searchIndexRef.current) {
      const results = searchIndexRef.current.search(searchQuery).slice(0, 8);
      setSearchResults(results.map((r) => r.item));
      setActiveIndex(0);
    }
  }, [searchQuery]);

  // Handle keyboard navigation within the Command Palette
  const handleKeyDownInSearch = (e: React.KeyboardEvent) => {
    const totalItems = searchResults.length > 0 ? searchResults.length : searchHistory.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        const selected = searchResults[activeIndex];
        addSearchQuery(selected.title);
        navigate(selected.slug);
        setCommandPaletteOpen(false);
      } else if (searchHistory.length > 0) {
        // Run search using historical query
        const query = searchHistory[activeIndex];
        setSearchQuery(query);
      }
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    addSearchQuery(result.title);
    navigate(result.slug);
    setCommandPaletteOpen(false);
  };

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Companies", path: "/companies", icon: Building2 },
    { name: "Problems", path: "/problems", icon: Code2 },
    { name: "Bookmarks", path: "/bookmarks", icon: Bookmark },
  ];

  if (session?.role === "admin") {
    navLinks.push({ name: "User Admin", path: "/admin/users", icon: Users });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <Terminal className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  PrepCrack
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search...</span>
                <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === "dark" ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                </motion.div>
              </button>

              {/* User Profile & Logout */}
              {session && (
                <div className="flex items-center gap-3 pl-3 border-l border-border/60">
                  <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary select-none uppercase group-hover:border-primary/45 transition-colors">
                      {session.username[0]}
                    </div>
                    <span className="text-xs font-bold text-foreground/80 max-w-[80px] truncate capitalize group-hover:text-primary transition-colors">
                      {session.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/10"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}

              {session && (
                <div className="border-t border-border/40 mt-4 pt-4 flex items-center justify-between">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 hover:text-primary transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary uppercase group-hover:border-primary/45 transition-colors">
                      {session.username[0]}
                    </div>
                    <span className="text-sm font-bold text-foreground capitalize group-hover:text-primary transition-colors">
                      {session.username} ({session.role})
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive text-xs font-bold bg-destructive/5 hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card py-12 text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Terminal className="h-4 w-4" />
                </div>
                <span>PrepCrack</span>
              </div>
              <p className="text-sm">
                Unlock your dream job. Curated question libraries, DSA problems, and real interview insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/companies" className="hover:text-primary">
                    All Companies
                  </Link>
                </li>
                <li>
                  <Link to="/problems" className="hover:text-primary">
                    DSA Coding Problems
                  </Link>
                </li>
                <li>
                  <Link to="/bookmarks" className="hover:text-primary">
                    Bookmarked Topics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <p className="text-sm leading-relaxed">
                Clean, local-first platform designed for maximum developer productivity. Double down on interview preparation.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-border/20 pt-8 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} PrepCrack. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center p-4 sm:p-6 md:p-20"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative max-w-2xl w-full border border-border/80 bg-card shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[80vh] sm:max-h-[60vh] mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input Area */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type to search companies, questions, or problems..."
                  className="flex-1 bg-transparent text-foreground outline-none text-sm placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDownInSearch}
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted font-mono"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions / Results list */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {/* When query is empty, show history and bookmark info */}
                {!searchQuery && (
                  <div className="space-y-4 py-2">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <History className="h-3 w-3" /> Recent Searches
                          </span>
                          <button
                            onClick={clearSearchHistory}
                            className="hover:text-primary text-[10px] normal-case font-normal"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-0.5 mt-1">
                          {searchHistory.map((query, index) => (
                            <button
                              key={query + index}
                              onClick={() => setSearchQuery(query)}
                              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                activeIndex === index ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                              }`}
                            >
                              <span className="truncate">{query}</span>
                              <CornerDownLeft className="h-3.5 w-3.5 opacity-55" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bookmarked Items summary */}
                    {bookmarks.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Bookmark className="h-3 w-3" /> Quick Access Bookmarks
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1 px-2">
                          {bookmarks.slice(0, 4).map((bookmark) => (
                            <Link
                              key={bookmark.id}
                              to={bookmark.slug}
                              onClick={() => setCommandPaletteOpen(false)}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                            >
                              <div className="p-1 rounded bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground shrink-0">
                                {bookmark.type === "company" ? (
                                  <Building2 className="h-3.5 w-3.5" />
                                ) : bookmark.type === "problem" ? (
                                  <Code2 className="h-3.5 w-3.5" />
                                ) : (
                                  <BookOpen className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{bookmark.title}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{bookmark.type}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General Help Tips */}
                    <div className="p-3 bg-muted/10 rounded-lg border border-border/20 mx-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-foreground">Pro-tip:</span> Search by difficulty (e.g.
                        "medium"), company name ("Google"), or category ("dp").
                      </p>
                    </div>
                  </div>
                )}

                {/* Show search results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Search Results
                    </div>
                    {searchResults.map((result, index) => (
                      <button
                        key={result.slug}
                        onClick={() => handleSelectResult(result)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          activeIndex === index
                            ? "bg-primary/10 text-primary border-l-2 border-primary pl-4"
                            : "hover:bg-muted/50 border-l-2 border-transparent"
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0">
                          {result.type === "company" ? (
                            <Building2 className="h-4 w-4" />
                          ) : result.type === "problem" ? (
                            <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        {result.difficulty && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${getDifficultyBg(
                              result.difficulty
                            )}`}
                          >
                            {result.difficulty}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Search query not matching anything */}
                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground space-y-2">
                    <Command className="h-8 w-8 mx-auto stroke-[1.2] opacity-40" />
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                    <p className="text-xs">Try searching for other terms or keywords.</p>
                  </div>
                )}
              </div>

              {/* Footer Helper */}
              <div className="border-t border-border px-4 py-2.5 bg-muted/10 text-[10px] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border bg-background px-1">↑↓</kbd> to navigate
                  <kbd className="rounded border bg-background px-1">Enter</kbd> to select
                </span>
                <span>PrepCrack Command Search</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
