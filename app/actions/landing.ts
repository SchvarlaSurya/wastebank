"use server";

import { sql } from "@/lib/db";

export interface LandingStats {
  totalPickups: number;
  totalTonnageBulanIni: number;
  topWastes: { type: string; total_weight: number }[];
}

export async function getLandingStats(): Promise<LandingStats> {
  try {
    // 1. Total Pickup Selesai (semua waktu)
    const pickupRes = await sql`
      SELECT COUNT(id) as total
      FROM transactions
      WHERE status = 'Selesai'
    `;
    const totalPickups = pickupRes.length > 0 ? Number(pickupRes[0].total) : 0;

    // 2. Total Terseleksi / bulan ini
    const tonnageRes = await sql`
      SELECT SUM(weight) as total_weight
      FROM transactions
      WHERE status = 'Selesai' 
        AND date >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const weightInKg = tonnageRes.length > 0 && tonnageRes[0].total_weight ? Number(tonnageRes[0].total_weight) : 0;
    const totalTonnageBulanIni = weightInKg / 1000; // Konversi ke ton

    // 3. Sampah paling sering disetor (Top 5)
    const topWastesRes = await sql`
      SELECT type, SUM(weight) as total_weight
      FROM transactions
      WHERE status = 'Selesai'
      GROUP BY type
      ORDER BY total_weight DESC
      LIMIT 5
    `;

    return {
      totalPickups,
      totalTonnageBulanIni,
      topWastes: topWastesRes.map(row => ({
        type: row.type,
        total_weight: Number(row.total_weight)
      }))
    };
  } catch (error) {
    console.error("Gagal mengambil data landing:", error);
    return {
      totalPickups: 0,
      totalTonnageBulanIni: 0,
      topWastes: []
    };
  }
}
