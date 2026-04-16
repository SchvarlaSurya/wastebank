import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WasteItem,
  Nasabah,
  AdminTransaction,
  ActivityLogEntry,
  ActivityAction,
  TransactionStatus,
  NasabahStatus,
  actionLabel as actionLabelMap,
} from "@/lib/types";

// ─── Initial Mock Data ───────────────────────────────────────

const initialWasteCatalog: WasteItem[] = [
  { id: "plastic", name: "Plastik Campur", category: "anorganik", pricePerKg: 4200, updatedAt: "2026-04-10" },
  { id: "paper", name: "Kertas dan Kardus", category: "anorganik", pricePerKg: 2800, updatedAt: "2026-04-10" },
  { id: "metal", name: "Logam Ringan", category: "anorganik", pricePerKg: 7600, updatedAt: "2026-04-08" },
  { id: "organic", name: "Sisa Organik Kering", category: "organik", pricePerKg: 1700, updatedAt: "2026-04-05" },
  { id: "battery", name: "Baterai Rumah Tangga", category: "khusus", pricePerKg: 9800, updatedAt: "2026-04-01" },
  { id: "electronics", name: "Elektronik Kecil", category: "khusus", pricePerKg: 13200, updatedAt: "2026-03-28" },
  { id: "glass", name: "Botol Kaca", category: "anorganik", pricePerKg: 3500, updatedAt: "2026-04-12" },
  { id: "oil", name: "Minyak Jelantah", category: "organik", pricePerKg: 4000, updatedAt: "2026-04-06" },
];

const initialNasabah: Nasabah[] = [
  { id: "N001", name: "Budi Santoso", email: "budi@email.com", phone: "081234567890", address: "Jl. Merdeka No.12 RT 03/RW 05, Kel. Sukamaju", ktp: "3201XXXX0001", balance: 875000, totalDeposits: 36, totalWeight: 156, status: "verified", joinedAt: "2025-11-15" },
  { id: "N002", name: "Siti Nurhaliza", email: "siti@email.com", phone: "081298765432", address: "Jl. Kenanga Blok A3 No.7, Perum Asri", ktp: "3201XXXX0002", balance: 420000, totalDeposits: 18, totalWeight: 72, status: "verified", joinedAt: "2026-01-03" },
  { id: "N003", name: "Ahmad Rizki", email: "ahmad@email.com", phone: "085611223344", address: "Jl. Pahlawan No.45, Kel. Cikutra", ktp: "3201XXXX0003", balance: 1250000, totalDeposits: 52, totalWeight: 230, status: "verified", joinedAt: "2025-09-20" },
  { id: "N004", name: "Dewi Lestari", email: "dewi@email.com", phone: "087755667788", address: "Jl. Anggrek Raya No.3 RT 01/RW 02", ktp: "3201XXXX0004", balance: 65000, totalDeposits: 5, totalWeight: 22, status: "pending", joinedAt: "2026-04-10" },
  { id: "N005", name: "Rudi Hermawan", email: "rudi@email.com", phone: "081377889900", address: "Perum Bukit Indah Blok D5 No.18", ktp: "3201XXXX0005", balance: 0, totalDeposits: 0, totalWeight: 0, status: "pending", joinedAt: "2026-04-14" },
  { id: "N006", name: "Rina Agustin", email: "rina@email.com", phone: "089912345678", address: "Jl. Dahlia No.21, Kel. Cimanggis", ktp: "3201XXXX0006", balance: 310000, totalDeposits: 14, totalWeight: 58, status: "frozen", joinedAt: "2025-12-01" },
  { id: "N007", name: "Andi Prasetyo", email: "andi@email.com", phone: "081500112233", address: "Jl. Flamboyan No.9 RT 05/RW 08", ktp: "3201XXXX0007", balance: 550000, totalDeposits: 28, totalWeight: 112, status: "verified", joinedAt: "2025-10-10" },
  { id: "N008", name: "Maya Puspita", email: "maya@email.com", phone: "085244556677", address: "Gang Mangga No.3, Kel. Margahayu", ktp: "3201XXXX0008", balance: 190000, totalDeposits: 9, totalWeight: 38, status: "verified", joinedAt: "2026-02-14" },
];

const initialTransactions: AdminTransaction[] = [
  { id: "TX-2401", nasabahId: "N001", nasabahName: "Budi Santoso", wasteType: "Plastik Campur", estimatedWeight: 7, actualWeight: 7, pricePerKg: 4200, totalReward: 29400, status: "verified", date: "2026-04-15", processedBy: "Admin Schvarla", processedAt: "2026-04-15" },
  { id: "TX-2392", nasabahId: "N001", nasabahName: "Budi Santoso", wasteType: "Kertas dan Kardus", estimatedWeight: 12, actualWeight: 11, pricePerKg: 2800, totalReward: 30800, status: "verified", date: "2026-04-12", processedBy: "Admin Schvarla", processedAt: "2026-04-12" },
  { id: "TX-2388", nasabahId: "N001", nasabahName: "Budi Santoso", wasteType: "Logam Ringan", estimatedWeight: 4, actualWeight: 4, pricePerKg: 7600, totalReward: 30400, status: "verified", date: "2026-04-09", processedBy: "Admin Caraka", processedAt: "2026-04-09" },
  { id: "TX-2410", nasabahId: "N002", nasabahName: "Siti Nurhaliza", wasteType: "Botol Kaca", estimatedWeight: 8, pricePerKg: 3500, totalReward: 0, status: "pending", date: "2026-04-16", notes: "Akan antar ke drop point Sabtu pagi" },
  { id: "TX-2411", nasabahId: "N003", nasabahName: "Ahmad Rizki", wasteType: "Elektronik Kecil", estimatedWeight: 3, pricePerKg: 13200, totalReward: 0, status: "pending", date: "2026-04-16", notes: "HP bekas + charger rusak" },
  { id: "TX-2412", nasabahId: "N004", nasabahName: "Dewi Lestari", wasteType: "Plastik Campur", estimatedWeight: 5, pricePerKg: 4200, totalReward: 0, status: "pending", date: "2026-04-15" },
  { id: "TX-2395", nasabahId: "N007", nasabahName: "Andi Prasetyo", wasteType: "Kertas dan Kardus", estimatedWeight: 15, actualWeight: 14, pricePerKg: 2800, totalReward: 39200, status: "verified", date: "2026-04-13", processedBy: "Admin Caraka", processedAt: "2026-04-13" },
  { id: "TX-2390", nasabahId: "N002", nasabahName: "Siti Nurhaliza", wasteType: "Minyak Jelantah", estimatedWeight: 3, actualWeight: 2.5, pricePerKg: 4000, totalReward: 10000, status: "verified", date: "2026-04-11", processedBy: "Admin Schvarla", processedAt: "2026-04-11" },
  { id: "TX-2385", nasabahId: "N008", nasabahName: "Maya Puspita", wasteType: "Plastik Campur", estimatedWeight: 6, pricePerKg: 4200, totalReward: 0, status: "rejected", date: "2026-04-08", processedBy: "Admin Schvarla", processedAt: "2026-04-08", rejectionReason: "Plastik terkontaminasi bahan kimia berbahaya" },
];

const initialActivityLog: ActivityLogEntry[] = [
  { id: "LOG-001", adminName: "Admin Schvarla", action: "verify_transaction", actionLabel: "Validasi Transaksi", target: "TX-2401 (Budi Santoso)", detail: "Plastik Campur 7kg → Rp 29.400", timestamp: "2026-04-15T10:30:00" },
  { id: "LOG-002", adminName: "Admin Schvarla", action: "verify_transaction", actionLabel: "Validasi Transaksi", target: "TX-2392 (Budi Santoso)", detail: "Kertas dan Kardus 11kg → Rp 30.800", timestamp: "2026-04-12T14:15:00" },
  { id: "LOG-003", adminName: "Admin Caraka", action: "verify_transaction", actionLabel: "Validasi Transaksi", target: "TX-2388 (Budi Santoso)", detail: "Logam Ringan 4kg → Rp 30.400", timestamp: "2026-04-09T09:00:00" },
  { id: "LOG-004", adminName: "Admin Schvarla", action: "reject_transaction", actionLabel: "Tolak Transaksi", target: "TX-2385 (Maya Puspita)", detail: "Plastik terkontaminasi bahan kimia berbahaya", timestamp: "2026-04-08T11:45:00" },
  { id: "LOG-005", adminName: "Admin Schvarla", action: "update_price", actionLabel: "Update Harga", target: "Plastik Campur", detail: "Rp 3.800 → Rp 4.200 per kg", timestamp: "2026-04-10T08:00:00" },
  { id: "LOG-006", adminName: "Admin Caraka", action: "verify_account", actionLabel: "Verifikasi Akun", target: "N008 (Maya Puspita)", detail: "KTP terverifikasi, akun diaktifkan", timestamp: "2026-02-14T16:20:00" },
  { id: "LOG-007", adminName: "Admin Schvarla", action: "freeze_account", actionLabel: "Bekukan Akun", target: "N006 (Rina Agustin)", detail: "Diduga penyalahgunaan saldo — menunggu investigasi", timestamp: "2026-03-15T13:00:00" },
  { id: "LOG-008", adminName: "Admin Caraka", action: "verify_transaction", actionLabel: "Validasi Transaksi", target: "TX-2395 (Andi Prasetyo)", detail: "Kertas dan Kardus 14kg → Rp 39.200", timestamp: "2026-04-13T10:00:00" },
  { id: "LOG-009", adminName: "Admin Schvarla", action: "verify_transaction", actionLabel: "Validasi Transaksi", target: "TX-2390 (Siti Nurhaliza)", detail: "Minyak Jelantah 2.5kg → Rp 10.000", timestamp: "2026-04-11T15:30:00" },
  { id: "LOG-010", adminName: "Admin Caraka", action: "add_category", actionLabel: "Tambah Kategori", target: "Botol Kaca", detail: "Kategori Anorganik — Rp 3.500/kg", timestamp: "2026-04-12T08:30:00" },
];

// ─── Store Interface ─────────────────────────────────────────

interface AdminStore {
  wasteCatalog: WasteItem[];
  nasabahList: Nasabah[];
  transactions: AdminTransaction[];
  activityLog: ActivityLogEntry[];

  // Waste catalog actions
  updatePrice: (wasteId: string, newPrice: number, adminName: string) => void;
  addWasteCategory: (item: Omit<WasteItem, "updatedAt">, adminName: string) => void;

  // Nasabah actions
  verifyNasabah: (nasabahId: string, adminName: string) => void;
  freezeNasabah: (nasabahId: string, adminName: string) => void;
  unfreezeNasabah: (nasabahId: string, adminName: string) => void;
  editBalance: (nasabahId: string, newBalance: number, reason: string, adminName: string) => void;

  // Transaction actions
  verifyTransaction: (txId: string, actualWeight: number, adminName: string) => void;
  rejectTransaction: (txId: string, reason: string, adminName: string) => void;

  // Helpers
  getTotalBalance: () => number;
  getTodayWeight: () => number;
  getPendingCount: () => number;
  getActiveNasabahCount: () => number;
}

// ─── Utility ─────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nowISO() {
  return new Date().toISOString();
}

function logId() {
  return `LOG-${String(Date.now()).slice(-6)}`;
}

// ─── Store ───────────────────────────────────────────────────

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      wasteCatalog: initialWasteCatalog,
      nasabahList: initialNasabah,
      transactions: initialTransactions,
      activityLog: initialActivityLog,

      // ── Waste Catalog ────────────────────────────────────

      updatePrice: (wasteId, newPrice, adminName) => {
        set((s) => {
          const catalog = s.wasteCatalog.map((item) =>
            item.id === wasteId
              ? { ...item, previousPrice: item.pricePerKg, pricePerKg: newPrice, updatedAt: todayStr() }
              : item
          );
          const target = s.wasteCatalog.find((i) => i.id === wasteId);
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "update_price",
            actionLabel: "Update Harga",
            target: target?.name || wasteId,
            detail: `Rp ${target?.pricePerKg.toLocaleString("id-ID")} → Rp ${newPrice.toLocaleString("id-ID")} per kg`,
            timestamp: nowISO(),
          };
          return { wasteCatalog: catalog, activityLog: [newLog, ...s.activityLog] };
        });
      },

      addWasteCategory: (item, adminName) => {
        set((s) => {
          const newItem: WasteItem = { ...item, updatedAt: todayStr() };
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "add_category",
            actionLabel: "Tambah Kategori",
            target: item.name,
            detail: `Kategori ${item.category} — Rp ${item.pricePerKg.toLocaleString("id-ID")}/kg`,
            timestamp: nowISO(),
          };
          return { wasteCatalog: [...s.wasteCatalog, newItem], activityLog: [newLog, ...s.activityLog] };
        });
      },

      // ── Nasabah Management ───────────────────────────────

      verifyNasabah: (nasabahId, adminName) => {
        set((s) => {
          const list = s.nasabahList.map((n) =>
            n.id === nasabahId ? { ...n, status: "verified" as NasabahStatus } : n
          );
          const target = s.nasabahList.find((n) => n.id === nasabahId);
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "verify_account",
            actionLabel: "Verifikasi Akun",
            target: `${nasabahId} (${target?.name})`,
            detail: "KTP terverifikasi, akun diaktifkan",
            timestamp: nowISO(),
          };
          return { nasabahList: list, activityLog: [newLog, ...s.activityLog] };
        });
      },

      freezeNasabah: (nasabahId, adminName) => {
        set((s) => {
          const list = s.nasabahList.map((n) =>
            n.id === nasabahId ? { ...n, status: "frozen" as NasabahStatus } : n
          );
          const target = s.nasabahList.find((n) => n.id === nasabahId);
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "freeze_account",
            actionLabel: "Bekukan Akun",
            target: `${nasabahId} (${target?.name})`,
            detail: "Akun dibekukan oleh admin",
            timestamp: nowISO(),
          };
          return { nasabahList: list, activityLog: [newLog, ...s.activityLog] };
        });
      },

      unfreezeNasabah: (nasabahId, adminName) => {
        set((s) => {
          const list = s.nasabahList.map((n) =>
            n.id === nasabahId ? { ...n, status: "verified" as NasabahStatus } : n
          );
          const target = s.nasabahList.find((n) => n.id === nasabahId);
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "unfreeze_account",
            actionLabel: "Aktifkan Akun",
            target: `${nasabahId} (${target?.name})`,
            detail: "Akun diaktifkan kembali oleh admin",
            timestamp: nowISO(),
          };
          return { nasabahList: list, activityLog: [newLog, ...s.activityLog] };
        });
      },

      editBalance: (nasabahId, newBalance, reason, adminName) => {
        set((s) => {
          const target = s.nasabahList.find((n) => n.id === nasabahId);
          const list = s.nasabahList.map((n) =>
            n.id === nasabahId ? { ...n, balance: newBalance } : n
          );
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "edit_balance",
            actionLabel: "Edit Saldo",
            target: `${nasabahId} (${target?.name})`,
            detail: `Rp ${target?.balance.toLocaleString("id-ID")} → Rp ${newBalance.toLocaleString("id-ID")} | Alasan: ${reason}`,
            timestamp: nowISO(),
          };
          return { nasabahList: list, activityLog: [newLog, ...s.activityLog] };
        });
      },

      // ── Transaction Validation ───────────────────────────

      verifyTransaction: (txId, actualWeight, adminName) => {
        set((s) => {
          let rewardAmount = 0;
          const txList = s.transactions.map((tx) => {
            if (tx.id === txId) {
              rewardAmount = actualWeight * tx.pricePerKg;
              return {
                ...tx,
                actualWeight,
                totalReward: rewardAmount,
                status: "verified" as TransactionStatus,
                processedBy: adminName,
                processedAt: nowISO(),
              };
            }
            return tx;
          });

          const target = s.transactions.find((tx) => tx.id === txId);
          // Update nasabah balance + stats
          const nasabahList = s.nasabahList.map((n) =>
            n.id === target?.nasabahId
              ? {
                  ...n,
                  balance: n.balance + rewardAmount,
                  totalDeposits: n.totalDeposits + 1,
                  totalWeight: n.totalWeight + actualWeight,
                }
              : n
          );

          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "verify_transaction",
            actionLabel: "Validasi Transaksi",
            target: `${txId} (${target?.nasabahName})`,
            detail: `${target?.wasteType} ${actualWeight}kg → Rp ${rewardAmount.toLocaleString("id-ID")}`,
            timestamp: nowISO(),
          };

          return { transactions: txList, nasabahList, activityLog: [newLog, ...s.activityLog] };
        });
      },

      rejectTransaction: (txId, reason, adminName) => {
        set((s) => {
          const txList = s.transactions.map((tx) =>
            tx.id === txId
              ? {
                  ...tx,
                  status: "rejected" as TransactionStatus,
                  processedBy: adminName,
                  processedAt: nowISO(),
                  rejectionReason: reason,
                }
              : tx
          );
          const target = s.transactions.find((tx) => tx.id === txId);
          const newLog: ActivityLogEntry = {
            id: logId(),
            adminName,
            action: "reject_transaction",
            actionLabel: "Tolak Transaksi",
            target: `${txId} (${target?.nasabahName})`,
            detail: reason,
            timestamp: nowISO(),
          };
          return { transactions: txList, activityLog: [newLog, ...s.activityLog] };
        });
      },

      // ── Helpers ──────────────────────────────────────────

      getTotalBalance: () => get().nasabahList.reduce((sum, n) => sum + n.balance, 0),

      getTodayWeight: () => {
        const today = todayStr();
        return get()
          .transactions.filter((tx) => tx.date === today && tx.status === "verified")
          .reduce((sum, tx) => sum + (tx.actualWeight || 0), 0);
      },

      getPendingCount: () => get().transactions.filter((tx) => tx.status === "pending").length,

      getActiveNasabahCount: () => get().nasabahList.filter((n) => n.status === "verified").length,
    }),
    { name: "waste-bank-admin-storage" }
  )
);
