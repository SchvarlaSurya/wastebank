"use client";

import { useMemo } from "react";
import { useWasteStore } from "@/store/useWasteStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#047857", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#065f46"];

export default function DashboardPage() {
  const { balance, transactions } = useWasteStore();

  // Metrics Calculation
  const totalSampah = useMemo(() => transactions.reduce((acc, tx) => acc + tx.weight, 0), [transactions]);
  const totalNilai = useMemo(() => transactions.reduce((acc, tx) => acc + tx.reward, 0), [transactions]);
  const totalTransaksi = transactions.length;

  // Hitung penarikan kotor sederhana berdasarkan delta saldo
  const initialDummyTotal = 98600; // sum of initial 4 dummy txs
  const baseBalance = 875000; // sum of initial dummy balance
  const accumulatedRewards = totalNilai - initialDummyTotal;
  const theoreticalBalance = baseBalance + accumulatedRewards;
  const totalDitarik = theoreticalBalance > balance ? (theoreticalBalance - balance) : 0;

  // Chart 1: Tren Mingguan (Bar Chart)
  const weeklyData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Fallback format if timezone issues
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, "0");
      const dStr = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      dataMap[dateStr] = 0;
    }

    transactions.forEach(tx => {
      if (dataMap[tx.date] !== undefined) {
        dataMap[tx.date] += tx.weight;
      }
    });

    return Object.keys(dataMap).map(date => {
      const parts = date.split("-");
      return {
        date: `${parts[2]}/${parts[1]}`, // DD/MM format
        weight: dataMap[date]
      };
    });
  }, [transactions]);

  // Chart 2: Distribusi Jenis Sampah (Pie Chart)
  const distributionData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    transactions.forEach(tx => {
      dataMap[tx.type] = (dataMap[tx.type] || 0) + tx.weight;
    });

    return Object.keys(dataMap).map(key => ({
      name: key,
      value: dataMap[key]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Recent 5 Transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="mx-auto w-full space-y-6 pb-12">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-stone-900">Ringkasan Dasbor</h1>
        <p className="text-sm text-stone-600">Pantau pergerakan statistik daur ulang secara *real-time*.</p>
      </div>

      {/* 4 Top Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200">
          <p className="text-sm font-medium text-stone-500">Total Sampah Dikumpulkan</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{totalSampah} <span className="text-lg text-stone-500">kg</span></p>
        </article>
        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200">
          <p className="text-sm font-medium text-stone-500">Total Transaksi</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{totalTransaksi} <span className="text-lg text-stone-500">kali</span></p>
        </article>
        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300">
          <p className="text-sm font-medium text-emerald-800">Saldo Tersedia</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">Rp {balance.toLocaleString("id-ID")}</p>
        </article>
        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200">
          <p className="text-sm font-medium text-stone-500">Total Poin / Saldo Ditukar</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">Rp {totalDitarik.toLocaleString("id-ID")}</p>
        </article>
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trend Bar Chart */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 text-lg font-semibold text-stone-900">Tren Setoran Mingguan (kg)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#78716c' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#78716c' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f5f5f4' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="weight" name="Berat (kg)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 flex flex-col">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Distribusi & Volume Jenis Sampah</h2>
          <div className="flex-1 flex flex-col md:flex-row w-full min-h-[280px] md:items-center gap-6">
            {distributionData.length > 0 ? (
              <>
                <div className="h-[240px] w-full md:w-[55%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [`${value} kg`, 'Volume']}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-[45%] flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-2">
                  {distributionData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm py-1 border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors rounded-lg px-2">
                      <div className="flex items-center gap-3 overflow-hidden pr-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-stone-700 font-medium truncate" title={entry.name}>{entry.name}</span>
                      </div>
                      <span className="font-semibold text-stone-900 flex-shrink-0 ml-2">{entry.value} kg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[240px] w-full items-center justify-center text-stone-400">Belum ada data setoran.</div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Transactions List */}
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4 sm:px-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Setoran Terbaru</h2>
            <p className="text-sm text-stone-600">Riwayat transaksi terakhir yang berhasil masuk.</p>
          </div>
        </div>
        <div className="divide-y divide-stone-200">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((item) => (
              <div key={item.id} className="group flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 hover:bg-emerald-50/50 transition-colors cursor-default">
                <div>
                  <p className="font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors">{item.type}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-stone-600">{item.date}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-sm font-medium text-stone-700">{item.weight} kg</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{item.id}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
                  <p className="font-bold text-emerald-700">+ Rp {item.reward.toLocaleString("id-ID")}</p>
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-stone-500">Belum ada setoran masuk.</div>
          )}
        </div>
      </section>
    </div>
  );
}
