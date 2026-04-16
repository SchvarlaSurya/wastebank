"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RewardToastAnnouncer({ claimableCount }: { claimableCount: number }) {
  const router = useRouter();
  const hasAnnounced = useRef(false);

  useEffect(() => {
    // Hindari spamming toast dengan mengecek sessionStorage
    // Jadi hanya muncul sekali per sesi (atau saat count bertambah)
    if (claimableCount > 0 && !hasAnnounced.current) {
      const storedCount = sessionStorage.getItem("announced_reward_count");
      
      if (storedCount !== claimableCount.toString()) {
        toast('🎉 Hadiah Baru Terbuka!', {
          description: `Anda memiliki ${claimableCount} hadiah EXP yang siap diklaim.`,
          action: {
            label: 'Klaim',
            onClick: () => router.push('/dashboard/rewards')
          },
          duration: 8000,
        });
        
        sessionStorage.setItem("announced_reward_count", claimableCount.toString());
        hasAnnounced.current = true;
      }
    }
  }, [claimableCount, router]);

  return null;
}
