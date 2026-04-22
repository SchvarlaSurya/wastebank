"use client";

import { useState, useMemo, useEffect } from "react";
import { getAllTransactionsAdmin } from "@/app/actions/adminDashboard";

export default function LaporanPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getAllTransactionsAdmin();
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Error loading transactions for report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Date range calculation
  const dateFilter = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    switch (dateRange) {
      case "today":
        return { from: today, to: today };
      case "week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { from: weekAgo.toISOString().split("T")[0], to: today };
      }
      case "month": {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { from: monthAgo.toISOString().split("T")[0], to: today };
      }
      case "custom":
        return { from: customFrom || "2020-01-01", to: customTo || today };
    }
  }, [dateRange, customFrom, customTo]);

  // Filtered verified transactions
  const filteredTx = useMemo(() => {
    return transactions.filter(
      (tx) => {
        const txDate = new Date(tx.created_at).toISOString().split("T")[0];
        return (tx.status === "verified" || tx.status === "Selesai") &&
        txDate >= dateFilter.from &&
        txDate <= dateFilter.to;
      }
    );
  }, [transactions, dateFilter]);

  // Summary stats
  const totalTransaksi = filteredTx.length;
  const totalBerat = filteredTx.reduce((sum, tx) => sum + Number(tx.actual_weight || 0), 0);
  const totalNilai = filteredTx.reduce((sum, tx) => sum + Number(tx.total_reward || 0), 0);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; weight: number; value: number }> = {};
    filteredTx.forEach((tx) => {
      if (!map[tx.waste_type]) map[tx.waste_type] = { count: 0, weight: 0, value: 0 };
      map[tx.waste_type].count++;
      map[tx.waste_type].weight += Number(tx.actual_weight || 0);
      map[tx.waste_type].value += Number(tx.total_reward || 0);
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTx]);

  // Export CSV
  const exportCSV = () => {
    const headers = ["ID,Nasabah,Jenis Sampah,Berat (kg),Harga/kg,Total (Rp),Tanggal"];
    const rows = filteredTx.map(
      (tx) =>
        `${tx.tx_id},${tx.user_id},${tx.waste_type},${tx.actual_weight},${tx.price_per_kg},${tx.total_reward},${new Date(tx.created_at).toLocaleDateString()}`
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-wastebank-${dateFilter.from}-${dateFilter.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF via browser print
  const exportPDF = () => {
    window.print();
  };

  const rangeButtons = [
    { key: "today" as const, label: "Hari Ini" },
    { key: "week" as const, label: "7 Hari" },
    { key: "month" as const, label: "30 Hari" },
    { key: "custom" as const, label: "Custom" },
  ];

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Laporan & Ekspor Data</h1>
          <p className="text-sm text-stone-500">Buat laporan setoran untuk pengurus lingkungan atau dinas terkait.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={exportCSV}
            disabled={filteredTx.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            disabled={filteredTx.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-2.25 0h.008v.008H16.5V12z" />
            </svg>
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:shadow-none print:border-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-stone-600">Periode:</span>
          <div className="flex gap-2 print:hidden">
            {rangeButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setDateRange(btn.key)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  dateRange === btn.key
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {dateRange === "custom" && (
            <div className="flex items-center gap-2 print:hidden">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-stone-400">—</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-stone-200 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-stone-400 print:hidden">
          Menampilkan data dari <span className="font-medium text-stone-600">{dateFilter.from}</span> sampai <span className="font-medium text-stone-600">{dateFilter.to}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:shadow-none">
          <p className="text-sm font-medium text-stone-500">Total Transaksi</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{totalTransaksi}</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:shadow-none">
          <p className="text-sm font-medium text-stone-500">Total Berat</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{totalBerat.toFixed(2)} <span className="text-lg text-stone-400">kg</span></p>
        </article>
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm print:shadow-none">
          <p className="text-sm font-medium text-emerald-800">Total Nilai Transaksi</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">Rp {totalNilai.toLocaleString("id-ID")}</p>
        </article>
      </section>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm print:shadow-none">
          <h2 className="text-base font-semibold text-stone-900 mb-4">Breakdown per Kategori Sampah</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left">
                  <th className="pb-2 font-medium text-stone-600">Jenis Sampah</th>
                  <th className="pb-2 font-medium text-stone-600 text-right">Transaksi</th>
                  <th className="pb-2 font-medium text-stone-600 text-right">Berat Total</th>
                  <th className="pb-2 font-medium text-stone-600 text-right">Nilai Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.name}>
                    <td className="py-2.5 font-medium text-stone-800">{cat.name}</td>
                    <td className="py-2.5 text-right text-stone-600">{cat.count}x</td>
                    <td className="py-2.5 text-right text-stone-600">{cat.weight.toFixed(2)} kg</td>
                    <td className="py-2.5 text-right font-semibold text-stone-800">Rp {cat.value.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Detail Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm print:shadow-none">
        <div className="border-b border-stone-100 px-5 py-4">
          <h2 className="text-base font-semibold text-stone-900">Detail Transaksi Terverifikasi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                <th className="px-5 py-3 font-medium text-stone-600">ID</th>
                <th className="px-5 py-3 font-medium text-stone-600">Nasabah</th>
                <th className="px-5 py-3 font-medium text-stone-600">Jenis</th>
                <th className="px-5 py-3 font-medium text-stone-600 text-right">Berat</th>
                <th className="px-5 py-3 font-medium text-stone-600 text-right">Reward</th>
                <th className="px-5 py-3 font-medium text-stone-600">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-stone-500">{tx.tx_id}</td>
                  <td className="px-5 py-3 font-medium text-stone-800">{tx.user_id}</td>
                  <td className="px-5 py-3 text-stone-600">{tx.waste_type}</td>
                  <td className="px-5 py-3 text-right text-stone-600">{Number(tx.actual_weight || 0).toFixed(2)} kg</td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-700">Rp {Number(tx.total_reward || 0).toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3 text-stone-500">{new Date(tx.created_at).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {filteredTx.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-400">Tidak ada data pada periode ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Header (only visible when printing) */}
      <div className="hidden print:block text-center border-t border-stone-200 pt-4 mt-4">
        <p className="text-xs text-stone-500">Laporan ini dihasilkan oleh sistem WasteBank pada {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
    </div>
  );
}
