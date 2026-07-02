import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Calendar,
  Lock,
  Edit2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { getToken } from "@/lib/auth";

interface ProfileData {
  username: string;
  role: string;
  displayName: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Alert/Status states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Toggle password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Selected tab
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.displayName || "");
      }
    } catch (err) {
      console.error("Fetch profile failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUpdating(true);

    const token = getToken();
    if (!token) return;

    // Check fields for security updates
    if (activeTab === "security") {
      if (!currentPassword) {
        setError("Current password is required to verify changes.");
        setUpdating(false);
        return;
      }
      if (!newPassword) {
        setError("New password cannot be empty.");
        setUpdating(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        setUpdating(false);
        return;
      }
    }

    try {
      const body: any = { displayName };
      if (activeTab === "security") {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccess("Profile updated successfully!");
      if (data.user) {
        setProfile(data.user);
        setDisplayName(data.user.displayName || "");
      }

      // Clear password inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">Unable to load profile data.</p>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-relaxed">
          Account Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your personal details, credentials, and check your role settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Avatar & Summary Info Card */}
        <div className="md:col-span-1 rounded-2xl border border-border/40 bg-gradient-to-b from-card/80 to-primary/5 p-6 shadow-md flex flex-col items-center text-center space-y-5">
          {/* Avatar Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[15px] rounded-full" />
            <div className="relative h-20 w-20 rounded-full border border-primary/20 bg-background flex items-center justify-center text-primary shadow-inner">
              <User className="h-10 w-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground border-2 border-background">
              <Shield className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Core metadata display */}
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              {profile.displayName || profile.username}
            </h2>
            <p className="text-xs font-mono text-muted-foreground">@{profile.username}</p>
          </div>

          <div className="w-full border-t border-border/20 pt-4 space-y-3 font-semibold text-xs text-left">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary/80" />
                <span>Account Role</span>
              </span>
              <span className="uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {profile.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary/80" />
                <span>Member Since</span>
              </span>
              <span className="text-foreground">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Setting tabs Form Card */}
        <div className="md:col-span-2 rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm shadow-md flex flex-col space-y-5">
          {/* Tabs header selector */}
          <div className="flex border-b border-border/30 pb-0.5">
            <button
              onClick={() => {
                setActiveTab("general");
                setError(null);
                setSuccess(null);
              }}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === "general"
                  ? "text-primary font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              General Profile
              {activeTab === "general" && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
                setError(null);
                setSuccess(null);
              }}
              className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                activeTab === "security"
                  ? "text-primary font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Security Settings
              {activeTab === "security" && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
            {/* Display success/error alerts */}
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 flex gap-2 items-center text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex gap-2 items-center text-xs text-emerald-400">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {activeTab === "general" ? (
              <div className="space-y-4">
                {/* Username read-only */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="w-full rounded-xl border border-border/40 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground cursor-not-allowed select-none outline-none font-mono"
                  />
                </div>

                {/* Display Name editable */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter display name..."
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    />
                    <Edit2 className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/45" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Verify active password..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-background pl-3.5 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-background pl-3.5 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-type new password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-background pl-3.5 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions button */}
            <div className="border-t border-border/20 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
              >
                {updating && (
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                )}
                <span>{updating ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
