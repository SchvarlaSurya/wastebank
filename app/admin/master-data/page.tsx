"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { categoryLabel, type WasteCategory } from "@/lib/types";

const ADMIN_NAME = "Admin Schvarla";

export default function MasterDataPage() {
  const { wasteCatalog, updatePrice, addWasteCategory } = useAdminStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ id: "", name: "", category: "anorganik" as WasteCategory, pricePerKg: "" });

  const handleSavePrice = (wasteId: string) => {
    const price = Number(editPrice);
    if (!price || price <= 0) return;
    updatePrice(wasteId, price, ADMIN_NAME);
    setEditingId(null);
    setEditPrice("");
  };

  const handleAdd = () => {
    if (!newItem.id || !newItem.name || !newItem.pricePerKg) return;
    addWasteCategory(
      { id: newItem.id, name: newItem.name, category: newItem.category, pricePerKg: Number(newItem.pricePerKg) },
      ADMIN_NAME
    );
    setNewItem({ id: "", name: "", category: "anorganik", pricePerKg: "" });
    setShowAdd(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Master Data & Harga</h1>
          <p className="text-sm text-stone-500">Kelola kategori sampah dan update harga per kg. Harga otomatis terhubung ke sisi nasabah.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Kategori
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
        <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-blue-800">Harga terhubung otomatis</p>
          <p className="text-xs text-blue-700 mt-0.5">Setiap perubahan harga akan langsung berlaku di semua perhitungan setoran nasabah. Perubahan dicatat di Log Aktivitas.</p>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-stone-900">Tambah Kategori Baru</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">ID (unik)</label>
              <input
                type="text"
                placeholder="contoh: styrofoam"
                value={newItem.id}
                onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Nama Jenis Sampah</label>
              <input
                type="text"
                placeholder="contoh: Styrofoam Bersih"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Kategori</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as WasteCategory })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="anorganik">Anorganik</option>
                <option value="organik">Organik</option>
                <option value="khusus">Khusus</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Harga per kg (Rp)</label>
              <input
                type="number"
                min="0"
                placeholder="5000"
                value={newItem.pricePerKg}
                onChange={(e) => setNewItem({ ...newItem, pricePerKg: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAdd}
              disabled={!newItem.id || !newItem.name || !newItem.pricePerKg}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left">
                <th className="px-5 py-3 font-medium text-stone-600">Jenis Sampah</th>
                <th className="px-5 py-3 font-medium text-stone-600">Kategori</th>
                <th className="px-5 py-3 font-medium text-stone-600">Harga / kg</th>
                <th className="px-5 py-3 font-medium text-stone-600 hidden sm:table-cell">Terakhir Update</th>
                <th className="px-5 py-3 font-medium text-stone-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {wasteCatalog.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-stone-800">{item.name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      item.category === "anorganik" ? "bg-blue-100 text-blue-800" :
                      item.category === "organik" ? "bg-green-100 text-green-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {categoryLabel[item.category]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-xs">Rp</span>
                        <input
                          type="number"
                          autoFocus
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSavePrice(item.id)}
                          className="w-24 rounded-lg border border-emerald-300 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button onClick={() => handleSavePrice(item.id)} className="text-emerald-600 hover:text-emerald-800">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-stone-400 hover:text-stone-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">Rp {item.pricePerKg.toLocaleString("id-ID")}</span>
                        {item.previousPrice !== undefined && item.previousPrice !== item.pricePerKg && (
                          <span className={`text-[10px] font-bold ${item.pricePerKg > item.previousPrice ? "text-emerald-600" : "text-red-600"}`}>
                            {item.pricePerKg > item.previousPrice ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-stone-500">{item.updatedAt}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {editingId !== item.id && (
                      <button
                        onClick={() => { setEditingId(item.id); setEditPrice(String(item.pricePerKg)); }}
                        className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition"
                      >
                        Edit Harga
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
