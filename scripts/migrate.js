const { neon } = require('@neondatabase/serverless');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Running migrations...");
  
  try {
    // Add price_per_kg column if it doesn't exist
    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(12, 2);
    `;
    console.log("✓ Column 'price_per_kg' added to 'transactions' table (or already exists).");

    // Add actual_weight column if it doesn't exist (used in schema but might be missing)
    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS actual_weight NUMERIC(10, 2);
    `;
    console.log("✓ Column 'actual_weight' added to 'transactions' table (or already exists).");

    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
  }
}

migrate();
