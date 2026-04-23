const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_1MwCS2mXxvYZ@ep-damp-hill-a1if8enc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function run() {
  try {
    const res = await sql`UPDATE transactions SET status = 'verified' WHERE status = 'Selesai'`;
    console.log('Migration complete: Changed Selesai to verified');
  } catch(e) {
    console.error(e);
  }
}
run();
