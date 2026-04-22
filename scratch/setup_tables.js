const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_1MwCS2mXxvYZ@ep-damp-hill-a1if8enc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function run() {
  try {
    // Create waste_catalog
    await sql`CREATE TABLE IF NOT EXISTS waste_catalog (
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      category TEXT NOT NULL, 
      price_per_kg NUMERIC(10,2) NOT NULL, 
      updated_at TIMESTAMP DEFAULT NOW()
    )`;

    // Populate waste_catalog
    await sql`INSERT INTO waste_catalog (id, name, category, price_per_kg) VALUES 
      ('plastic', 'Plastik Campur', 'anorganik', 4200),
      ('paper', 'Kertas dan Kardus', 'anorganik', 2800),
      ('metal', 'Logam Ringan', 'anorganik', 7600),
      ('organic', 'Sisa Organik Kering', 'organik', 1700),
      ('battery', 'Baterai Rumah Tangga', 'khusus', 9800),
      ('electronics', 'Elektronik Kecil', 'khusus', 13200)
      ON CONFLICT (id) DO NOTHING`;

    // Create admin_activity_logs
    await sql`CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id SERIAL PRIMARY KEY, 
      admin_user_id TEXT NOT NULL, 
      admin_name TEXT NOT NULL, 
      action TEXT NOT NULL, 
      target_type TEXT NOT NULL, 
      target_id TEXT, 
      details TEXT, 
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    console.log('Tables created and populated successfully');
  } catch(e) {
    console.error(e);
  }
}
run();
