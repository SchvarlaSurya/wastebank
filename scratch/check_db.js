const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_1MwCS2mXxvYZ@ep-damp-hill-a1if8enc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function check() {
  try {
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'`;
    console.log("COLUMNS:", JSON.stringify(columns, null, 2));
    
    const sample = await sql`SELECT * FROM transactions LIMIT 1`;
    console.log("SAMPLE ROW:", JSON.stringify(sample, null, 2));
  } catch (e) {
    console.error("DEBUG ERROR:", e);
  }
}
check();
