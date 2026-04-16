"use client";

import { useState, useEffect } from "react";
import { useWasteStore } from "@/store/useWasteStore";

export default function RiwayatPage() {
  const transactions = useWasteStore((state) => state.transactions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi fetch Supabase
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "diproses":
      case "menunggu":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "berhasil":
      case "selesai":
      case "success":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "ditolak":
      case "rejected":
        return "bg-red-50 text-red-700 ring-red-600/20";
      default:
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-1 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <h1 className="text-2xl font-semibold text-stone-900">Riwayat Setoran</h1>
        <p className="text-sm text-stone-600">Daftar seluruh setoran sampah Anda bersama WasteBank. Klik transaksi untuk mencetak struk digital.</p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="divide-y divide-stone-200">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-32 animate-pulse rounded-md bg-stone-200"></div>
                    <div className="h-5 w-16 animate-pulse rounded-full bg-stone-100"></div>
                  </div>
                  <div className="h-4 w-40 animate-pulse rounded-md bg-stone-100"></div>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="h-6 w-24 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-5 w-5 animate-pulse rounded-md bg-stone-100"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
          {transactions.map((item) => (
            <div key={item.id} className="flex flex-col">
              {/* Clickable Header */}
              <div 
                onClick={() => toggleExpand(item.id)}
                className="group flex cursor-pointer flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 hover:bg-emerald-50/50 active:bg-emerald-50/70 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-stone-900">{item.type}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mt-1">
                    {item.date} • {item.id}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <p className="font-semibold text-emerald-800">+ Rp {item.reward.toLocaleString("id-ID")}</p>
                  <svg 
                    className={`h-5 w-5 text-stone-400 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Digital Receipt (Expanded) */}
              {expandedId === item.id && (
                <div className="px-5 pb-5 pt-1 sm:px-6 bg-stone-50/30">
                  <div className="rounded-2xl border border-emerald-100 border-dashed bg-white p-5 shadow-sm max-w-sm ml-auto mr-auto sm:mr-0 transition-transform duration-300 hover:scale-[1.02] hover:shadow-md cursor-default">
                    <div className="flex flex-col items-center justify-center border-b border-stone-100 pb-3">
                      <h3 className="font-bold text-stone-900 tracking-wide uppercase text-sm">WasteBank - Struk Digital</h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">ID: {item.id} • Tgl: {item.date}</p>
                    </div>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Material</span>
                        <span className="font-medium text-stone-900">{item.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Berat Bersih</span>
                        <span className="font-medium text-stone-900">{item.weight} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Harga per kg</span>
                        <span className="font-medium text-stone-900">Rp {(item.reward / item.weight).toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 border-t border-stone-100 pt-3">
                        <span className="font-semibold text-stone-800">Total Reward</span>
                        <span className="font-bold text-emerald-700">Rp {item.reward.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="px-6 py-12 text-center text-stone-500">
              Belum ada riwayat transaksi setoran.
            </div>
          )}
          </div>
        )}
      </section>
    </div>
  );
}
