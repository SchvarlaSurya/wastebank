"use client";

import { useState } from "react";

export default function TarikSaldoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    method: "bank_transfer",
    accountNumber: "",
    accountName: "",
    amount: ""
  });

  // Contoh saldo dummy (normalnya ditarik dari database / global state)
  const availableBalance = 875000;

  const getAmountNumber = (amountString: string) => {
    return Number(amountString.replace(/[^0-9]/g, ''));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, amount: rawVal });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawValue = getAmountNumber(form.amount);

    if (withdrawValue < 50000) {
      alert("Minimal penarikan adalah Rp 50.000");
      return;
    }
    if (withdrawValue > availableBalance) {
      alert("Saldo tidak mencukupi!");
      return;
    }

    setIsSubmitting(true);
    // Mocking API call for withdrawal
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setForm({ method: "bank_transfer", accountNumber: "", accountName: "", amount: "" });

      // remove success banner after 4s
      setTimeout(() => setIsSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <header className="flex flex-col gap-1 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
            <h1 className="text-2xl font-semibold text-stone-900">Tarik Saldo Reward</h1>
            <p className="text-sm text-stone-600">Pindahkan saldo WasteBank Anda ke rekening bank atau e-wallet pilihan.</p>
          </header>

          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm p-5 sm:p-7">
            {isSuccess ? (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-lg font-semibold text-emerald-800">Penarikan Berhasil Diajukan</p>
                <p className="mt-2 text-sm text-emerald-700">Dana sedang diproses dan akan masuk ke rekening Anda maksimal 1x24 jam kerja.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Metode Penarikan</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="bank_transfer">Transfer Bank (BCA, Mandiri, BNI, dll)</option>
                    <option value="gopay">GoPay</option>
                    <option value="dana">DANA</option>
                    <option value="ovo">OVO</option>
                    <option value="shopeepay">ShopeePay</option>
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Nama Pemilik Akun / Rekening</label>
                    <input
                      required
                      type="text"
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      placeholder="Nama di buku tabungan/akun"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Nomor Rekening / HP</label>
                    <input
                      required
                      type="tel"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      placeholder="Contoh: 0812xxxx atau 7310xxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Nominal Penarikan (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 text-sm font-medium">Rp</span>
                    <input
                      required
                      type="text"
                      value={form.amount ? Number(form.amount).toLocaleString("id-ID") : ""}
                      onChange={handleAmountChange}
                      className="w-full rounded-xl border border-stone-300 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      placeholder="50.000"
                    />
                  </div>
                  <p className="mt-1 text-xs text-stone-500">Minimal penarikan Rp 50.000 tanpa potong pajak.</p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !form.amount}
                    className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Memproses Transaksi..." : "Tarik Dana Sekarang"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-stone-900 p-5 shadow-sm sm:p-6 text-white">
            <p className="text-sm font-medium text-stone-400">Total Saldo Tersedia</p>
            <p className="mt-2 text-3xl font-semibold">Rp {availableBalance.toLocaleString("id-ID")}</p>
            <div className="mt-5 border-t border-stone-700 pt-4">
              <p className="text-xs text-stone-400">Gunakan sisa kuota dengan bijak, tidak ada potongan biaya administrasi bulanan.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informasi Penting
            </h3>
            <ul className="mt-3 text-sm text-emerald-800 space-y-2 list-disc list-inside">
              <li>Penarikan diproses 1x24 jam kerja hari senin s/d jum&apos;at.</li>
              <li>Minimal penarikan e-wallet Rp 50k, sementara Bank Lokal Rp 100k.</li>
              <li>Awas penipuan! Verifikasi rekening via OTP Clerk.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
