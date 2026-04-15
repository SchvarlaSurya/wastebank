"use client";

import { useState, useMemo } from "react";

const wasteCatalog = [
  { id: "plastic", name: "Plastik Campur", category: "anorganik", pricePerKg: 4200 },
  { id: "paper", name: "Kertas dan Kardus", category: "anorganik", pricePerKg: 2800 },
  { id: "metal", name: "Logam Ringan", category: "anorganik", pricePerKg: 7600 },
  { id: "organic", name: "Sisa Organik Kering", category: "organik", pricePerKg: 1700 },
  { id: "battery", name: "Baterai Rumah Tangga", category: "khusus", pricePerKg: 9800 },
  { id: "electronics", name: "Elektronik Kecil", category: "khusus", pricePerKg: 13200 },
];

export default function SetorSampahPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    wasteType: "",
    weight: "",
    address: "",
    date: "",
    notes: ""
  });

  const selectedWaste = useMemo(() => wasteCatalog.find((item) => item.name === form.wasteType), [form.wasteType]);

  const estimatedReward = useMemo(() => {
    if (!selectedWaste || !form.weight) return 0;
    const weight = Number(form.weight);
    if (Number.isNaN(weight) || weight <= 0) return 0;
    return weight * selectedWaste.pricePerKg;
  }, [form.weight, selectedWaste]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mocking an API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // reset form
      setForm({ wasteType: "", weight: "", address: "", date: "", notes: "" });
      
      // hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-1 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <h1 className="text-2xl font-semibold text-stone-900">Jadwalkan Setor Sampah</h1>
        <p className="text-sm text-stone-600">Pilih jenis sampah Anda dan tim kami akan melakukan pickup secara langsung.</p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm p-5 sm:p-7">
        {isSuccess ? (
          <div className="rounded-2xl bg-emerald-50 p-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-lg font-semibold text-emerald-800">Permintaan Pickup Berhasil</p>
            <p className="mt-2 text-sm text-emerald-700">Tim operasional akan menghubungi Anda melalui WhatsApp untuk konfirmasi penjemputan.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Jenis Sampah</label>
                <select
                  required
                  value={form.wasteType}
                  onChange={(e) => setForm({ ...form, wasteType: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="">-- Pilih Jenis --</option>
                  {wasteCatalog.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Estimasi Berat (kg)</label>
                <input
                  required
                  min="1"
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  placeholder="Contoh: 5"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Tanggal Penjemputan</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Alamat Tempat Jemput</label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                placeholder="Rincian alamat rumah/kantor..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Catatan Khusus (opsional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                placeholder="Contoh: Titip di satpam"
              />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-medium text-stone-600">Estimasi Reward Saldo</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">Rp {estimatedReward.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-stone-500">Angka ini sekedar estimasi. Total akhir bergantung pada timbangan asli kurir.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Memproses Permintaan..." : "Ajukan Pickup Sekarang"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
