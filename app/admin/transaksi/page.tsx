"use client";

import { useState, useMemo, useEffect } from "react";
import { transactionStatusLabel, type TransactionStatus } from "@/lib/types";
import { getAllTransactionsAdmin, getWasteCatalogAdmin } from "@/app/actions/adminDashboard";
import { verifyTransaction, rejectTransaction } from "@/app/actions/adminVerification";

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wasteCatalog, setWasteCatalog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | TransactionStatus>("all");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [actualWeight, setActualWeight] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [mode, setMode] = useState<"verify" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function loadData() {
    try {
      const [txRes, catalogRes] = await Promise.all([
        getAllTransactionsAdmin(),
        getWasteCatalogAdmin()
      ]);
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }
      if (catalogRes.success && catalogRes.data) {
        setWasteCatalog(catalogRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.status === filter);
  }, [transactions, filter]);

  const pendingCount = transactions.filter((tx) => tx.status === "pending").length;

  // Auto-calculate reward from current catalog price
  const currentPrice = useMemo(() => {
    if (!selectedTx) return 0;
    const catalogItem = wasteCatalog.find((w) => w.name === selectedTx.waste_type);
    return catalogItem ? Number(catalogItem.price_per_kg) : Number(selectedTx.price_per_kg);
  }, [selectedTx, wasteCatalog]);

  const autoReward = useMemo(() => {
    const w = Number(actualWeight);
    if (!w || w <= 0) return 0;
    return w * currentPrice;
  }, [actualWeight, currentPrice]);

  const handleVerify = async () => {
    if (!selectedTx || !actualWeight || Number(actualWeight) <= 0) return;
    setIsProcessing(true);
    try {
      await verifyTransaction(selectedTx.tx_id, Number(actualWeight));
      await loadData();
      setSelectedTx(null);
      setActualWeight("");
      setMode(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTx || !rejectReason) return;
    setIsProcessing(true);
    try {
      await rejectTransaction(selectedTx.tx_id, rejectReason);
      await loadData();
      setSelectedTx(null);
      setRejectReason("");
      setMode(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (tx: any) => {
    setSelectedTx(tx);
    setActualWeight(String(tx.estimated_weight));
    setRejectReason("");
    setMode(tx.status === "pending" ? "verify" : null);
  };

  const statusBadge = (status: TransactionStatus | string) => {
    const rawStatus = status as TransactionStatus;
    const styles: Record<TransactionStatus, string> = {
      pending: "bg-amber-100 text-amber-800",
      verified: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[rawStatus] || "bg-stone-100 text-stone-800"}`}>
        {transactionStatusLabel[rawStatus] || status}
      </span>
    );
  };

  const tabs = [
    { key: "all" as const, label: "Semua", count: transactions.length },
    { key: "pending" as const, label: "Pending", count: pendingCount },
    { key: "verified" as const, label: "Terverifikasi", count: transactions.filter((t) => t.status === "verified").length },
    { key: "rejected" as const, label: "Ditolak", count: transactions.filter((t) => t.status === "rejected").length },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Validasi Transaksi</h1>
        <p className="text-sm text-stone-500">Proses setoran masuk: Input berat real, hitung otomatis, dan validasi.</p>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-amber-400" />
          <p className="text-sm font-medium text-amber-800">
            <span className="font-bold">{pendingCount} transaksi</span> menunggu validasi Anda.
          </p>
        </div>
      )}

      {/* Tab Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
              filter === tab.key
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {tab.label}
            <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-bold ${
              filter === tab.key ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                <th className="px-5 py-3 font-medium text-stone-600">ID</th>
                <th className="px-5 py-3 font-medium text-stone-600">Nasabah ID</th>
                <th className="px-5 py-3 font-medium text-stone-600 hidden sm:table-cell">Jenis Sampah</th>
                <th className="px-5 py-3 font-medium text-stone-600 hidden md:table-cell">Estimasi</th>
                <th className="px-5 py-3 font-medium text-stone-600 hidden md:table-cell">Tanggal</th>
                <th className="px-5 py-3 font-medium text-stone-600">Status</th>
                <th className="px-5 py-3 font-medium text-stone-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className={`hover:bg-stone-50/50 transition-colors ${tx.status === "pending" ? "bg-amber-50/30" : ""}`}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-stone-500">{tx.tx_id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-stone-800">{tx.user_id}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-stone-600">{tx.waste_type}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-stone-600">{tx.estimated_weight} kg</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-stone-500">{new Date(tx.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-3.5">{statusBadge(tx.status)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => openModal(tx)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        tx.status === "pending"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {tx.status === "pending" ? "Proses" : "Detail"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-400">Tidak ada transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">
                  {selectedTx.status === "pending" ? "Proses Transaksi" : "Detail Transaksi"}
                </h3>
                <p className="text-sm text-stone-500">{selectedTx.tx_id}</p>
              </div>
              <button onClick={() => { setSelectedTx(null); setMode(null); }} className="rounded-full p-2 text-stone-400 hover:bg-stone-100" disabled={isProcessing}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Transaction Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Nasabah ID</p>
                  <p className="mt-1 text-xs font-medium text-stone-800">{selectedTx.user_id}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Jenis Sampah</p>
                  <p className="mt-1 text-sm font-medium text-stone-800">{selectedTx.waste_type}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Estimasi Berat</p>
                  <p className="mt-1 text-sm font-medium text-stone-800">{selectedTx.estimated_weight} kg</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Harga Master Data</p>
                  <p className="mt-1 text-sm font-medium text-stone-800">Rp {currentPrice.toLocaleString("id-ID")}/kg</p>
                </div>
              </div>

              {selectedTx.notes && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Pesan Nasabah</p>
                  </div>
                  <p className="text-sm text-amber-900 italic">"{selectedTx.notes}"</p>
                </div>
              )}

              {/* Already processed info */}
              {selectedTx.status !== "pending" && (
                <div className={`rounded-xl p-4 ${selectedTx.status === "verified" || selectedTx.status === "Selesai" ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${selectedTx.status === "verified" || selectedTx.status === "Selesai" ? "text-emerald-800" : "text-red-800"}`}>
                      {selectedTx.status === "verified" || selectedTx.status === "Selesai" ? "✓ Terverifikasi" : "✕ Ditolak"}
                    </p>
                  </div>
                  {(selectedTx.status === "verified" || selectedTx.status === "Selesai") && (
                    <div className="mt-2">
                      <p className="text-sm text-emerald-700">Berat aktual: <span className="font-bold">{selectedTx.actual_weight || selectedTx.weight} kg</span></p>
                      <p className="text-lg font-bold text-emerald-800 mt-1">Rp {Number(selectedTx.total_reward || selectedTx.reward).toLocaleString("id-ID")}</p>
                    </div>
                  )}
                  {selectedTx.rejection_reason && (
                    <p className="mt-2 text-sm text-red-700">Alasan: {selectedTx.rejection_reason}</p>
                  )}
                </div>
              )}

              {/* Verification Form */}
              {selectedTx.status === "pending" && mode === "verify" && (
                <div className="space-y-4 border-t border-stone-100 pt-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">Berat Real (Hasil Timbangan)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2.5 pr-12 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="0.0"
                        disabled={isProcessing}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">kg</span>
                    </div>
                  </div>

                  {/* Auto-Calculate Preview */}
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Auto-Calculate</p>
                    <p className="mt-1 text-sm text-emerald-800">{actualWeight || 0} kg × Rp {currentPrice.toLocaleString("id-ID")}</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">Rp {autoReward.toLocaleString("id-ID")}</p>
                    <p className="mt-1 text-[10px] text-emerald-600">Saldo nasabah akan bertambah otomatis</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleVerify}
                      disabled={!actualWeight || Number(actualWeight) <= 0 || isProcessing}
                      className="flex-1 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition"
                    >
                      {isProcessing ? "Memproses..." : "✓ Selesai & Tambah Saldo"}
                    </button>
                    <button
                      onClick={() => setMode("reject")}
                      disabled={isProcessing}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Form */}
              {selectedTx.status === "pending" && mode === "reject" && (
                <div className="space-y-4 border-t border-stone-100 pt-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700">Alasan Penolakan</label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="Jelaskan alasan penolakan..."
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason || isProcessing}
                      className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      {isProcessing ? "Memproses..." : "Konfirmasi Tolak"}
                    </button>
                    <button
                      onClick={() => setMode("verify")}
                      disabled={isProcessing}
                      className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
                    >
                      Kembali
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
