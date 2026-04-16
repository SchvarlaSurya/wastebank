"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Animasi Variasi: Bergerak pelan dari bawah ke atas dengan blur memudar
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 15,
      filter: "blur(5px)",
      scale: 0.99
    },
    enter: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom kubik bezier yang elegan (mirip iOS)
      }
    }
  };

  return (
    // Unique key membuat Next.js "me-render ulang" div ini setiap pindah URL
    // sehingga animasi masuk akan selalu berputar
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="enter"
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
