const { neon } = require('@neondatabase/serverless');

async function init() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Creating tables...");
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        tx_id VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(100) NOT NULL,
        weight NUMERIC(10, 2) NOT NULL,
        reward NUMERIC(12, 2) NOT NULL,
        date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Selesai',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'transactions' created/verified.");

    await sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        wd_id VARCHAR(50) UNIQUE NOT NULL,
        method VARCHAR(50) NOT NULL,
        account_name VARCHAR(150) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Menunggu Verifikasi',
        date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'withdrawals' created/verified.");

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(255) PRIMARY KEY,
        tier VARCHAR(50) DEFAULT 'Bronze',
        total_xp INT DEFAULT 0,
        kumulatif_sampah_kg NUMERIC(12, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'user_profiles' created/verified.");
    
    console.log("All tables set up successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

init();
