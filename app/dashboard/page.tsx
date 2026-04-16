"use client";

import { useMemo, useEffect, useState } from "react";
import { useWasteStore, useUserTier } from "@/store/useWasteStore";
import { getUserDashboardData, getGlobalWasteStats } from "@/app/actions/transaction";
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
  const { balance, transactions, withdrawals, isHydrated, initStore } = useWasteStore();
  const [loading, setLoading] = useState(!isHydrated);

  // Global Chart States
  const [globalDist, setGlobalDist] = useState<{name: string, value: number}[]>([]);
  const [globalWeekly, setGlobalWeekly] = useState<{date: string, weight: number}[]>([]);
  
  // Timer States
  const [timeToWeekEnd, setTimeToWeekEnd] = useState<string>("");
  const [timeToMonthEnd, setTimeToMonthEnd] = useState<string>("");

  useEffect(() => {
    if (!isHydrated) {
      Promise.all([
        getUserDashboardData(),
        getGlobalWasteStats()
      ]).then(([userRes, globalRes]) => {
        if (userRes.success) {
          initStore(userRes.balance || 0, userRes.transactions as any, userRes.withdrawals as any);
        }
        if (globalRes.success && globalRes.distributionData && globalRes.weeklyData) {
          setGlobalDist(globalRes.distributionData);
          setGlobalWeekly(globalRes.weeklyData);
        }
        setLoading(false);
      });
    } else {
      // Even if user store is hydrated, we still fetch fresh global stats
      getGlobalWasteStats().then(globalRes => {
        if (globalRes.success && globalRes.distributionData && globalRes.weeklyData) {
          setGlobalDist(globalRes.distributionData);
          setGlobalWeekly(globalRes.weeklyData);
        }
        setLoading(false);
      });
    }
  }, [isHydrated, initStore]);

  // Timer Effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      // End of this week (Sunday 23:59:59)
      const day = now.getDay();
      const diffToSunday = day === 0 ? 0 : 7 - day;
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToSunday, 23, 59, 59, 999);
      const weekDiff = Math.max(0, endOfWeek.getTime() - now.getTime());
      
      const wDays = Math.floor(weekDiff / (1000 * 60 * 60 * 24));
      const wHours = Math.floor((weekDiff / (1000 * 60 * 60)) % 24);
      const wMins = Math.floor((weekDiff / 1000 / 60) % 60);
      const wSecs = Math.floor((weekDiff / 1000) % 60);
      setTimeToWeekEnd(`${wDays} Hari ${wHours.toString().padStart(2, '0')}:${wMins.toString().padStart(2, '0')}:${wSecs.toString().padStart(2, '0')}`);

      // End of this month (for Donut Chart)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthDiff = Math.max(0, endOfMonth.getTime() - now.getTime());
      
      const mDays = Math.floor(monthDiff / (1000 * 60 * 60 * 24));
      const mHours = Math.floor((monthDiff / (1000 * 60 * 60)) % 24);
      const mMins = Math.floor((monthDiff / 1000 / 60) % 60);
      const mSecs = Math.floor((monthDiff / 1000) % 60);
      setTimeToMonthEnd(`${mDays} Hari ${mHours.toString().padStart(2, '0')}:${mMins.toString().padStart(2, '0')}:${mSecs.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // (Chart calculations removed since we pull from global API)

  // Recent 5 Transactions
  const recentTransactions = transactions.slice(0, 5);
  const { tier, bonusPercentage, nextTierWeight, progressToNext, tierColor } = useUserTier();

  return (
    <div className="mx-auto w-full space-y-6 pb-12">
      <div className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Ringkasan Dasbor</h1>
          <p className="text-sm text-stone-600 mt-1">Pantau pergerakan statistik daur ulang secara *real-time*.</p>
        </div>
        
        {/* Tier Badge */}
        <div className="flex flex-col items-start sm:items-end bg-white border border-stone-200 p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status Member</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset uppercase tracking-wide ${tierColor}`}>
              {tier}
            </span>
          </div>
          {nextTierWeight > 0 ? (
            <div className="w-48">
              <div className="flex justify-between text-[10px] text-stone-500 mb-1 font-medium">
                <span>Dipercepat +{bonusPercentage}% Harga</span>
                <span>{nextTierWeight}kg untuk Next Tier</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressToNext}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-medium text-emerald-600">Level Tertinggi +10% Harga</div>
          )}
        </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <h2 className="text-lg font-semibold text-stone-900">Tren Setoran Global Mingguan (kg)</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">
                Mingguan Reset: <span className="text-emerald-700 font-mono tracking-tight ml-1">{timeToWeekEnd}</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={globalWeekly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-stone-900">Distribusi Global Bulanan (Volume)</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">
                Bulanan Reset: <span className="text-amber-700 font-mono tracking-tight ml-1">{timeToMonthEnd}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row w-full min-h-[280px] md:items-center gap-6">
            {globalDist.length > 0 ? (
              <>
                <div className="h-[240px] w-full md:w-[55%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={globalDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {globalDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [`${value} kg`, 'Volume Global']}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-[45%] flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-2">
                  {globalDist.map((entry, index) => (
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
