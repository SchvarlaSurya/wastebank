import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: string;
  weight: number;
  reward: number;
  date: string;
  status: string;
}

export interface Withdrawal {
  id: string;
  method: string;
  accountName: string;
  accountNumber: string;
  amount: number;
  date: string;
  status: 'Menunggu Verifikasi' | 'Dikirim' | 'Ditolak';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface WasteStore {
  balance: number; // Saldo kotor belum dipotong pending
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: AppNotification[];
  isHydrated: boolean;
  initStore: (balance: number, transactions: Transaction[], withdrawals: Withdrawal[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  requestWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'status' | 'date'>) => boolean;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
  markNotificationsAsRead: () => void;
}

export const useWasteStore = create<WasteStore>()((set, get) => ({
      balance: 0,
      transactions: [],
      withdrawals: [],
      notifications: [],
      isHydrated: false,
      initStore: (balance, transactions, withdrawals) => {
        set({ balance, transactions, withdrawals, isHydrated: true });
      },
      addTransaction: (transaction) => {
        const id = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTx: Transaction = {
          ...transaction,
          id,
          status: 'Selesai', // Mock instant verification
        };
        
        const newNotification: AppNotification = {
          id: `NOTIF-${Date.now()}`,
          title: "Setoran Berhasil!",
          message: `Saldo bertambah Rp ${transaction.reward.toLocaleString('id-ID')} dari ${transaction.weight}kg ${transaction.type}.`,
          date: new Date().toISOString(),
          read: false,
        };
        
        set((state) => ({
          transactions: [newTx, ...state.transactions],
          balance: state.balance + transaction.reward,
          notifications: [newNotification, ...state.notifications],
        }));
      },
      requestWithdrawal: (withdrawalRequest) => {
        const state = get();
        // Hitung total penarikan yang sedang pending atau sudah dikirim
        const totalPendingOrSent = state.withdrawals
          .filter(w => w.status !== 'Ditolak')
          .reduce((acc, w) => acc + w.amount, 0);
        
        // Saldo yang benar-benar bisa ditarik
        const availableBalance = state.balance - totalPendingOrSent;

        if (availableBalance >= withdrawalRequest.amount) {
          const newWithdrawal: Withdrawal = {
            ...withdrawalRequest,
            id: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Menunggu Verifikasi', // saldo tidak langsung berkurang, masih pending
          };
          
          const newNotification: AppNotification = {
            id: `NOTIF-${Date.now()}`,
            title: "Penarikan Diajukan",
            message: `Dana Rp ${withdrawalRequest.amount.toLocaleString('id-ID')} sedang dimintakan ke ${withdrawalRequest.method.replace('_', ' ')}. Menunggu admin.`,
            date: new Date().toISOString(),
            read: false,
          };
          
          set((s) => ({
            withdrawals: [newWithdrawal, ...s.withdrawals],
            notifications: [newNotification, ...s.notifications]
          }));
          return true;
        }
        return false;
      },
      addNotification: (notification) => {
        set((s) => ({
          notifications: [{
            ...notification,
            id: `NOTIF-${Date.now()}`,
            date: new Date().toISOString(),
            read: false,
          }, ...s.notifications]
        }));
      },
      markNotificationsAsRead: () => {
        set((s) => ({
          notifications: s.notifications.map(n => ({ ...n, read: true }))
        }));
      }
  }));

export function useUserTier() {
  const transactions = useWasteStore((state) => state.transactions);
  const totalWeight = transactions.reduce((acc, tx) => acc + tx.weight, 0);

  let tier = "Bronze";
  let bonusPercentage = 0;
  let nextTierWeight = 50;
  let tierColor = "text-amber-700 bg-amber-100 ring-amber-600/20"; // Bronze

  if (totalWeight >= 500) {
    tier = "Platinum";
    bonusPercentage = 10;
    nextTierWeight = -1; // Max tier
    tierColor = "text-sky-700 bg-sky-100 ring-sky-600/20";
  } else if (totalWeight >= 200) {
    tier = "Gold";
    bonusPercentage = 5;
    nextTierWeight = 500;
    tierColor = "text-yellow-800 bg-yellow-100 ring-yellow-600/20";
  } else if (totalWeight >= 50) {
    tier = "Silver";
    bonusPercentage = 3;
    nextTierWeight = 200;
    tierColor = "text-slate-700 bg-slate-200 ring-slate-600/20";
  }

  const progressToNext = nextTierWeight > 0 ? Math.min((totalWeight / nextTierWeight) * 100, 100) : 100;

  return { tier, totalWeight, bonusPercentage, nextTierWeight, progressToNext, tierColor };
}
