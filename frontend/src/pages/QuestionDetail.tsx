import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { type Company, type InterviewQuestion, getCompanyBySlug, getDifficultyBg, getCategoryIcon } from "@/lib/data";
import { useAppStore } from "@/lib/store";

export default function QuestionDetailPage() {
  const { slug, questionId } = useParams<{ slug: string; questionId: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const { addBookmark, removeBookmark, isBookmarked, addRecentItem } = useAppStore();

  useEffect(() => {
    if (slug && questionId) {
      getCompanyBySlug(slug).then((c) => {
        if (c) {
          setCompany(c);
          const q = (c.interviewQuestions || []).find((q) => q.id === questionId);
          if (q) {
            setQuestion(q);
            addRecentItem({ title: q.title, slug: `/company/${slug}/question/${questionId}`, type: "question" });
          }
        }
      });
    }
  }, [slug, questionId]);

  if (!company || !question) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const bookmarked = isBookmarked(question.id);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(question.id);
    } else {
      addBookmark({ id: question.id, type: "question", title: question.title, slug: `/company/${slug}/question/${question.id}` });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to={`/company/${slug}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{company.name}</span>
        </Link>
        <span>/</span>
        <span className="capitalize">{question.category}</span>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{question.title}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header Block */}
        <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-card/60 to-primary/5 p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-primary/10 blur-[100px] rounded-full" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{getCategoryIcon(question.category)}</span>
                <span>{question.category}</span>
                <span>•</span>
                <span>{question.round}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl tracking-tight leading-relaxed">
                {question.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium pt-1">
                <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getDifficultyBg(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
                  <span>{question.frequency} frequency</span>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{question.expectedTime} expected</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleBookmark}
              className={`rounded-xl p-2.5 border transition-all shrink-0 ${
                bookmarked
                  ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                  : "border-border/60 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground"
              }`}
              aria-label="Bookmark"
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
          </div>

          {question.topics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/20 pt-4 relative z-10">
              {question.topics.map((topic) => (
                <span key={topic} className="rounded-md bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/20">{topic}</span>
              ))}
            </div>
          )}
        </div>

        {/* Content Tabs Grid */}
        <div className="space-y-5">
          {/* Question detail */}
          <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-3.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Interview Question</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border/20 font-medium">
              {question.content}
            </p>
          </section>

          {/* Expected Answer */}
          <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-3.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Expected Answer Outline</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground pl-1 font-medium">{question.expectedAnswer}</p>
          </section>

          {/* Sample Answer */}
          <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-3.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Star className="h-4 w-4 text-amber-500" />
              <span>High-Scoring Sample Answer</span>
            </h2>
            <div className="rounded-xl border border-border/30 bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap select-all">
              {question.sampleAnswer}
            </div>
          </section>

          {/* Tips */}
          <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-3.5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>Key Delivery Tips</span>
            </h2>
            <ul className="grid gap-2.5">
              {question.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="font-medium">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Follow-up Questions */}
          {question.followUp.length > 0 && (
            <section className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm space-y-3.5">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span>Anticipated Follow-up Questions</span>
              </h2>
              <ul className="grid gap-3">
                {question.followUp.map((q, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-medium leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
}