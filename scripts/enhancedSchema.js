const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Starting enhanced schema migration...");

  try {
    console.log("\n[1/11] Creating transactions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        tx_id VARCHAR(50) UNIQUE NOT NULL,
        waste_type VARCHAR(100) NOT NULL,
        waste_type_id VARCHAR(50),
        estimated_weight NUMERIC(10, 2) NOT NULL,
        actual_weight NUMERIC(10, 2),
        price_per_kg NUMERIC(12, 2) NOT NULL,
        base_reward NUMERIC(12, 2),
        tier_bonus NUMERIC(12, 2),
        total_reward NUMERIC(12, 2),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        date TIMESTAMP NOT NULL,
        processed_by VARCHAR(255),
        processed_at TIMESTAMP,
        rejection_reason TEXT,
        notes TEXT,
        qr_scanned BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'transactions' created/verified.");

    console.log("\n[2/11] Creating withdrawals table...");
    await sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        wd_id VARCHAR(50) UNIQUE NOT NULL,
        method VARCHAR(50) NOT NULL,
        account_name VARCHAR(150) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        bank_name VARCHAR(100),
        amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        locked_amount NUMERIC(12, 2) DEFAULT 0,
        rejection_reason TEXT,
        processed_by VARCHAR(255),
        processed_at TIMESTAMP,
        date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'withdrawals' created/verified.");

    console.log("\n[3/11] Creating user_profiles table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(150),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        ktp VARCHAR(50),
        tier VARCHAR(50) DEFAULT 'Bronze',
        total_xp INT DEFAULT 0,
        kumulatif_sampah_kg NUMERIC(12, 2) DEFAULT 0,
        total_deposits INT DEFAULT 0,
        total_withdrawals INT DEFAULT 0,
        available_balance NUMERIC(12, 2) DEFAULT 0,
        locked_balance NUMERIC(12, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        joined_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'user_profiles' created/verified.");

    console.log("\n[4/11] Creating waste_catalog table...");
    await sql`
      CREATE TABLE IF NOT EXISTS waste_catalog (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price_per_kg NUMERIC(12, 2) NOT NULL,
        previous_price NUMERIC(12, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'waste_catalog' created/verified.");

    console.log("\n[5/11] Creating tier_configs table...");
    await sql`
      CREATE TABLE IF NOT EXISTS tier_configs (
        id SERIAL PRIMARY KEY,
        tier_name VARCHAR(50) UNIQUE NOT NULL,
        min_weight_kg NUMERIC(12, 2) NOT NULL,
        max_weight_kg NUMERIC(12, 2),
        bonus_percentage NUMERIC(5, 2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'tier_configs' created/verified.");

    console.log("\n[6/11] Creating notifications table...");
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT false,
        related_tx_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'notifications' created/verified.");

    console.log("\n[7/11] Creating admin_activity_logs table...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id SERIAL PRIMARY KEY,
        admin_user_id VARCHAR(255) NOT NULL,
        admin_name VARCHAR(150),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id VARCHAR(50),
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✓ Table 'admin_activity_logs' created/verified.");

    console.log("\n[8/11] Creating indexes on transactions...");
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`;
    console.log("✓ Indexes created for 'transactions'.");

    console.log("\n[9/11] Creating indexes on withdrawals...");
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON withdrawals(date);`;
    console.log("✓ Indexes created for 'withdrawals'.");

    console.log("\n[10/11] Creating indexes on notifications...");
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);`;
    console.log("✓ Indexes created for 'notifications'.");

    console.log("\n[11/11] Creating indexes on admin_activity_logs...");
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);`;
    console.log("✓ Indexes created for 'admin_activity_logs'.");

    console.log("\n--- Seeding default tier configs ---");
    await sql`
      INSERT INTO tier_configs (tier_name, min_weight_kg, max_weight_kg, bonus_percentage, description, is_active)
      VALUES 
        ('Bronze', 0, 49, 0, 'Bronze tier: 0-49kg, 0% bonus', true),
        ('Silver', 50, 199, 3, 'Silver tier: 50-199kg, 3% bonus', true),
        ('Gold', 200, 499, 5, 'Gold tier: 200-499kg, 5% bonus', true),
        ('Platinum', 500, NULL, 10, 'Platinum tier: 500+kg, 10% bonus', true)
      ON CONFLICT (tier_name) DO NOTHING
    `;
    console.log("✓ Default tier configs seeded.");

    console.log("\n--- Seeding default waste catalog ---");
    await sql`
      INSERT INTO waste_catalog (id, name, category, price_per_kg, is_active)
      VALUES 
        ('plastic', 'Plastik Campur', 'anorganik', 4200, true),
        ('paper', 'Kertas dan Kardus', 'anorganik', 2800, true),
        ('metal', 'Logam Ringan', 'anorganik', 7600, true),
        ('organic', 'Sisa Organik Kering', 'organik', 1700, true),
        ('battery', 'Baterai Rumah Tangga', 'khusus', 9800, true),
        ('electronics', 'Elektronik Kecil', 'khusus', 13200, true),
        ('glass', 'Botol Kaca', 'anorganik', 3500, true),
        ('oil', 'Minyak Jelantah', 'organik', 4000, true)
      ON CONFLICT (id) DO NOTHING
    `;
    console.log("✓ Default waste catalog seeded.");

    console.log("\n========================================");
    console.log("Enhanced schema migration completed!");
    console.log("========================================");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

module.exports = migrate;

if (require.main === module) {
  migrate();
}
