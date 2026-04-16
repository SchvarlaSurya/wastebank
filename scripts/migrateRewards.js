const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Creating claimed_rewards table...");
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS claimed_rewards (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        reward_id VARCHAR(50) NOT NULL,
        claimed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, reward_id)
      );
    `;
    console.log("✓ Table 'claimed_rewards' created/verified.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
