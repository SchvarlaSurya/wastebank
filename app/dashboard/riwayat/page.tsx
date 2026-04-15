import { auth } from "@clerk/nextjs/server";

export default async function RiwayatPage() {
  const { userId } = await auth();

  // Data dummy sederhana untuk riwayat
  const transactions = [
    { id: "TX-2401", type: "Plastik Campur", weight: 7, reward: 29400, date: "15 April 2026", status: "Selesai" },
    { id: "TX-2392", type: "Kertas dan Kardus", weight: 11, reward: 30800, date: "12 April 2026", status: "Selesai" },
    { id: "TX-2388", type: "Logam Ringan", weight: 4, reward: 30400, date: "9 April 2026", status: "Selesai" },
    { id: "TX-2380", type: "Minyak Jelantah", weight: 2, reward: 8000, date: "2 April 2026", status: "Selesai" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-1 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <h1 className="text-2xl font-semibold text-stone-900">Riwayat Pickup</h1>
        <p className="text-sm text-stone-600">Daftar seluruh setoran sampah Anda bersama WasteBank.</p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="divide-y divide-stone-200">
          {transactions.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="font-semibold text-stone-900">{item.type}</p>
                <p className="text-sm text-stone-600">
                  {item.date} - {item.weight} kg - {item.id}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  {item.status}
                </span>
              </div>
              <p className="font-semibold text-emerald-800">+ Rp {item.reward.toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
