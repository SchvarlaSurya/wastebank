const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_1MwCS2mXxvYZ@ep-damp-hill-a1if8enc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function run() {
  try {
    // Create notifications table
    await sql`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    // Create tier_configs table
    await sql`CREATE TABLE IF NOT EXISTS tier_configs (
      id SERIAL PRIMARY KEY,
      tier_name TEXT NOT NULL,
      min_weight_kg NUMERIC(10,2) NOT NULL,
      max_weight_kg NUMERIC(10,2),
      bonus_percentage NUMERIC(5,2) NOT NULL,
      is_active BOOLEAN DEFAULT true
    )`;

    // Seed tier_configs
    await sql`INSERT INTO tier_configs (tier_name, min_weight_kg, max_weight_kg, bonus_percentage) VALUES 
      ('Bronze', 0, 50, 0),
      ('Silver', 50, 200, 3),
      ('Gold', 200, 500, 5),
      ('Platinum', 500, NULL, 10)
      ON CONFLICT DO NOTHING`;

    console.log('Missing tables created and seeded successfully');
  } catch(e) {
    console.error(e);
  }
}
run();
