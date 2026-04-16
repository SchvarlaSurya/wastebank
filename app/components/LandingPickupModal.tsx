"use client";

import { usePickupStore } from "@/store/pickupStore";
import { FormEvent, useMemo, useState } from "react";
import { wasteCatalog, categoryLabel } from "@/lib/catalog";

interface PickupFormData {
  name: string;
  phone: string;
  address: string;
  wasteType: string;
  weight: string;
  notes: string;
}

const initialForm: PickupFormData = {
  name: "",
  phone: "",
  address: "",
  wasteType: "",
  weight: "",
  notes: "",
};

export default function LandingPickupModal() {
  const { isOpen, closePickup } = usePickupStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<PickupFormData>(initialForm);

  const selectedWaste = useMemo(
    () => wasteCatalog.find((item) => item.name === form.wasteType),
    [form.wasteType]
  );

  const estimatedReward = useMemo(() => {
    if (!selectedWaste || !form.weight) return 0;

    const parsedWeight = Number(form.weight);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) return 0;

    return parsedWeight * selectedWaste.pricePerKg;
  }, [form.weight, selectedWaste]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    window.setTimeout(() => {
      setIsSubmitted(false);
      closePickup();
      setForm(initialForm);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">Form Pickup Sampah</h3>
            <p className="text-sm text-stone-600">Isi data untuk jadwal penjemputan pertama.</p>
          </div>
          <button
            type="button"
            aria-label="Tutup form"
            onClick={closePickup}
            className="rounded-full border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100"
          >
            Tutup
          </button>
        </div>

        <div className="px-6 py-5">
          {isSubmitted ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center">
              <p className="text-lg font-semibold text-emerald-800">Permintaan diterima</p>
              <p className="mt-2 text-sm text-emerald-700">Tim operasional akan menghubungi Anda maksimal 1 x 24 jam.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nama</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                  placeholder="Nama lengkap"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Nomor WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                    placeholder="08xx"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Estimasi berat (kg)</label>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.weight}
                    onChange={(event) => setForm({ ...form, weight: event.target.value })}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Jenis sampah</label>
                <select
                  required
                  value={form.wasteType}
                  onChange={(event) => setForm({ ...form, wasteType: event.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                >
                  <option value="">Pilih jenis sampah</option>
                  {wasteCatalog.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Alamat lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                  placeholder="Jalan, nomor rumah, RT/RW"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Catatan (opsional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                  placeholder="Contoh: akses masuk dari gerbang timur"
                />
              </div>

              <div className="rounded-2xl bg-stone-100 p-3 text-sm">
                <p className="text-stone-600">Estimasi reward</p>
                <p className="mt-1 text-xl font-semibold text-emerald-800">Rp {estimatedReward.toLocaleString("id-ID")}</p>
                <p className="mt-1 text-xs text-stone-500">Nominal final mengikuti hasil timbang di lokasi.</p>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Kirim Permintaan
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
