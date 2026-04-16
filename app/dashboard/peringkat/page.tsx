"use client";

import { useWasteStore } from "@/store/useWasteStore";
import { useState, useEffect, useMemo } from "react";
import { getRegisteredUsers } from "@/app/actions/leaderboard";
import { useUser } from "@clerk/nextjs";

type Competitor = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
};

export default function LeaderboardPage() {
  const transactions = useWasteStore((state) => state.transactions);
  const { user, isLoaded } = useUser();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculaet my XP based on total weight deposited (1 kg = 50 XP)
  const myTotalWeight = transactions.reduce((acc, tx) => acc + tx.weight, 0);
  const myXP = myTotalWeight * 50;

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const data = await getRegisteredUsers();
        setCompetitors(data);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const leaderboardParams = useMemo(() => {
    if (!isLoaded) return { top10: [], myRank: 0 };

    let allUsers = [...competitors];
    const myId = user?.id || "me";

    // Ensure current user is in the list with accurate real-time XP
    const meIndex = allUsers.findIndex((u) => u.id === myId);
    if (meIndex >= 0) {
      allUsers[meIndex].xp = myXP;
      allUsers[meIndex].name = "Anda (Current User)";
    } else {
      allUsers.push({
        id: myId,
        name: "Anda (Current User)",
        xp: myXP,
        avatar: user?.imageUrl || "",
      });
    }

    // Sort descending by XP
    allUsers.sort((a, b) => b.xp - a.xp);
    // Take top 10
    const top10 = allUsers.slice(0, 10);
    const myRank = allUsers.findIndex((u) => u.id === myId) + 1;

    return { top10, myRank };
  }, [competitors, myXP, user, isLoaded]);

  const { top10, myRank } = leaderboardParams;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 flex items-center gap-2">
              🏆 Top Eco-Warriors
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Setor sampah rutin, kumpulkan XP, dan raih posisi puncak! Peringkat 1 setiap bulan akan mendapatkan hadiah eksklusif.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total XP Anda</span>
            <span className="text-2xl font-black text-emerald-600">{myXP} <span className="text-lg">XP</span></span>
            <span className="text-sm text-stone-500 font-medium mt-0.5">
              {isLoading || !isLoaded ? "Menghitung..." : `Peringkat #${myRank}`}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">Papan Peringkat Bulan Ini</h2>
              <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Top 10</span>
            </div>
            
            <div className="divide-y divide-stone-100">
              {isLoading || !isLoaded ? (
                <div className="flex justify-center items-center h-64 text-stone-400">
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full border-2 border-stone-300 border-t-emerald-500 animate-spin"></div>
                    Memuat daftar pemain asli...
                  </div>
                </div>
              ) : (
                top10.map((boardUser, index) => {
                  const isMe = boardUser.id === user?.id || boardUser.id === "me";
                  let rankStyle = "bg-stone-100 text-stone-500";
                  if (index === 0) rankStyle = "bg-yellow-400 text-yellow-900 shadow-md transform scale-110"; // Gold
                  else if (index === 1) rankStyle = "bg-stone-300 text-stone-700 shadow-sm"; // Silver
                  else if (index === 2) rankStyle = "bg-amber-600/30 text-amber-900 shadow-sm"; // Bronze
                  
                  return (
                    <div 
                      key={boardUser.id} 
                      className={`flex items-center justify-between px-6 py-4 transition-all duration-300 group hover:bg-stone-50 ${isMe ? 'bg-emerald-50/50 relative' : ''}`}
                    >
                      {isMe && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-lg"></div>}
                      
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs ring-2 ring-white z-10 ${rankStyle}`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          {boardUser.avatar ? (
                            <img src={boardUser.avatar} alt={boardUser.name} className={`h-10 w-10 rounded-full object-cover ${isMe ? 'ring-2 ring-emerald-500 shadow-sm' : ''}`} />
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${isMe ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-200 text-stone-600'}`}>
                              {boardUser.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold ${isMe ? 'text-emerald-900' : 'text-stone-800'} transition-colors group-hover:text-emerald-700`}>
                              {boardUser.name}
                            </span>
                            {isMe && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Anda</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`font-black ${isMe ? 'text-emerald-700' : 'text-stone-700 group-hover:text-stone-900'} text-lg`}>
                          {boardUser.xp} <span className="text-sm font-semibold opacity-70">XP</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-stone-900 p-6 text-white shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            {/* Dekorasi kilau cahaya */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl group-hover:bg-emerald-400/30 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 mb-4 ring-1 ring-emerald-500/30">
                Luminous Prize 🌟
              </span>
              <h3 className="text-xl font-bold tracking-tight mb-2 text-white">Reward Peringkat #1</h3>
              <p className="text-sm text-stone-400 mb-5 leading-relaxed">Pemain di posisi puncak pada akhir bulan akan memenangkan merchandise esklusif kami.</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-stone-300">
                  <span className="text-emerald-400">✓</span> T-Shirt "Eco-Warrior" Gratis
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-300">
                  <span className="text-emerald-400">✓</span> Bonus Saldo Rp 100.000
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-300">
                  <span className="text-emerald-400">✓</span> Badge Digital Emas
                </li>
              </ul>
              
              <button className="w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-900/20">
                Cara Mengumpulkan XP
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
             <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Level System Info
              </h3>
              <div className="mt-3 space-y-3 text-sm text-emerald-800">
                <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2">
                  <span>1 kg Plastik</span>
                  <span className="font-bold">+50 XP</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2">
                  <span>1 kg Kardus</span>
                  <span className="font-bold">+35 XP</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2">
                  <span>Login Harian</span>
                  <span className="font-bold">+10 XP</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
