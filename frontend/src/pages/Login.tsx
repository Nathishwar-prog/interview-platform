import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, KeyRound, User, ArrowRight } from "lucide-react";
import { login, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);
      setLoading(false);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred during sign-in.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient glowing nodes */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-primary/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-purple-500/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo and Brand Title */}
        <div className="flex flex-col items-center text-center mb-8 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              PrepCrack Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Protected Technical Interview preparation console.
            </p>
          </div>
        </div>

        {/* Login form card */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-2xl shadow-black/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

          <h2 className="text-lg font-bold text-foreground mb-1.5">Sign In</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Authorized users only. Enter your admin-provisioned account details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-foreground"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-foreground"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error display banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 flex gap-2.5 items-start overflow-hidden"
                >
                  <ShieldAlert className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive font-semibold leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all duration-300 hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none group"
            >
              <span>{loading ? "Verifying session..." : "Enter Console"}</span>
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>

        {/* Footer Provision info */}
        <p className="text-[10px] text-center text-muted-foreground/50 mt-6 leading-relaxed">
          Security warning: Session access is provisioned by system administration. Credentials are encrypted on transit. Unauthorized access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
}
