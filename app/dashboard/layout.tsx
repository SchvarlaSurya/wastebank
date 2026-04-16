import DashboardNavigation from './DashboardNavigation';
import { UserButton } from '@clerk/nextjs';
import NotificationBell from './NotificationBell';
import { evaluateBadges } from '@/app/actions/badges';
import { getRewardsStatus } from '@/app/actions/rewards';
import BadgePopup from '@/app/components/BadgePopup';
import RewardToastAnnouncer from '@/app/components/RewardToastAnnouncer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const evaluateRes = await evaluateBadges();
  const newlyUnlocked = evaluateRes.success ? evaluateRes.badgesUnlocked : [];
  
  const rewardsRes = await getRewardsStatus();
  const claimableCount = rewardsRes.success ? rewardsRes.claimableCount : 0;

  return (
    <div className="flex min-h-screen bg-stone-50/50 relative overflow-hidden">
      {/* Kaca / Ambient Backgrounds Desktop */}
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-amber-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      <DashboardNavigation claimableCount={claimableCount} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header for Desktop */}
        <header className="hidden h-16 items-center justify-end border-b border-white/50 bg-white/40 backdrop-blur-xl px-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] md:flex sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="text-sm border border-emerald-100 bg-emerald-50/50 backdrop-blur-md rounded-full px-4 py-1 text-stone-500 mr-2 shadow-sm">
               Status: <span className="font-bold text-emerald-700">Aktif</span>
            </div>
            <NotificationBell />
            <div className="h-6 w-px bg-stone-200"></div>
            <UserButton />
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-6 md:p-8 md:pt-8 w-full max-w-[100vw]">
          {children}
        </main>
      </div>

      {newlyUnlocked && newlyUnlocked.length > 0 && <BadgePopup badges={newlyUnlocked} />}
      <RewardToastAnnouncer claimableCount={claimableCount} />
    </div>
  );
}
