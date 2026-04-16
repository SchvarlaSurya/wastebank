"use client";

import { useState, useMemo } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { statusLabel, type Nasabah, type NasabahStatus } from "@/lib/types";

const ADMIN_NAME = "Admin Schvarla";

export default function NasabahPage() {
  const { nasabahList, transactions, verifyNasabah, freezeNasabah, unfreezeNasabah, editBalance } = useAdminStore();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | NasabahStatus>("all");
  const [selectedNasabah, setSelectedNasabah] = useState<Nasabah | null>(null);
  const [editSaldo, setEditSaldo] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [editReason, setEditReason] = useState("");

  const filtered = useMemo(() => {
    return nasabahList.filter((n) => {
      const matchSearch = n.name.toLowerCase().includes(search.toLowerCase()) || n.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || n.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [nasabahList, search, filterStatus]);

  const nasabahTx = useMemo(() => {
    if (!selectedNasabah) return [];
    return transactions.filter((tx) => tx.nasabahId === selectedNasabah.id);
  }, [selectedNasabah, transactions]);

  // Refresh selected nasabah from store when it changes
  const currentSelected = selectedNasabah ? nasabahList.find((n) => n.id === selectedNasabah.id) || null : null;

  const handleVerify = (id: string) => {
    verifyNasabah(id, ADMIN_NAME);
  };

  const handleFreeze = (id: string) => {
    freezeNasabah(id, ADMIN_NAME);
  };

  const handleUnfreeze = (id: string) => {
    unfreezeNasabah(id, ADMIN_NAME);
  };

  const handleEditBalance = () => {
    if (!currentSelected || !newBalance || !editReason) return;
    editBalance(currentSelected.id, Number(newBalance), editReason, ADMIN_NAME);
    setEditSaldo(false);
    setNewBalance("");
    setEditReason("");
  };

  const statusBadge = (status: NasabahStatus) => {
    const styles: Record<NasabahStatus, string> = {
      verified: "bg-emerald-100 text-emerald-800",
      pending: "bg-amber-100 text-amber-800",
      frozen: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}>
        {statusLabel[status]}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Manajemen Nasabah</h1>
          <p className="text-sm text-stone-500">Kelola akun, verifikasi, dan saldo nasabah Bank Sampah.</p>
        </div>
        <div className="text-sm text-stone-500">
          Total: <span className="font-semibold text-stone-800">{nasabahList.length}</span> nasabah
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
            placeholder="Cari nama atau email nasabah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "verified", "pending", "frozen"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                filterStatus === s
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {s === "all" ? "Semua" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                <th className="px-5 py-3 font-medium text-stone-600">Nasabah</th>
                <th className="px-5 py-3 font-medium text-stone-600 hidden sm:table-cell">Saldo</th>
                <th className="px-5 py-3 font-medium text-stone-600 hidden md:table-cell">Total Setoran</th>
                <th className="px-5 py-3 font-medium text-stone-600">Status</th>
                <th className="px-5 py-3 font-medium text-stone-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-stone-800">{n.name}</p>
                      <p className="text-xs text-stone-500">{n.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <p className="font-semibold text-stone-800">Rp {n.balance.toLocaleString("id-ID")}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-stone-600">{n.totalDeposits}x · {n.totalWeight} kg</p>
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(n.status)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setSelectedNasabah(n); setEditSaldo(false); }}
                        className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition"
                      >
                        Detail
                      </button>
                      {n.status === "pending" && (
                        <button
                          onClick={() => handleVerify(n.id)}
                          className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-200 transition"
                        >
                          Verifikasi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-stone-400">Tidak ada nasabah ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {currentSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">{currentSelected.name}</h3>
                <p className="text-sm text-stone-500">{currentSelected.email} · {currentSelected.phone}</p>
              </div>
              <button onClick={() => setSelectedNasabah(null)} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Profile Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Alamat</p>
                  <p className="mt-1 text-sm text-stone-800">{currentSelected.address}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">KTP</p>
                  <p className="mt-1 text-sm text-stone-800 font-mono">{currentSelected.ktp}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Bergabung</p>
                  <p className="mt-1 text-sm text-stone-800">{currentSelected.joinedAt}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Status</p>
                  <div className="mt-1">{statusBadge(currentSelected.status)}</div>
                </div>
              </div>

              {/* Balance Card */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Saldo</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">Rp {currentSelected.balance.toLocaleString("id-ID")}</p>
                  </div>
                  <button
                    onClick={() => { setEditSaldo(!editSaldo); setNewBalance(String(currentSelected.balance)); }}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    {editSaldo ? "Batal" : "Edit Saldo"}
                  </button>
                </div>
                {editSaldo && (
                  <div className="mt-4 space-y-3 border-t border-emerald-200 pt-4">
                    <div>
                      <label className="text-xs font-medium text-emerald-800">Saldo Baru (Rp)</label>
                      <input
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-emerald-800">Alasan Perubahan</label>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Contoh: Koreksi input duplikat"
                        className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      onClick={handleEditBalance}
                      disabled={!newBalance || !editReason}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className="flex gap-2">
                {currentSelected.status === "pending" && (
                  <button
                    onClick={() => handleVerify(currentSelected.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    ✓ Verifikasi Akun
                  </button>
                )}
                {currentSelected.status === "verified" && (
                  <button
                    onClick={() => handleFreeze(currentSelected.id)}
                    className="rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-200 transition"
                  >
                    ✕ Bekukan Akun
                  </button>
                )}
                {currentSelected.status === "frozen" && (
                  <button
                    onClick={() => handleUnfreeze(currentSelected.id)}
                    className="rounded-lg bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-200 transition"
                  >
                    ↻ Aktifkan Kembali
                  </button>
                )}
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-3">Riwayat Setoran</h4>
                {nasabahTx.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {nasabahTx.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-stone-800">{tx.wasteType}</p>
                          <p className="text-xs text-stone-500">{tx.date} · {tx.actualWeight || tx.estimatedWeight}kg · {tx.id}</p>
                        </div>
                        <div className="text-right">
                          {tx.status === "verified" && (
                            <p className="text-sm font-semibold text-emerald-700">+ Rp {tx.totalReward.toLocaleString("id-ID")}</p>
                          )}
                          <span className={`text-[10px] font-bold uppercase ${
                            tx.status === "pending" ? "text-amber-600" :
                            tx.status === "verified" ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-400">Belum ada riwayat setoran.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
