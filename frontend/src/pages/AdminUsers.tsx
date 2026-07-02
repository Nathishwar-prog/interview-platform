import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";
import { getSession, getToken } from "@/lib/auth";

interface UserAccount {
  username: string;
  role: string;
  displayName: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const session = getSession();
  const currentUsername = session?.username;

  // Authorization Check on Mount
  useEffect(() => {
    if (!session || session.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");

  // Status Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session && session.role === "admin") {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUsername("");
    setDisplayName("");
    setRole("user");
    setPassword("");
    setError(null);
    setSuccess(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setDisplayName(user.displayName || "");
    setRole(user.role);
    setPassword("");
    setError(null);
    setSuccess(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const token = getToken();
    if (!token) return;

    if (!editingUser) {
      // Validate create fields
      if (!username.trim() || !password.trim()) {
        setError("Username and password are required.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.username}`
        : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const payload: any = { role, displayName };

      if (!editingUser) {
        payload.username = username.trim();
        payload.password = password;
      } else if (password.trim()) {
        payload.password = password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process user action.");
      }

      setSuccess(
        editingUser
          ? `User "${editingUser.username}" updated successfully!`
          : `New user "${data.user.username}" registered successfully!`
      );

      // Refresh list
      fetchUsers();

      // Close dialog after delay
      setTimeout(() => {
        setDialogOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userToDelete: string) => {
    if (userToDelete === currentUsername) {
      alert("Self-deletion is forbidden. You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to delete user "${userToDelete}"? This action cannot be undone.`)) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess(`User "${userToDelete}" removed successfully.`);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete user failed:", err);
    }
  };

  // Filter list
  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      (u.displayName || "").toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  // User counters
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = totalCount - adminCount;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header bar and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-relaxed flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <span>User Management Dashboard</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Create, update, and manage developer access permissions for this workspace.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-95 flex items-center gap-1.5 shadow-md shadow-primary/10 self-start sm:self-center"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Statistics counters row */}
      <div className="grid gap-4 grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-card/30 p-4 flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Users
          </span>
          <span className="text-xl font-extrabold text-foreground">{totalCount}</span>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card/30 p-4 flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Administrators
          </span>
          <span className="text-xl font-extrabold text-primary">{adminCount}</span>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card/30 p-4 flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Standard Users
          </span>
          <span className="text-xl font-extrabold text-muted-foreground">{userCount}</span>
        </div>
      </div>

      {/* Notification banner */}
      {success && !dialogOpen && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex gap-2 items-center text-xs text-emerald-400"
        >
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Search filtering */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search user by username, display name, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border/60 bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
        />
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/45" />
      </div>

      {/* Main Table view */}
      <div className="rounded-2xl border border-border/40 bg-card/10 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40 font-bold text-muted-foreground select-none">
                <th className="p-4">Username</th>
                <th className="p-4">Display Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Join Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                    No matching users found in database.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.username}
                    className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-foreground">
                      @{user.username}
                      {user.username === currentUsername && (
                        <span className="ml-2 text-[9px] font-bold px-1 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                          You
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {user.displayName || <span className="italic text-muted-foreground/40">Not Set</span>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          user.role === "admin"
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-muted border-border/40 text-muted-foreground"
                        }`}
                      >
                        <Shield className="h-2.5 w-2.5" />
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right space-x-2.5">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit User"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        disabled={user.username === currentUsername}
                        className={`rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all ${
                          user.username === currentUsername ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD dialog modal Overlay */}
      <AnimatePresence>
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDialogOpen(false)}
              className="absolute inset-0 bg-[#070509]/80 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-border/50 bg-[#0c0a12] p-6 shadow-2xl space-y-4 overflow-hidden"
            >
              <div className="absolute right-0 top-0 h-32 w-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Title bar */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3 relative z-10">
                <h3 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                  <UserPlus className="h-4.5 w-4.5 text-primary" />
                  <span>{editingUser ? "Modify User Account" : "Register New Account"}</span>
                </h3>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Alert logs */}
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 flex gap-2 items-center text-[11px] text-destructive relative z-10">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex gap-2 items-center text-[11px] text-emerald-400 relative z-10">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Inputs Form */}
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled={!!editingUser}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter unique username..."
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Display name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name (optional)..."
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>

                {/* Role selection dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Role Privilege
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary/50 outline-none transition-all cursor-pointer"
                  >
                    <option value="user">Standard User (Developer)</option>
                    <option value="admin">Workspace Admin</option>
                  </select>
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Password {editingUser && <span className="text-[8px] text-muted-foreground/50 lowercase italic">(leave empty to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingUser ? "Enter new password..." : "Enter default password..."}
                      className="w-full rounded-xl border border-border/60 bg-background pl-3.5 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono"
                      required={!editingUser}
                    />
                    <Key className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/45" />
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="border-t border-border/20 pt-4 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-xl border border-border/60 px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {submitting && (
                      <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    )}
                    <span>{editingUser ? "Save User" : "Register User"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
