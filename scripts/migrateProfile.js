const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Migrating user_profiles table...");
  
  try {
    await sql`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
    `;
    console.log("✓ Added profile columns to user_profiles.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
