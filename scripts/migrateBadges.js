const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Creating user_badges table...");
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        badge_id VARCHAR(50) NOT NULL,
        unlocked_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, badge_id)
      );
    `;
    console.log("✓ Table 'user_badges' created/verified.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
