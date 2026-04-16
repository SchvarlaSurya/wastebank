"use server";

import { sql } from "@/lib/db";

/**
 * CAUTION: Run this Server Action only once to initialize the Neon Database Schema.
 * It will create necessary tables for the WasteBank application.
 */
export async function initializeDatabase() {
  try {
    // 1. Create Transactions Table
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

    // 2. Create Withdrawals Table
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

    // 3. Create User Profile Metadata Table (Optional but requested for gamification)
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id VARCHAR(255) PRIMARY KEY,
        tier VARCHAR(50) DEFAULT 'Bronze',
        total_xp INT DEFAULT 0,
        kumulatif_sampah_kg NUMERIC(12, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    return { success: true, message: "Database tables created successfully in Neon Postgres!" };
  } catch (error) {
    console.error("Database initialization failed: ", error);
    return { success: false, error: String(error) };
  }
}
