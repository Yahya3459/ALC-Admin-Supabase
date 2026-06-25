import pg from 'pg';
import fs from 'fs';

const connectionString = "postgresql://postgres:ZA6bw.djAAJ%2FguL@rhzloxuuyqjqrqryahkm.supabase.co:5432/postgres";

async function applyMigrations() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase");

    const sql = fs.readFileSync('drizzle/0000_pink_sinister_six.sql', 'utf8');
    const statements = sql.split('--> statement-breakpoint');

    for (let statement of statements) {
      statement = statement.trim();
      if (statement) {
        console.log("Executing:", statement.substring(0, 50) + "...");
        await client.query(statement);
      }
    }

    console.log("Migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

applyMigrations();
