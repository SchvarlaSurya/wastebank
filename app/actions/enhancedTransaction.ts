"use server";

import { sql } from "@/lib/db";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ─── Interfaces ────────────────────────────────────────────────────

interface WasteCatalogItem {
  id: string;
  name: string;
  category: string;
  price_per_kg: number;
  updated_at: string;
}

interface EnhancedTransactionRow {
  id: number;
  user_id: string;
  tx_id: string;
  waste_type: string;
  waste_type_id: string;
  estimated_weight: number;
  actual_weight: number | null;
  price_per_kg: number;
  base_reward: number | null;
  tier_bonus: number | null;
  total_reward: number | null;
  status: string;
  date: Date;
  created_at: Date;
  notes?: string | null;
  processed_by?: string | null;
  processed_at?: Date | null;
  rejection_reason?: string | null;
}

export interface UserTransaction {
  id: string;
  wasteType: string;
  wasteTypeId: string;
  estimatedWeight: number;
  actualWeight: number | null;
  pricePerKg: number;
  baseReward: number | null;
  tierBonus: number | null;
  totalReward: number | null;
  status: "pending" | "verified" | "rejected";
  date: string;
  createdAt: string;
  notes: string | null;
}

export interface AdminPendingTransaction {
  id: string;
  nasabahId: string;
  nasabahName: string;
  wasteType: string;
  wasteTypeId: string;
  estimatedWeight: number;
  pricePerKg: number;
  totalReward: number;
  status: "pending" | "verified" | "rejected";
  date: string;
  notes: string | null;
}

export interface TransactionDetail {
  id: string;
  userId: string;
  wasteType: string;
  wasteTypeId: string;
  estimatedWeight: number;
  actualWeight: number | null;
  pricePerKg: number;
  baseReward: number | null;
  tierBonus: number | null;
  totalReward: number | null;
  status: "pending" | "verified" | "rejected";
  date: string;
  createdAt: string;
  notes: string | null;
  processedBy: string | null;
  processedAt: string | null;
  rejectionReason: string | null;
}

export interface RewardCalculationResult {
  baseReward: number;
  tierBonus: number;
  totalReward: number;
  pricePerKg: number;
  bonusPercentage: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  cumulativeWeight: number;
}

// ─── 1. getUserTransactions ───────────────────────────────────────
export async function getUserTransactions() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const rows = (await sql`
      SELECT
        id, user_id, tx_id, waste_type, waste_type_id,
        estimated_weight, actual_weight, price_per_kg,
        base_reward, tier_bonus, total_reward,
        status, date, created_at, notes
      FROM transactions
      WHERE user_id = ${user.id}
      ORDER BY date DESC
    `) as EnhancedTransactionRow[];

    const transactions: UserTransaction[] = rows.map((row) => ({
      id: row.tx_id,
      wasteType: row.waste_type,
      wasteTypeId: row.waste_type_id,
      estimatedWeight: Number(row.estimated_weight),
      actualWeight: row.actual_weight !== null ? Number(row.actual_weight) : null,
      pricePerKg: Number(row.price_per_kg),
      baseReward: row.base_reward !== null ? Number(row.base_reward) : null,
      tierBonus: row.tier_bonus !== null ? Number(row.tier_bonus) : null,
      totalReward: row.total_reward !== null ? Number(row.total_reward) : null,
      status: row.status as "pending" | "verified" | "rejected",
      date: row.date.toISOString().split("T")[0],
      createdAt: row.created_at.toISOString(),
      notes: row.notes || null,
    }));

    return { success: true, transactions };
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return { success: false, error: String(error) };
  }
}

// ─── 2. getPendingTransactions ────────────────────────────────────
export async function getPendingTransactions() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const rows = (await sql`
      SELECT
        id, user_id, tx_id, waste_type, waste_type_id,
        estimated_weight, actual_weight, price_per_kg,
        base_reward, tier_bonus, total_reward,
        status, date, created_at, notes
      FROM transactions
      WHERE status = 'pending'
      ORDER BY date ASC
    `) as EnhancedTransactionRow[];

    // Fetch all Clerk users (admin users typically few; pending transactions also limited)
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 100 });
    const userMap = new Map<string, string>();
    clerkUsers.data.forEach((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Unknown";
      userMap.set(u.id, name);
    });

    const transactions: AdminPendingTransaction[] = rows.map((row) => ({
      id: row.tx_id,
      nasabahId: row.user_id,
      nasabahName: userMap.get(row.user_id) || "Unknown",
      wasteType: row.waste_type,
      wasteTypeId: row.waste_type_id,
      estimatedWeight: Number(row.estimated_weight),
      pricePerKg: Number(row.price_per_kg),
      totalReward: row.total_reward !== null ? Number(row.total_reward) : 0,
      status: row.status as "pending" | "verified" | "rejected",
      date: row.date.toISOString().split("T")[0],
      notes: row.notes || null,
    }));

    return { success: true, transactions };
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return { success: false, error: String(error) };
  }
}

// ─── 3. getTransactionById ────────────────────────────────────────
export async function getTransactionById(txId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const rows = (await sql`
      SELECT * FROM transactions WHERE tx_id = ${txId} LIMIT 1
    `) as EnhancedTransactionRow[];

    if (rows.length === 0) {
      return { success: false, error: "Transaction not found" };
    }

    const row = rows[0];

    // Simple authorization: only owner or admin (placeholder admin check)
    // In production, check user role via metadata or separate table
    const isAdmin = false; // TODO: replace with actual admin check
    if (row.user_id !== user.id && !isAdmin) {
      return { success: false, error: "Forbidden" };
    }

    const transaction: TransactionDetail = {
      id: row.tx_id,
      userId: row.user_id,
      wasteType: row.waste_type,
      wasteTypeId: row.waste_type_id,
      estimatedWeight: Number(row.estimated_weight),
      actualWeight: row.actual_weight !== null ? Number(row.actual_weight) : null,
      pricePerKg: Number(row.price_per_kg),
      baseReward: row.base_reward !== null ? Number(row.base_reward) : null,
      tierBonus: row.tier_bonus !== null ? Number(row.tier_bonus) : null,
      totalReward: row.total_reward !== null ? Number(row.total_reward) : null,
      status: row.status as "pending" | "verified" | "rejected",
      date: row.date.toISOString(),
      createdAt: row.created_at.toISOString(),
      notes: row.notes || null,
      processedBy: row.processed_by || null,
      processedAt: row.processed_at?.toISOString() || null,
      rejectionReason: row.rejection_reason || null,
    };

    return { success: true, transaction };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return { success: false, error: String(error) };
  }
}

// ─── 4. createDeposit ─────────────────────────────────────────────
export async function createDeposit(weight: number, wasteType: string, wasteTypeId?: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!weight || weight <= 0) {
    return { success: false, error: "Invalid weight" };
  }

  try {
    // Resolve waste catalog entry
    const catalogRows = wasteTypeId
      ? (await sql`SELECT id, name, price_per_kg FROM waste_catalog WHERE id = ${wasteTypeId} LIMIT 1`) as WasteCatalogItem[]
      : (await sql`SELECT id, name, price_per_kg FROM waste_catalog WHERE name = ${wasteType} LIMIT 1`) as WasteCatalogItem[];

    if (catalogRows.length === 0) {
      return { success: false, error: "Waste type not found in catalog" };
    }

    const catalog = catalogRows[0];
    const pricePerKg = Number(catalog.price_per_kg);
    const baseReward = weight * pricePerKg;
    const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    // Insert pending transaction (tier bonus calculated at verification)
    await sql`
      INSERT INTO transactions (
        user_id, tx_id, waste_type, waste_type_id,
        estimated_weight, actual_weight, price_per_kg,
        base_reward, tier_bonus, total_reward,
        status, date, created_at
      ) VALUES (
        ${user.id}, ${txId}, ${catalog.name}, ${catalog.id},
        ${weight}, NULL, ${pricePerKg},
        ${baseReward}, 0, ${baseReward},
        'pending', ${now}, ${now}
      )
    `;

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/riwayat");
    revalidatePath("/admin/transaksi");

    return { success: true, txId };
  } catch (error) {
    console.error("Error creating deposit:", error);
    return { success: false, error: String(error) };
  }
}

// ─── 5. calculateReward ───────────────────────────────────────────
export async function calculateReward(weight: number, wasteTypeId: string, userId?: string) {
  if (!weight || weight <= 0) {
    return { success: false, error: "Invalid weight" };
  }

  try {
    // Resolve current price
    const priceRows = (await sql`
      SELECT price_per_kg FROM waste_catalog WHERE id = ${wasteTypeId} LIMIT 1
    `) as { price_per_kg: number }[];
    if (priceRows.length === 0) {
      return { success: false, error: "Waste type not found" };
    }
    const pricePerKg = Number(priceRows[0].price_per_kg);
    const baseReward = weight * pricePerKg;

    // Determine user ID
    let uid = userId;
    if (!uid) {
      const user = await currentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }
      uid = user.id;
    }

    // Get cumulative verified weight
    const profileRows = (await sql`
      SELECT kumulatif_sampah_kg FROM user_profiles WHERE user_id = ${uid}
    `) as { kumulatif_sampah_kg: number }[];
    let cumulativeWeight = 0;
    if (profileRows.length > 0 && profileRows[0].kumulatif_sampah_kg !== null) {
      cumulativeWeight = Number(profileRows[0].kumulatif_sampah_kg);
    } else {
      const sumRows = await sql`
        SELECT COALESCE(SUM(actual_weight), 0) as total
        FROM transactions
        WHERE user_id = ${uid} AND status = 'verified'
      `;
      cumulativeWeight = Number((sumRows as { total: number }[])[0]?.total || 0);
    }

    // Determine tier percentage
    let bonusPercentage = 0;
    let tier: "Bronze" | "Silver" | "Gold" | "Platinum" = "Bronze";
    if (cumulativeWeight >= 500) {
      bonusPercentage = 10;
      tier = "Platinum";
    } else if (cumulativeWeight >= 200) {
      bonusPercentage = 5;
      tier = "Gold";
    } else if (cumulativeWeight >= 50) {
      bonusPercentage = 3;
      tier = "Silver";
    }

    const tierBonus = baseReward * (bonusPercentage / 100);
    const totalReward = baseReward + tierBonus;

    return {
      success: true,
      data: {
        baseReward,
        tierBonus,
        totalReward,
        pricePerKg,
        bonusPercentage,
        tier,
        cumulativeWeight,
      } satisfies RewardCalculationResult,
    };
  } catch (error) {
    console.error("Error calculating reward:", error);
    return { success: false, error: String(error) };
  }
}

// ─── 6. getWasteCatalog ───────────────────────────────────────────
export async function getWasteCatalog() {
  try {
    const rows = (await sql`
      SELECT id, name, category, price_per_kg, updated_at
      FROM waste_catalog
      ORDER BY name
    `) as WasteCatalogItem[];

    const catalog = rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      pricePerKg: Number(row.price_per_kg),
      updatedAt: row.updated_at,
    }));

    return { success: true, catalog };
  } catch (error) {
    console.error("Error fetching waste catalog:", error);
    return { success: false, error: String(error) };
  }
}

// ─── 7. getWasteTypePrice ─────────────────────────────────────────
export async function getWasteTypePrice(wasteTypeId: string) {
  try {
    const rows = (await sql`
      SELECT price_per_kg FROM waste_catalog WHERE id = ${wasteTypeId} LIMIT 1
    `) as { price_per_kg: number }[];

    if (rows.length === 0) {
      return { success: false, error: "Waste type not found" };
    }

    return { success: true, pricePerKg: Number(rows[0].price_per_kg) };
  } catch (error) {
    console.error("Error fetching waste type price:", error);
    return { success: false, error: String(error) };
  }
}
