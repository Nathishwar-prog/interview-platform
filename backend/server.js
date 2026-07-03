import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import os from "os";
import { exec } from "child_process";

// Load .env
dotenv.config();
dotenv.config({ path: path.resolve("../frontend/.env") });

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "prepcrack_super_secret_jwt_key_2026";

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL;
const isLocalDb = dbUrl && (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1"));

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

// Ensure temp directory exists for running multi-language code compilation (using OS tmpdir for Vercel serverless compatibility)
const TEMP_DIR = path.join(os.tmpdir(), "prepcrack_temp");
try {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Failed to create TEMP_DIR:", e);
}

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Config Endpoint for frontend runtime configuration
app.get("/api/config", (req, res) => {
  res.json({ API_BASE_URL: "" });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
}

// Authentication login route
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username.trim(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "This user has not been created by an admin." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your password." });
    }

    // Sign real JWT token
    const token = jwt.sign(
      { sub: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Internal server authentication error." });
  }
});

// Get all bookmarks for authenticated user
app.get("/api/bookmarks", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, type, title, slug, added_at FROM bookmarks WHERE username = $1 ORDER BY added_at DESC",
      [req.user.sub]
    );

    // Map column names back to camelCase payload properties for frontend store consistency
    const bookmarks = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      slug: row.slug,
      addedAt: Number(row.added_at),
    }));

    res.json(bookmarks);
  } catch (err) {
    console.error("Fetch bookmarks error:", err);
    res.status(500).json({ error: "Failed to retrieve bookmarks." });
  }
});

// Create/Insert bookmark
app.post("/api/bookmarks", authenticateToken, async (req, res) => {
  const { id, type, title, slug } = req.body;

  if (!id || !type || !title || !slug) {
    return res.status(400).json({ error: "Missing required bookmark fields." });
  }

  try {
    const addedAt = Date.now();
    await pool.query(
      `INSERT INTO bookmarks (id, username, type, title, slug, added_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id, username) DO NOTHING`,
      [id, req.user.sub, type, title, slug, addedAt]
    );

    res.json({ success: true, bookmark: { id, type, title, slug, addedAt } });
  } catch (err) {
    console.error("Insert bookmark error:", err);
    res.status(500).json({ error: "Failed to save bookmark." });
  }
});

// Delete bookmark
app.delete("/api/bookmarks/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM bookmarks WHERE id = $1 AND username = $2", [
      id,
      req.user.sub,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete bookmark error:", err);
    res.status(500).json({ error: "Failed to delete bookmark." });
  }
});

// Get all solved problem IDs for authenticated user
app.get("/api/solved", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT problem_id FROM solved_problems WHERE username = $1",
      [req.user.sub]
    );

    const solvedIds = result.rows.map((row) => row.problem_id);
    res.json(solvedIds);
  } catch (err) {
    console.error("Fetch solved problems error:", err);
    res.status(500).json({ error: "Failed to retrieve solved problems status." });
  }
});

// Mark a problem as solved
app.post("/api/solved", authenticateToken, async (req, res) => {
  const { problemId } = req.body;

  if (!problemId) {
    return res.status(400).json({ error: "Missing problemId field." });
  }

  try {
    await pool.query(
      `INSERT INTO solved_problems (problem_id, username)
       VALUES ($1, $2)
       ON CONFLICT (problem_id, username) DO NOTHING`,
      [problemId, req.user.sub]
    );

    res.json({ success: true, problemId });
  } catch (err) {
    console.error("Save solved problem error:", err);
    res.status(500).json({ error: "Failed to mark problem as solved." });
  }
});

// Mark a problem as unsolved
app.delete("/api/solved/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM solved_problems WHERE problem_id = $1 AND username = $2",
      [id, req.user.sub]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Delete solved problem error:", err);
    res.status(500).json({ error: "Failed to mark problem as unsolved." });
  }
});

// Sandbox run/compiler API route for multi-language execution
app.post("/api/run", authenticateToken, (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language parameters are required." });
  }

  const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let filename = "";
  let command = "";

  switch (language.toLowerCase()) {
    case "javascript":
      filename = path.join(TEMP_DIR, `run_${fileId}.js`);
      command = `node "${filename}"`;
      break;
    case "python":
      filename = path.join(TEMP_DIR, `run_${fileId}.py`);
      // Try 'python' as primary interpreter, fallback to 'python3' is not needed in Windows usually,
      // but let's run it.
      command = `python "${filename}"`;
      break;
    case "java":
      filename = path.join(TEMP_DIR, `Solution_${fileId}.java`);
      // Rewrite class definition to match file name
      const classId = `Solution_${fileId}`;
      const rewrittenCode = code.replace(/public\s+class\s+Solution/g, `public class ${classId}`);
      fs.writeFileSync(filename, rewrittenCode, "utf8");
      command = `java "${filename}"`;
      break;
    case "cpp":
      filename = path.join(TEMP_DIR, `run_${fileId}.cpp`);
      const binaryFilename = path.join(TEMP_DIR, `run_${fileId}.exe`);
      command = `g++ "${filename}" -o "${binaryFilename}" && "${binaryFilename}"`;
      break;
    default:
      return res.status(400).json({ error: `Language '${language}' is not supported.` });
  }

  // Write file contents (if not java which is already written)
  if (language.toLowerCase() !== "java") {
    fs.writeFileSync(filename, code, "utf8");
  }

  const startTime = performance.now();

  // Execute compiler/interpreter commands in shell with a 5-second timeout
  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(3);

    // Clean up temporary files
    try {
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      if (language.toLowerCase() === "cpp") {
        const binFile = path.join(TEMP_DIR, `run_${fileId}.exe`);
        if (fs.existsSync(binFile)) {
          fs.unlinkSync(binFile);
        }
      }
    } catch (cleanupError) {
      console.error("Temp file cleanup error:", cleanupError);
    }

    if (error && error.killed) {
      return res.json({
        stdout: "",
        stderr: "❌ Timeout Error: Execution exceeded time limit of 5.0 seconds.",
        executionTime,
      });
    }

    res.json({
      stdout: stdout || "",
      stderr: stderr || (error ? error.message : ""),
      executionTime,
    });
  });
});

// Get profile details for authenticated user
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, role, display_name, created_at FROM users WHERE username = $1",
      [req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = result.rows[0];
    res.json({
      username: user.username,
      role: user.role,
      displayName: user.display_name,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Failed to retrieve user profile." });
  }
});

// Update profile details / password for authenticated user
app.put("/api/user/profile", authenticateToken, async (req, res) => {
  const { displayName, currentPassword, newPassword } = req.body;

  try {
    // 1. Fetch active user details from database
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.user.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = userResult.rows[0];

    // 2. Validate current password if password change is requested
    let updatedHashedPassword = user.password;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to update credentials." });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Current password verification failed. Please verify." });
      }

      const salt = await bcrypt.genSalt(10);
      updatedHashedPassword = await bcrypt.hash(newPassword, salt);
    }

    // 3. Perform update query
    const newDisplayName = displayName !== undefined ? displayName.trim() : user.display_name;
    await pool.query(
      "UPDATE users SET display_name = $1, password = $2 WHERE username = $3",
      [newDisplayName, updatedHashedPassword, req.user.sub]
    );

    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        displayName: newDisplayName,
        createdAt: user.created_at,
      }
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update user profile details." });
  }
});
// Middleware to authenticate Admin role
function authenticateAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access Denied: Admin privileges required." });
  }
  next();
}

// GET all users (Admin only)
app.get("/api/admin/users", authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, role, display_name as \"displayName\", created_at as \"createdAt\" FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch all users error:", err);
    res.status(500).json({ error: "Failed to retrieve user accounts." });
  }
});

// POST create new user (Admin only)
app.post("/api/admin/users", authenticateToken, authenticateAdmin, async (req, res) => {
  const { username, password, role, displayName } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role fields are required." });
  }

  try {
    // Check if user already exists
    const checkUser = await pool.query("SELECT username FROM users WHERE username = $1", [
      username.trim(),
    ]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Username is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const nameVal = displayName ? displayName.trim() : "";

    const result = await pool.query(
      `INSERT INTO users (username, password, role, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING username, role, display_name as "displayName", created_at as "createdAt"`,
      [username.trim(), hashedPassword, role, nameVal]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Failed to create user account." });
  }
});

// PUT update user (Admin only)
app.put("/api/admin/users/:username", authenticateToken, authenticateAdmin, async (req, res) => {
  const { username } = req.params;
  const { role, displayName, password } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role field is required." });
  }

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User account not found." });
    }

    const user = userResult.rows[0];

    // Optional password hash
    let updatedHashedPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedHashedPassword = await bcrypt.hash(password, salt);
    }

    const newDisplayName = displayName !== undefined ? displayName.trim() : user.display_name;

    const result = await pool.query(
      `UPDATE users
       SET role = $1, display_name = $2, password = $3
       WHERE username = $4
       RETURNING username, role, display_name as "displayName", created_at as "createdAt"`,
      [role, newDisplayName, updatedHashedPassword, username]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user account details." });
  }
});

// DELETE user (Admin only)
app.delete("/api/admin/users/:username", authenticateToken, authenticateAdmin, async (req, res) => {
  const { username } = req.params;

  // Prevent self-deletion
  if (username === req.user.sub) {
    return res.status(400).json({ error: "Forbidden: You cannot delete your own admin account." });
  }

  try {
    const result = await pool.query("DELETE FROM users WHERE username = $1", [username]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User account not found." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user account." });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Express API server running on http://localhost:${PORT}`);
  });
}

export default app;
