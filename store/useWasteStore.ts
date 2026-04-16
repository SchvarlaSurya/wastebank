import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface WasteStore {
  balance: number; // Saldo kotor belum dipotong pending
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  requestWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'status' | 'date'>) => boolean;
}

export const useWasteStore = create<WasteStore>()(
  persist(
    (set, get) => ({
      balance: 875000, // Initial dummy balance
      transactions: [
        { id: "TX-2401", type: "Plastik Campur", weight: 7, reward: 29400, date: "2026-04-15", status: "Selesai" },
        { id: "TX-2392", type: "Kertas dan Kardus", weight: 11, reward: 30800, date: "2026-04-12", status: "Selesai" },
        { id: "TX-2388", type: "Logam Ringan", weight: 4, reward: 30400, date: "2026-04-09", status: "Selesai" },
        { id: "TX-2380", type: "Minyak Jelantah", weight: 2, reward: 8000, date: "2026-04-02", status: "Selesai" },
      ],
      withdrawals: [], // Riwayat penarikan
      addTransaction: (transaction) => {
        const id = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTx: Transaction = {
          ...transaction,
          id,
          status: 'Selesai', // Mock instant verification
        };
        
        set((state) => ({
          transactions: [newTx, ...state.transactions],
          balance: state.balance + transaction.reward,
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
          
          set((s) => ({
            withdrawals: [newWithdrawal, ...s.withdrawals]
          }));
          return true;
        }
        return false;
      }
    }),
    {
      name: 'waste-bank-storage',
    }
  )
);
