import DashboardNavigation from './DashboardNavigation';
import { UserButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <DashboardNavigation />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header for Desktop */}
        <header className="hidden h-16 items-center justify-end border-b border-stone-200 bg-white px-8 md:flex">
          <div className="flex items-center gap-4">
            <div className="text-sm text-stone-500 mr-2">Status: <span className="font-medium text-emerald-700">Aktif</span></div>
            <UserButton />
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-6 md:p-8 md:pt-8 w-full max-w-[100vw]">
          {children}
        </main>
      </div>
    </div>
  );
}
