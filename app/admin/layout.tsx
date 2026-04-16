import AdminNavigation from "./AdminNavigation";
import { UserButton } from "@clerk/nextjs";

export const metadata = {
  title: "Admin Panel — WasteBank",
  description: "Panel administrasi WasteBank untuk manajemen nasabah, transaksi, dan inventory.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminNavigation />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header for Desktop */}
        <header className="hidden h-16 items-center justify-between border-b border-stone-200 bg-white px-8 md:flex">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-stone-500">
              Role: <span className="font-semibold text-stone-800">Administrator</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-stone-500 mr-2">
              Status: <span className="font-medium text-emerald-700">Online</span>
            </div>
            <UserButton />
          </div>
        </header>

        {/* Admin Pages Content */}
        <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-6 md:p-8 md:pt-8 w-full max-w-[100vw]">
          {children}
        </main>
      </div>
    </div>
  );
}
