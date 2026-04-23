const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_1MwCS2mXxvYZ@ep-damp-hill-a1if8enc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function clearData() {
  console.log("Starting database cleanup on NSD...");
  try {
    // 1. Delete all activity/history data
    await sql`TRUNCATE TABLE transactions RESTART IDENTITY CASCADE`;
    console.log("- Transactions cleared");

    await sql`TRUNCATE TABLE withdrawals RESTART IDENTITY CASCADE`;
    console.log("- Withdrawals cleared");

    await sql`TRUNCATE TABLE notifications RESTART IDENTITY CASCADE`;
    console.log("- Notifications cleared");

    await sql`TRUNCATE TABLE admin_activity_logs RESTART IDENTITY CASCADE`;
    console.log("- Admin logs cleared");

    // 2. Reset user profiles stats but keep the users
    await sql`UPDATE user_profiles SET 
      kumulatif_sampah_kg = 0, 
      total_xp = 0, 
      tier = 'Bronze',
      updated_at = NOW()`;
    console.log("- User profiles stats reset to 0 (Bronze)");

    // 3. Keep waste_catalog so the app is still functional
    console.log("- Keeping waste_catalog (Master Data) intact.");

    console.log("\nDATABASE RESET SUCCESSFUL! Ready for demo.");
  } catch (error) {
    console.error("FAILED TO RESET DATABASE:", error);
  }
}

clearData();
