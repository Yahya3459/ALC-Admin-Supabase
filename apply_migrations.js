import pg from 'pg';
import fs from 'fs';

// Use DATABASE_URL from environment instead of hardcoded credentials
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

async function applyMigrations() {
  const client = new pg.Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
  });
  try {
    await client.connect();
    console.log("✅ Connected to Supabase");

    const sql = fs.readFileSync('drizzle/0000_pink_sinister_six.sql', 'utf8');
    const statements = sql.split('--> statement-breakpoint');

    for (let statement of statements) {
      statement = statement.trim();
      if (statement) {
        console.log("Executing:", statement.substring(0, 50) + "...");
        await client.query(statement);
      }
    }

    console.log("✅ Migrations applied successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
