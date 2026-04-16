"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface UnlockedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function BadgePopup({ badges }: { badges: UnlockedBadge[] }) {
  const [queue, setQueue] = useState<UnlockedBadge[]>([]);

  useEffect(() => {
    if (badges && badges.length > 0) {
      setQueue(badges);
    }
  }, [badges]);

  const removeCurrent = () => {
    setQueue(prev => prev.slice(1));
  };

  if (queue.length === 0) return null;

  const currentBadge = queue[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        {/* Latar belakang redup */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm pointer-events-auto"
          onClick={removeCurrent}
        />
        
        {/* Kotak Pop-up Animasi */}
        <motion.div
          key={currentBadge.id}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ 
            scale: [0.8, 1.1, 1], 
            opacity: 1, 
            y: 0 
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1
          }}
          exit={{ scale: 0.8, opacity: 0, y: 50, transition: { duration: 0.2 } }}
          className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl pointer-events-auto"
        >
          <button 
            onClick={removeCurrent}
            className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3, damping: 15 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-5xl shadow-inner border-[6px] border-emerald-50 mb-6"
          >
            {currentBadge.icon}
          </motion.div>
          
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">
            Lencana Baru Terbuka!
          </h2>
          <h3 className="text-2xl font-black text-stone-900 mb-3 font-display">
            {currentBadge.name}
          </h3>
          <p className="text-stone-600 leading-relaxed text-sm">
            {currentBadge.description}
          </p>
          
          <button 
            onClick={removeCurrent}
            className="mt-8 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
          >
            Keren! Lanjut
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
