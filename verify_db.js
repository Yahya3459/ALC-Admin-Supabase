import pg from 'pg';
import { execSync } from 'child_process';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

async function verify() {
  console.log("🔍 Checking database connection...");
  const client = new pg.Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to the database!");
    
    const res = await client.query('SELECT NOW()');
    console.log("📅 Database Time:", res.rows[0].now);
    
    await client.end();

    console.log("\n🚀 Running migrations (pnpm db:push)...");
    try {
      // We use --force to ensure it pushes the schema since we are in a fresh environment
      execSync('pnpm drizzle-kit push --force', { stdio: 'inherit' });
      console.log("✅ Migrations completed successfully!");
    } catch (migrateError) {
      console.error("❌ Migration failed. See error above.");
    }

  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err.message);
    process.exit(1);
  }
}

verify();
