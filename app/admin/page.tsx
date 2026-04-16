"use client";

import { useMemo } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { transactionStatusLabel } from "@/lib/types";

export default function AdminOverviewPage() {
  const {
    nasabahList, transactions, wasteCatalog, activityLog,
    getTotalBalance, getTodayWeight, getPendingCount, getActiveNasabahCount,
  } = useAdminStore();

  const totalBalance = getTotalBalance();
  const todayWeight = getTodayWeight();
  const pendingCount = getPendingCount();
  const activeNasabah = getActiveNasabahCount();

  // Monthly weight by category
  const monthlyByCategory = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const map: Record<string, number> = {};
    transactions
      .filter((tx) => tx.date.startsWith(thisMonth) && tx.status === "verified")
      .forEach((tx) => {
        map[tx.wasteType] = (map[tx.wasteType] || 0) + (tx.actualWeight || 0);
      });
    return Object.entries(map).map(([name, weight]) => ({ name, weight })).sort((a, b) => b.weight - a.weight);
  }, [transactions]);

  // Weekly trend
  const weeklyData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dataMap[dateStr] = 0;
    }
    transactions
      .filter((tx) => tx.status === "verified")
      .forEach((tx) => {
        if (dataMap[tx.date] !== undefined) dataMap[tx.date] += tx.actualWeight || 0;
      });
    return Object.keys(dataMap).map((date) => {
      const parts = date.split("-");
      return { date: `${parts[2]}/${parts[1]}`, weight: dataMap[date] };
    });
  }, [transactions]);

  // Recent 5 transactions
  const recentTx = transactions.slice(0, 5);

  // Recent 5 logs
  const recentLogs = activityLog.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard Admin</h1>
        <p className="text-sm text-stone-500">Pantau aktivitas Bank Sampah secara real-time.</p>
      </div>

      {/* 4 Stat Cards */}
      <section id="admin-stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Saldo */}
        <article className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-50" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              Total Saldo Nasabah
            </div>
            <p className="mt-3 text-3xl font-bold text-stone-900">Rp {totalBalance.toLocaleString("id-ID")}</p>
            <p className="mt-1 text-xs text-stone-400">Akumulasi seluruh saldo aktif</p>
          </div>
        </article>

        {/* Berat Hari Ini */}
        <article className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-50" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5.0a48.392 48.392 0 012.916.52A6.003 6.003 0 0118.06 9.84M5.25 4.97A48.303 48.303 0 002.334 5.49 6.003 6.003 0 005.94 9.84m0 0a4.495 4.495 0 01-.9 7.41 4.5 4.5 0 01-3.45 1.235M5.94 9.84a4.493 4.493 0 00-1.245 3.66" />
              </svg>
              Berat Masuk Hari Ini
            </div>
            <p className="mt-3 text-3xl font-bold text-stone-900">{todayWeight} <span className="text-lg text-stone-400">kg</span></p>
            <p className="mt-1 text-xs text-stone-400">Terverifikasi hari ini</p>
          </div>
        </article>

        {/* Nasabah Aktif */}
        <article className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-violet-50" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Nasabah Aktif
            </div>
            <p className="mt-3 text-3xl font-bold text-stone-900">{activeNasabah} <span className="text-lg text-stone-400">orang</span></p>
            <p className="mt-1 text-xs text-stone-400">Dari total {nasabahList.length} nasabah</p>
          </div>
        </article>

        {/* Pending */}
        <Link href="/admin/transaksi" className="block">
          <article className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${pendingCount > 0 ? "border-amber-200 bg-amber-50" : "border-stone-200 bg-white"}`}>
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${pendingCount > 0 ? "bg-amber-100" : "bg-stone-50"}`} />
            <div className="relative">
              <div className={`flex items-center gap-2 text-sm font-medium ${pendingCount > 0 ? "text-amber-700" : "text-stone-500"}`}>
                <svg className={`h-4 w-4 ${pendingCount > 0 ? "text-amber-600" : "text-stone-400"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                Pending Verification
              </div>
              <p className={`mt-3 text-3xl font-bold ${pendingCount > 0 ? "text-amber-800" : "text-stone-900"}`}>
                {pendingCount}
                {pendingCount > 0 && <span className="ml-2 inline-flex h-3 w-3 animate-ping rounded-full bg-amber-400" />}
              </p>
              <p className={`mt-1 text-xs ${pendingCount > 0 ? "text-amber-600" : "text-stone-400"}`}>
                {pendingCount > 0 ? "Klik untuk validasi →" : "Semua transaksi sudah diproses"}
              </p>
            </div>
          </article>
        </Link>
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Bar Chart */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 text-lg font-semibold text-stone-900">Tren Setoran 7 Hari Terakhir</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#78716c" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#78716c" }} />
                <RechartsTooltip
                  cursor={{ fill: "#f5f5f4" }}
                  contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [`${value} kg`, "Berat"]}
                />
                <Bar dataKey="weight" name="Berat (kg)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Berat per Kategori (Bulan Ini)</h2>
          {monthlyByCategory.length > 0 ? (
            <div className="space-y-3">
              {monthlyByCategory.map((item, i) => {
                const max = monthlyByCategory[0].weight || 1;
                const pct = Math.round((item.weight / max) * 100);
                const colors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-stone-700">{item.name}</span>
                      <span className="font-semibold text-stone-900">{item.weight} kg</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colors[i % colors.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-stone-400">Belum ada data bulan ini.</div>
          )}
        </div>
      </section>

      {/* Bottom: Recent Transactions + Recent Logs */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-900">Transaksi Terbaru</h2>
            <Link href="/admin/transaksi" className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-stone-50/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{tx.nasabahName}</p>
                  <p className="text-xs text-stone-500 truncate">{tx.wasteType} · {tx.estimatedWeight}kg · {tx.id}</p>
                </div>
                <span className={`flex-shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  tx.status === "pending" ? "bg-amber-100 text-amber-800" :
                  tx.status === "verified" ? "bg-emerald-100 text-emerald-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {transactionStatusLabel[tx.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-base font-semibold text-stone-900">Aktivitas Terakhir</h2>
            <Link href="/admin/log" className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-stone-800">{log.actionLabel}</p>
                  <span className="flex-shrink-0 text-[10px] text-stone-400">{log.adminName}</span>
                </div>
                <p className="mt-0.5 text-xs text-stone-500 truncate">{log.target} — {log.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/transaksi" className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-transform group-hover:scale-110">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-stone-800">Validasi Transaksi</p>
            <p className="text-xs text-stone-500">Proses setoran masuk</p>
          </div>
        </Link>
        <Link href="/admin/nasabah" className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-transform group-hover:scale-110">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-stone-800">Kelola Nasabah</p>
            <p className="text-xs text-stone-500">Verifikasi dan manajemen akun</p>
          </div>
        </Link>
        <Link href="/admin/laporan" className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition-transform group-hover:scale-110">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-stone-800">Buat Laporan</p>
            <p className="text-xs text-stone-500">Export data CSV / cetak PDF</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
