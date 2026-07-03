import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";

// Load .env relative to script directory from frontend folder
dotenv.config({ path: path.resolve("../frontend/.env") });

const { Client } = pg;

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  console.log("Connecting to Neon PostgreSQL...");
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected successfully.");

    // Create users table
    console.log("Creating 'users' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add display_name column if it does not exist
    console.log("Checking and altering 'users' table to add 'display_name'...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) DEFAULT '';
    `);

    // Create bookmarks table
    console.log("Creating 'bookmarks' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        added_at BIGINT NOT NULL,
        PRIMARY KEY (id, username)
      );
    `);

    // Create solved_problems table
    console.log("Creating 'solved_problems' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS solved_problems (
        problem_id VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        solved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (problem_id, username)
      );
    `);

    // Seed default admin-created users
    console.log("Seeding default accounts...");
    const defaultUsers = [
      { username: "admin", password: "admin123", role: "admin" },
      { username: "developer", password: "dev123", role: "user" },
      { username: "candidate", password: "prep2026", role: "user" },
    ];

    for (const user of defaultUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      await client.query(
        `
        INSERT INTO users (username, password, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (username) DO UPDATE
        SET password = EXCLUDED.password, role = EXCLUDED.role;
      `,
        [user.username, hashedPassword, user.role]
      );
      console.log(`Seed completed for user: ${user.username}`);
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

migrate();
