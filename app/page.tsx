"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type WasteCategory = "anorganik" | "organik" | "khusus";

interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  pricePerKg: number;
}

interface PickupFormData {
  name: string;
  phone: string;
  address: string;
  wasteType: string;
  weight: string;
  notes: string;
}

const wasteCatalog: WasteItem[] = [
  { id: "plastic", name: "Plastik Campur", category: "anorganik", pricePerKg: 4200 },
  { id: "paper", name: "Kertas dan Kardus", category: "anorganik", pricePerKg: 2800 },
  { id: "metal", name: "Logam Ringan", category: "anorganik", pricePerKg: 7600 },
  { id: "organic", name: "Sisa Organik Kering", category: "organik", pricePerKg: 1700 },
  { id: "battery", name: "Baterai Rumah Tangga", category: "khusus", pricePerKg: 9800 },
  { id: "electronics", name: "Elektronik Kecil", category: "khusus", pricePerKg: 13200 },
];

const categoryLabel: Record<WasteCategory, string> = {
  anorganik: "Anorganik",
  organik: "Organik",
  khusus: "Khusus",
};

const initialForm: PickupFormData = {
  name: "",
  phone: "",
  address: "",
  wasteType: "",
  weight: "",
  notes: "",
};

export default function Home() {
  const [openPickup, setOpenPickup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<PickupFormData>(initialForm);

  const selectedWaste = useMemo(
    () => wasteCatalog.find((item) => item.name === form.wasteType),
    [form.wasteType],
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
      setOpenPickup(false);
      setForm(initialForm);
    }, 2500);
  };

  return (
    <main className="bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
              WB
            </span>
            <span className="font-semibold tracking-wide">WasteBank</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-stone-700 md:flex">
            <a href="#layanan" className="hover:text-emerald-800">Layanan</a>
            <a href="#harga" className="hover:text-emerald-800">Harga</a>
            <a href="#cara-kerja" className="hover:text-emerald-800">Cara Kerja</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100"
            >
              Masuk
            </Link>
            <button
              type="button"
              onClick={() => setOpenPickup(true)}
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Jadwalkan Pickup
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-stone-200">
        <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-amber-200/45 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-200/55 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-100">
              Solusi bank sampah kawasan
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Setor sampah dari rumah, dapat nilai yang jelas.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-700 sm:text-lg">
              WasteBank membantu warga dan UMKM mengelola sampah terpilah tanpa ribet. Kurir datang sesuai jadwal,
              timbangan transparan, dan saldo masuk ke akun Anda.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setOpenPickup(true)}
                className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Mulai Pickup Pertama
              </button>
              <Link
                href="/register"
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium transition hover:bg-stone-100"
              >
                Buat Akun Gratis
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-2xl font-semibold text-emerald-800">3.200+</p>
                <p className="mt-1 text-stone-600">Pickup selesai</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-2xl font-semibold text-emerald-800">12 ton</p>
                <p className="mt-1 text-stone-600">Terseleksi/bulan</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-2xl font-semibold text-emerald-800">24 jam</p>
                <p className="mt-1 text-stone-600">Respon rata-rata</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_24px_70px_-40px_rgba(28,25,23,0.55)] sm:p-7">
            <h2 className="text-lg font-semibold">Sampah yang paling sering disetor</h2>
            <p className="mt-1 text-sm text-stone-600">Harga estimasi per kilogram untuk area layanan aktif.</p>

            <div className="mt-5 space-y-3">
              {wasteCatalog.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-stone-600">Kategori {categoryLabel[item.category]}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-800">Rp {item.pricePerKg.toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-stone-900 p-4 text-sm text-stone-100">
              <p className="font-medium">Transparansi timbangan</p>
              <p className="mt-1 text-stone-300">Foto timbangan dan ringkasan transaksi dikirim otomatis ke dashboard akun Anda.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="layanan" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Pickup Rumah Tangga",
              desc: "Untuk setoran rutin mingguan. Cocok untuk perumahan dan apartemen.",
            },
            {
              title: "Pickup UMKM",
              desc: "Penjadwalan fleksibel untuk kafe, toko, dan usaha dengan volume menengah.",
            },
            {
              title: "Drop Point Komunitas",
              desc: "Aktivasi titik kumpul di RT/RW dengan rekap kontribusi tiap warga.",
            },
          ].map((service) => (
            <article key={service.title} className="rounded-3xl border border-stone-200 bg-white p-6">
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{service.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="border-y border-stone-200 bg-white/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold">Cara kerjanya sederhana</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              "Pilih jenis sampah dan estimasi berat di form pickup.",
              "Kurir datang, sampah diverifikasi, lalu ditimbang di lokasi.",
              "Saldo reward masuk otomatis, riwayat tersimpan di dashboard.",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">Langkah {index + 1}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="harga" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Daftar harga acuan</h2>
            <p className="mt-1 text-sm text-stone-600">Harga bisa menyesuaikan kondisi pasar daur ulang tiap minggu.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenPickup(true)}
            className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium hover:bg-stone-100"
          >
            Cek Estimasi Pickup
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-stone-100 text-left text-stone-700">
              <tr>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Harga / kg</th>
              </tr>
            </thead>
            <tbody>
              {wasteCatalog.map((item) => (
                <tr key={item.id} className="border-t border-stone-200">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-stone-600">{categoryLabel[item.category]}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-800">Rp {item.pricePerKg.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-stone-900 py-10 text-stone-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-5 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-medium">WasteBank Indonesia</p>
            <p className="mt-1 text-sm text-stone-400">Program pengelolaan sampah berbasis layanan jemput kawasan.</p>
          </div>
          <div className="text-sm text-stone-400">© 2026 WasteBank. All rights reserved.</div>
        </div>
      </footer>

      {openPickup && (
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
                onClick={() => setOpenPickup(false)}
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
      )}
    </main>
  );
}

