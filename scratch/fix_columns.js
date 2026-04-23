const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_1MwCS2mXxvYZ@ep-damp-hill-a1if8enc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS rejection_reason TEXT`;
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS actual_weight NUMERIC(10,2)`;
    console.log('Columns added successfully');
  } catch(e) {
    console.error("ERROR ADDING COLUMNS:", e);
  }
}
run();
