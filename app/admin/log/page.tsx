"use client";

import { useState, useMemo, useEffect } from "react";
import { getActivityLog } from "@/app/actions/adminVerification";
import { actionLabel as actionLabelMap, type ActivityAction } from "@/lib/types";

export default function LogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<"all" | ActivityAction>("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getActivityLog(100);
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } catch (error) {
      console.error("Error loading activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set);
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.adminName.toLowerCase().includes(search.toLowerCase()) ||
        (log.targetId || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.details || "").toLowerCase().includes(search.toLowerCase());
      const matchAction = filterAction === "all" || log.action === filterAction;
      return matchSearch && matchAction;
    });
  }, [logs, search, filterAction]);

  const formatTimestamp = (ts: any) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const actionColor = (action: string) => {
    const colors: Record<string, string> = {
      verify_transaction: "bg-emerald-100 text-emerald-800",
      reject_transaction: "bg-red-100 text-red-800",
      verify_account: "bg-blue-100 text-blue-800",
      freeze_account: "bg-red-100 text-red-800",
      unfreeze_account: "bg-blue-100 text-blue-800",
      edit_balance: "bg-amber-100 text-amber-800",
      update_price: "bg-violet-100 text-violet-800",
      add_category: "bg-cyan-100 text-cyan-800",
      delete_category: "bg-stone-100 text-stone-800",
    };
    return colors[action] || "bg-stone-100 text-stone-800";
  };

  const actionIcon = (action: string) => {
    switch (action) {
      case "verify_transaction":
        return "✓";
      case "reject_transaction":
        return "✕";
      case "verify_account":
        return "✓";
      case "freeze_account":
        return "❄";
      case "unfreeze_account":
        return "↻";
      case "edit_balance":
        return "✎";
      case "update_price":
        return "↕";
      case "add_category":
        return "+";
      case "delete_category":
        return "−";
      default:
        return "•";
    }
  };

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
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Log Aktivitas</h1>
        <p className="text-sm text-stone-500">
          Audit trail lengkap semua aksi admin — siapa, kapan, dan apa yang diubah.
        </p>
      </div>

      {/* Security Notice */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-start gap-3">
        <svg className="h-5 w-5 text-stone-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-stone-700">Catatan audit tidak dapat dihapus</p>
          <p className="text-xs text-stone-500 mt-0.5">Semua aksi admin secara otomatis tercatat untuk mencegah kecurangan internal dan menjaga transparansi operasional.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Cari admin, target, atau detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value as "all" | ActivityAction)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Semua Aksi</option>
          {uniqueActions.map((action: any) => (
            <option key={action} value={action}>
              {actionLabelMap[action as ActivityAction] || action}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-stone-400">{filtered.length} catatan ditemukan</p>

      {/* Timeline Log */}
      <div className="space-y-3">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-stone-300"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                {/* Action Icon */}
                <span className={`flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${actionColor(log.action)}`}>
                  {actionIcon(log.action)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${actionColor(log.action)}`}>
                      {actionLabelMap[log.action as ActivityAction] || log.action}
                    </span>
                    <span className="text-xs text-stone-400">oleh</span>
                    <span className="text-xs font-semibold text-stone-700">{log.adminName}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-stone-800 truncate">{log.targetType}: {log.targetId}</p>
                  <p className="mt-0.5 text-xs text-stone-500 truncate">{log.details}</p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right sm:text-right">
                <p className="text-xs text-stone-400">{formatTimestamp(log.createdAt)}</p>
                <p className="text-[10px] text-stone-300 font-mono mt-0.5">ID: {log.id}</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-400">Tidak ada log aktivitas ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
