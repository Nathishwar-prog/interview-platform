import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Building2, Code2, MessageSquare, Trash2, Clock, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, recentItems } = useAppStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-card/80 to-primary/5 p-8 shadow-md">
        <div className="absolute right-0 top-0 h-48 w-48 bg-primary/10 blur-[100px] rounded-full" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Personal Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Your Bookmarks & Activity
          </h1>
          <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
            Manage your saved coding questions, algorithms, and view your recently explored companies and preparation logs.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Bookmarks Section (3/5 Columns) */}
        <section className="md:col-span-3 space-y-4">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <Bookmark className="h-5 w-5 text-primary" />
            <span>Saved Bookmarks</span>
            <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-2 py-0.5">{bookmarks.length}</span>
          </h2>

          {bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center space-y-3 bg-muted/5">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
              <div>
                <p className="text-sm font-semibold text-foreground">No bookmarks saved yet</p>
                <p className="text-xs text-muted-foreground mt-1">Save interview questions and DSA problems to keep them in focus.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark, i) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3.5 rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5 group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border group-hover:border-primary/20 transition-all">
                    {bookmark.type === "company" && <Building2 className="h-5 w-5 text-primary/70" />}
                    {bookmark.type === "question" && <MessageSquare className="h-5 w-5 text-emerald-500/70" />}
                    {bookmark.type === "problem" && <Code2 className="h-5 w-5 text-purple-500/70" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={bookmark.slug} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block leading-normal">
                      {bookmark.title}
                    </Link>
                    <p className="text-[10px] font-semibold text-muted-foreground/60 capitalize mt-0.5">
                      {bookmark.type} • Saved {new Date(bookmark.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 border border-transparent hover:border-destructive/10"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Items Section (2/5 Columns) */}
        <section className="md:col-span-2 space-y-4">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>Recently Visited</span>
            <span className="rounded-full bg-muted border border-border/20 text-muted-foreground text-xs font-bold px-2 py-0.5">{recentItems.length}</span>
          </h2>

          {recentItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center space-y-3 bg-muted/5">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground/30 stroke-[1.2]" />
              <div>
                <p className="text-sm font-semibold text-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Your browsing history will show up here as you explore.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.slice(0, 10).map((item, i) => (
                <Link
                  key={`${item.slug}-${i}`}
                  to={item.slug}
                  className="flex items-center gap-3.5 rounded-xl border border-border/40 bg-card/30 p-3.5 transition-all duration-300 hover:border-primary/20 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5 group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border group-hover:border-primary/10 transition-all">
                    {item.type === "company" && <Building2 className="h-4.5 w-4.5 text-primary/70" />}
                    {item.type === "question" && <MessageSquare className="h-4.5 w-4.5 text-emerald-500/70" />}
                    {item.type === "problem" && <Code2 className="h-4.5 w-4.5 text-purple-500/70" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate leading-normal">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{item.type}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                    {new Date(item.visitedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}