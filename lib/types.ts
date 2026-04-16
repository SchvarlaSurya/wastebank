// ─── Shared TypeScript Interfaces for WasteBank Admin ───

export type WasteCategory = "anorganik" | "organik" | "khusus";

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  pricePerKg: number;
  previousPrice?: number;
  updatedAt: string;
}

export type NasabahStatus = "verified" | "pending" | "frozen";

export interface Nasabah {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ktp: string;
  balance: number;
  totalDeposits: number;
  totalWeight: number;
  status: NasabahStatus;
  joinedAt: string;
}

export type TransactionStatus = "pending" | "verified" | "rejected";

export interface AdminTransaction {
  id: string;
  nasabahId: string;
  nasabahName: string;
  wasteType: string;
  estimatedWeight: number;
  actualWeight?: number;
  pricePerKg: number;
  totalReward: number;
  status: TransactionStatus;
  date: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export type ActivityAction =
  | "verify_transaction"
  | "reject_transaction"
  | "verify_account"
  | "freeze_account"
  | "unfreeze_account"
  | "edit_balance"
  | "update_price"
  | "add_category"
  | "delete_category";

export interface ActivityLogEntry {
  id: string;
  adminName: string;
  action: ActivityAction;
  actionLabel: string;
  target: string;
  detail: string;
  timestamp: string;
}

export const categoryLabel: Record<WasteCategory, string> = {
  anorganik: "Anorganik",
  organik: "Organik",
  khusus: "Khusus",
};

export const statusLabel: Record<NasabahStatus, string> = {
  verified: "Terverifikasi",
  pending: "Menunggu Verifikasi",
  frozen: "Dibekukan",
};

export const transactionStatusLabel: Record<TransactionStatus, string> = {
  pending: "Menunggu Validasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

export const actionLabel: Record<ActivityAction, string> = {
  verify_transaction: "Validasi Transaksi",
  reject_transaction: "Tolak Transaksi",
  verify_account: "Verifikasi Akun",
  freeze_account: "Bekukan Akun",
  unfreeze_account: "Aktifkan Akun",
  edit_balance: "Edit Saldo",
  update_price: "Update Harga",
  add_category: "Tambah Kategori",
  delete_category: "Hapus Kategori",
};
