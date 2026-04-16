"use server";

import { sql } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserDashboardData() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const userId = user.id;

  try {
    // 1. Fetch Transactions
    const transactions = await sql`
      SELECT id, tx_id as "idStr", type, weight, reward, date, status
      FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // 2. Fetch Withdrawals
    const withdrawals = await sql`
      SELECT id, wd_id as "idStr", method, account_name as "accountName", account_number as "accountNumber", amount, date, status
      FROM withdrawals
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Calculate total balance from DB source of truth
    const totalEarnings = transactions.reduce((sum, tx) => sum + Number(tx.reward), 0);
    const totalWithdrawnAndPending = withdrawals
      .filter((w) => w.status !== "Ditolak")
      .reduce((sum, w) => sum + Number(w.amount), 0);
    
    // We provide initial balance of 875000 from the persistent mock if no physical DB tx, 
    // but in a pure production environment, you just use the true calculated earnings.
    // Given instructions to migrate cleanly without causing the dashboard balance to suddenly reset completely, 
    // we'll just return the exact sum of DB entries, which starts at 0 for real users until they deposit.
    const realBalance = totalEarnings - totalWithdrawnAndPending;

    return {
      success: true,
      balance: realBalance,
      transactions: transactions.map(tx => ({
        id: tx.idStr,
        type: tx.type,
        weight: Number(tx.weight),
        reward: Number(tx.reward),
        date: new Date(tx.date).toISOString().split('T')[0],
        status: tx.status
      })),
      withdrawals: withdrawals.map(w => ({
        id: w.idStr,
        method: w.method,
        accountName: w.accountName,
        accountNumber: w.accountNumber,
        amount: Number(w.amount),
        date: new Date(w.date).toISOString().split('T')[0],
        status: w.status
      }))
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: String(error) };
  }
}

export async function submitDeposit(weight: number, type: string, reward: number, dateStr?: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = dateStr ? new Date(dateStr) : new Date();

  try {
    await sql`
      INSERT INTO transactions (user_id, tx_id, type, weight, reward, date, status)
      VALUES (${user.id}, ${txId}, ${type}, ${weight}, ${reward}, ${date}, 'Selesai')
    `;

    // Optionally update user_profile summary
    await sql`
      INSERT INTO user_profiles (user_id, total_xp, kumulatif_sampah_kg)
      VALUES (${user.id}, ${weight * 50}, ${weight})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_xp = user_profiles.total_xp + ${weight * 50},
        kumulatif_sampah_kg = user_profiles.kumulatif_sampah_kg + ${weight},
        updated_at = NOW()
    `;

    revalidatePath("/dashboard");
    return { success: true, txId };
  } catch (error) {
    console.error("Error submitting deposit:", error);
    return { success: false, error: String(error) };
  }
}

export async function submitWithdrawal(method: string, accountName: string, accountNumber: string, amount: number) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const wdId = `WD-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = new Date();

  try {
    await sql`
      INSERT INTO withdrawals (user_id, wd_id, method, account_name, account_number, amount, date, status)
      VALUES (${user.id}, ${wdId}, ${method}, ${accountName}, ${accountNumber}, ${amount}, ${date}, 'Menunggu Verifikasi')
    `;

    revalidatePath("/dashboard");
    return { success: true, wdId };
  } catch (error) {
    console.error("Error submitting withdrawal:", error);
    return { success: false, error: String(error) };
  }
}

export async function getGlobalWasteStats() {
  try {
    // 1. Distribusi Jenis Sampah (All users)
    const distributionRaw = await sql`
      SELECT type as name, SUM(weight) as value 
      FROM transactions 
      GROUP BY type 
      ORDER BY value DESC
    `;

    // 2. Tren Seminggu Terakhir (All users)
    const weeklyRaw = await sql`
      SELECT DATE(date) as dt, SUM(weight) as total 
      FROM transactions 
      WHERE date >= NOW() - INTERVAL '6 days' 
      GROUP BY DATE(date)
      ORDER BY dt ASC
    `;

    // Map distribution to numbers since NUMERIC comes out as string in postgres node drivers
    const distribution = distributionRaw.map(row => ({
      name: row.name,
      value: Number(row.value)
    }));

    // Map weekly mapping to ensure consistent formatting for Bar Chart
    const weeklyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, "0");
      const dStr = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      weeklyMap[dateStr] = 0;
    }

    weeklyRaw.forEach(row => {
      // row.dt might be Date object, convert to string YYYY-MM-DD
      const dateStr = new Date(row.dt).toISOString().split('T')[0];
      if (weeklyMap[dateStr] !== undefined) {
        weeklyMap[dateStr] += Number(row.total);
      }
    });

    const weeklyTrend = Object.keys(weeklyMap).map(date => {
      const parts = date.split("-");
      return {
        date: `${parts[2]}/${parts[1]}`, // DD/MM format
        weight: weeklyMap[date]
      };
    });

    return {
      success: true,
      distributionData: distribution,
      weeklyData: weeklyTrend
    };
  } catch (error) {
    console.error("Error fetching global stats:", error);
    return { success: false, error: String(error) };
  }
}
