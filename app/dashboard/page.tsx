import { auth, currentUser } from "@clerk/nextjs/server";
const transactions = [
  { id: "TX-2401", type: "Plastik Campur", weight: 7, reward: 29400, date: "15 April 2026" },
  { id: "TX-2392", type: "Kertas dan Kardus", weight: 11, reward: 30800, date: "12 April 2026" },
  { id: "TX-2388", type: "Logam Ringan", weight: 4, reward: 30400, date: "9 April 2026" },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Pengguna WasteBank";
  const email = user?.primaryEmailAddress?.emailAddress || "-";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
          <div>
            <p className="text-sm text-stone-500">Dashboard pengguna</p>
            <h1 className="text-2xl font-semibold text-stone-900">Selamat datang, {fullName}</h1>
            <p className="mt-1 text-sm text-stone-600">{email}</p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Saldo tersedia</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-800">Rp 875.000</p>
          </article>
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Total pickup selesai</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-800">36 kali</p>
          </article>
          <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Sampah terkelola</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-800">156 kg</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-stone-900">Transaksi terbaru</h2>
            <p className="text-sm text-stone-600">Riwayat setoran terakhir yang sudah terverifikasi.</p>
          </div>
          <div className="divide-y divide-stone-200">
            {transactions.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="font-semibold text-stone-900">{item.type}</p>
                  <p className="text-sm text-stone-600">
                    {item.date} - {item.weight} kg - {item.id}
                  </p>
                </div>
                <p className="font-semibold text-emerald-800">+ Rp {item.reward.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
  );
}
