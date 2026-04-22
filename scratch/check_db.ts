import { sql } from "./lib/db";

async function check() {
  try {
    const tx = await sql`SELECT id, status, type, waste_type, weight, estimated_weight, date, created_at FROM transactions LIMIT 10`;
    console.log("TRANSACTIONS SAMPLE:", JSON.stringify(tx, null, 2));

    const statusCount = await sql`SELECT status, COUNT(*) FROM transactions GROUP BY status`;
    console.log("STATUS COUNTS:", JSON.stringify(statusCount, null, 2));

    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'`;
    console.log("COLUMNS:", columns.map(c => c.column_name));
  } catch (e) {
    console.error(e);
  }
}

check();
