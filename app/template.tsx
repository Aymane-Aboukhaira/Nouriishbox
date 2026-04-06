"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#2C3E2D] pointer-events-none origin-bottom text-[#F5F0E8]"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      
      {/* We add AnimatePresence in layout or rely on layout transitions, but Next.js templates run once per route change. The exit animation might need specific handling, but the mount animation will definitely slide up perfectly. */}
      {children}
    </>
  );
}
