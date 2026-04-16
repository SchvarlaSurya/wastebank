"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getLandingStats } from "@/app/actions/landing";
import LandingPickupModal from "@/app/components/LandingPickupModal";
import OpenPickupButton from "@/app/components/OpenPickupButton";
import { wasteCatalog, categoryLabel } from "@/lib/catalog";

interface Stats {
  totalPickups: number;
  totalTonnageBulanIni: number;
  topWastes: { type: string; total_weight: number }[];
}

function AnimatedCounter({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, hasStarted]);

  return (
    <span ref={ref}>
      {count.toLocaleString("id-ID")}{suffix}
    </span>
  );
}

function WasteBar({ waste, maxWeight, delay }: { waste: { type: string; total_weight: number }; maxWeight: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const timeout = setTimeout(() => {
      setWidth((waste.total_weight / maxWeight) * 100);
    }, delay);

    return () => clearTimeout(timeout);
  }, [hasStarted, waste.total_weight, maxWeight, delay]);

  const catalogRef = wasteCatalog.find(c => c.name === waste.type) || wasteCatalog[0];

  return (
    <div ref={ref} className="group">
      <div className="flex justify-between items-end mb-2">
        <span className="font-medium text-stone-800">{waste.type}</span>
        <span className="text-sm text-stone-600">{(waste.total_weight / 1000).toFixed(1)} ton</span>
      </div>
      <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
        Rp {catalogRef.pricePerKg.toLocaleString("id-ID")} / kg
      </div>
    </div>
  );
}

function FloatingTrash({ delay, duration, x, type }: { delay: number; duration: number; x: string; type: "bottle" | "paper" | "plastic" }) {
  return (
    <div
      className={`absolute text-4xl opacity-20 animate-float ${x}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {type === "bottle" && "🫙"}
      {type === "paper" && "📄"}
      {type === "plastic" && "🥤"}
    </div>
  );
}

export default function StorytellingHome() {
  const [stats, setStats] = useState<Stats>({
    totalPickups: 0,
    totalTonnageBulanIni: 0,
    topWastes: [],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLandingStats().then((data) => {
      setStats(data);
      setLoaded(true);
    });
  }, []);

  const displayTopWastes = stats.topWastes.length > 0
    ? stats.topWastes.slice(0, 5)
    : wasteCatalog.slice(0, 5).map(w => ({ type: w.name, total_weight: 0 }));

  const maxWeight = Math.max(...displayTopWastes.map(w => w.total_weight), 1);

  // Indonesia waste statistics (based on official data)
  const indonesiaWastePerDay = 175000; // tons per day
  const recycledPercent = 12; // only 12% recycled
  const organicPercent = 41; // organic waste percentage

  return (
    <main className="bg-stone-50 text-stone-900 overflow-x-hidden">
      {/* Hero Section - The Problem */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingTrash delay={0} duration={15} x="left-[10%]" type="bottle" />
          <FloatingTrash delay={3} duration={18} x="left-[25%]" type="plastic" />
          <FloatingTrash delay={5} duration={20} x="left-[45%]" type="paper" />
          <FloatingTrash delay={2} duration={16} x="left-[60%]" type="bottle" />
          <FloatingTrash delay={7} duration={22} x="left-[75%]" type="plastic" />
          <FloatingTrash delay={4} duration={19} x="left-[90%]" type="paper" />
        </div>

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-stone-900/50" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Opening hook */}
          <p className="text-emerald-400 text-sm sm:text-base font-medium tracking-[0.2em] uppercase mb-6 animate-fade-in">
            Fakta yang Perlu Kita Sadari
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
            Setiap Hari, Indonesia
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Menghasilkan {indonesiaWastePerDay.toLocaleString("id-ID")} Ton
            </span>
            <br />
            Sampah
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Bayangkan. Tumpukan sampah setinggi gunung. Mencemari tanah, laut, dan udara yang kita hirup.
            <br className="hidden sm:block" />
            <span className="text-emerald-400 font-semibold">Hanya {recycledPercent}%</span> yang berhasil didaur ulang.
          </p>

          {/* Animated stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-2">
                {indonesiaWastePerDay.toLocaleString("id-ID")}
              </div>
              <div className="text-stone-300 text-sm sm:text-base">Ton sampah per hari</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-bold text-amber-400 mb-2">
                {recycledPercent}%
              </div>
              <div className="text-stone-300 text-sm sm:text-base">Yang didaur ulang</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-bold text-rose-400 mb-2">
                {100 - recycledPercent}%
              </div>
              <div className="text-stone-300 text-sm sm:text-base">Terbuang sia-sia</div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce">
            <svg className="w-6 h-6 mx-auto text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* The Local Impact Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-stone-700 to-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Dampak di Sekitar Kita
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6">
              Sampah Bukan Hanya Angka
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Setiap ton sampah yang tidak terkelola adalah peluang yang terbuang.
              <br />
              Tapi perubahan dimulai dari langkah kecil.
            </p>
          </div>

          {/* Local community stats */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Impact visualization */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="text-emerald-200 text-sm font-medium mb-2">Kontribusi Komunitas WasteBank</div>
                <div className="text-5xl sm:text-6xl font-bold mb-4">
                  <AnimatedCounter target={Math.round(stats.totalTonnageBulanIni * 100) / 100} duration={2500} suffix=" ton" />
                </div>
                <div className="text-emerald-100 mb-6">Sampah terpilah bulan ini</div>

                <div className="border-t border-white/20 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold">
                      <AnimatedCounter target={stats.totalPickups} duration={2000} suffix="+" />
                    </div>
                    <div className="text-emerald-200 text-sm">Pickup berhasil</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-400/30 rounded-full blur-2xl" />
            </div>

            {/* Right: Top waste types with animated bars */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200">
              <h3 className="text-xl font-bold text-stone-900 mb-2">Sampah Paling Sering Disetor</h3>
              <p className="text-stone-500 text-sm mb-6">Data dari komunitas WasteBank</p>

              <div className="space-y-6">
                {displayTopWastes.map((waste, idx) => (
                  loaded && waste.total_weight > 0 ? (
                    <WasteBar key={waste.type} waste={waste} maxWeight={maxWeight} delay={idx * 200} />
                  ) : (
                    <div key={waste.type} className="opacity-50">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-medium text-stone-800">{waste.type}</span>
                        <span className="text-sm text-stone-600">Menunggu data</span>
                      </div>
                      <div className="h-3 bg-stone-200 rounded-full" />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Solusi Dimulai Dari Sini
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6">
              WasteBank: Mengubah Masalah Jadi Berkah
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Kami percaya sampah bukan sekadar limbah. Sampah adalah sumber daya yang menunggu untuk dikelola dengan benar.
            </p>
          </div>

          {/* Solution cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏠",
                title: "Pickup Rumah Tangga",
                desc: "Jadwalkan pickup langsung dari rumah. Tidak perlu repot mengantar ke bank sampah.",
                stat: "Mudah",
              },
              {
                icon: "💰",
                title: "Reward Transparan",
                desc: "Dapat bayaran fair untuk setiap kg sampah terpilah. Saldo masuk langsung ke akun.",
                stat: "Adil",
              },
              {
                icon: "🌱",
                title: "Dampak Terukur",
                desc: "Lacak kontribusi Anda untuk lingkungan. Setiap kg berarti bagi bumi.",
                stat: "Berkah",
              },
            ].map((card, idx) => (
              <div
                key={card.title}
                className="group relative bg-gradient-to-b from-stone-50 to-white border border-stone-200 rounded-3xl p-8 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{card.title}</h3>
                <p className="text-stone-600 leading-relaxed mb-4">{card.desc}</p>
                <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
                  <span className="px-3 py-1 bg-emerald-100 rounded-full text-sm">{card.stat}</span>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-700 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Proses Sederhana
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900">
              3 Langkah Menuju Perubahan
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-500" />

            {[
              {
                step: "01",
                title: "Jadwalkan Pickup",
                desc: "Pilih jenis sampah dan estimasi berat. Tentukan waktu pickup yang nyaman untuk Anda.",
              },
              {
                step: "02",
                title: "Kurir Datang & Timbang",
                desc: "Kurir profesional datang, verifikasi, dan timbang sampah Anda dengan transparan.",
              },
              {
                step: "03",
                title: "Saldo Masuk",
                desc: "Reward langsung masuk ke akun. Lacak dampak Anda di dashboard pribadi.",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"} pl-20 md:pl-0`}>
                  <div className={`inline-block bg-white border border-stone-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow ${
                    idx % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                  } max-w-sm`}>
                    <div className="text-emerald-600 text-4xl font-bold mb-2">{item.step}</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-emerald-500 rounded-full -translate-x-1/2 border-4 border-white shadow" />

                {/* Empty space for other side */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Siap Jadi Bagian Perubahan?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan warga yang sudah mengubah sampah jadi berkah.
            Mulai hari ini, tanpa biaya pendaftaran.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OpenPickupButton className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors">
              Jadwalkan Pickup Pertama
            </OpenPickupButton>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/50 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Buat Akun Gratis
            </Link>
          </div>

          <p className="mt-8 text-emerald-200 text-sm">
            ✓ Tanpa biaya tersembunyi &nbsp;✓ Pickup terjadwal &nbsp;✓ Reward transparan
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-900 py-10 text-stone-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-5 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-medium">WasteBank Indonesia</p>
            <p className="mt-1 text-sm text-stone-400">Program pengelolaan sampah berbasis layanan jemput kawasan.</p>
          </div>
          <div className="text-sm text-stone-400">© 2026 WasteBank. All rights reserved.</div>
        </div>
      </footer>

      {/* Mounting the global Client form modal */}
      <LandingPickupModal />

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
            opacity: 0.3;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
