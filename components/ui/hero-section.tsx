"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, Flame, Truck, PauseCircle } from "lucide-react";
import { FloatingBackgroundIcons } from "./floating-background-icons";

// ─── Marquee content (duplicated so it truly loops seamlessly) ────────────────
const TICKER =
  "Nutrition Personnalisée · Livré à Tanger · Zéro Devins · Macros Calculées · Préparé par un Chef · +150K Repas · ";

// ─── Feature pills ────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Leaf, label: "À la Carte" },
  { Icon: Flame, label: "Frais Chaque Jour" },
  { Icon: PauseCircle, label: "Pause Arbitraire" },
  { Icon: Truck, label: "Livraison Gratuite" },
];

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Dynamic Headline generation to preserve staggered animations and highlight
  const rawTitle = "La Nutrition Pensée Pour Vous, Livrée Directement Chez Vous.";
  const WORDS = rawTitle.split(" ").map(text => ({
    text,
    accent: /you|vous|لك/i.test(text)
  }));

  // Parallax: photo scales up as you scroll down
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#F5F0E8]"
    >
      {/* ── Random floating decorative icons ── */}
      <FloatingBackgroundIcons count={8} />
      {/* ── Animated grain / noise texture overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          animation: "grain 8s steps(10) infinite",
        }}
      />

      {/* ── Main content grid ── */}
      <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 md:px-12 lg:px-16 pt-36 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 items-center">

        {/* LEFT ── Typography + CTA */}
        <div className="flex flex-col">

          {/* ── Massive staggered headline ── */}
          <motion.h1
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="font-serif font-bold leading-[1.1] tracking-tight text-[clamp(48px,6vw,80px)] flex flex-wrap gap-x-[0.2em]"
            aria-label={rawTitle}
          >
            {WORDS.map(({ text, accent }, i) => (
              <motion.span
                key={i}
                className={`inline-block overflow-hidden ${accent ? "text-[#C4602A]" : "text-[#1A1A1A]"}`}
                variants={{ hidden: {}, show: {} }}
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "110%", opacity: 0 },
                    show: {
                      y: "0%",
                      opacity: 1,
                      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: i * 0.07 },
                    },
                  }}
                >
                  {text}
                </motion.span>
              </motion.span>
            ))}
          </motion.h1>

          {/* ── Sub-copy ── */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.55 }}
            className="mt-8 text-[18px] text-[#1A1A1A] max-w-md leading-[1.7] font-sans"
          >
            Nous utilisons des algorithmes cliniques et des chefs experts pour adapter vos repas exactement aux besoins de votre corps.
          </motion.p>

          {/* ── CTA Button ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.5 }}
            className="mt-10 group"
          >
            <button
              onClick={onStart}
              className="relative overflow-hidden w-full sm:w-auto bg-[#2C3E2D] text-[#F5F0E8] px-12 py-5 text-base font-medium tracking-wide flex items-center justify-center gap-4 border border-[#2C3E2D] hover:border-[#1A1A1A] transition-colors duration-300 rounded-[100px]"
            >
              <span className="relative z-10">COMMENCER</span>
              <motion.span
                className="relative z-10 inline-flex rtl:rotate-180"
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight size={20} />
              </motion.span>
            </button>
          </motion.div>

          {/* ── Soft feature row ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 1.4 } } }}
            className="mt-14 flex flex-wrap gap-4"
          >
            {FEATURES.map(({ Icon, label }, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F5F0E8] border border-[#2C3E2D]/10 rounded-[100px] shadow-sm"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                  },
                }}
              >
                <Icon size={18} className="text-[#C4602A]" strokeWidth={2} />
                <span className="font-sans text-[11px] sm:text-xs text-[#1A1A1A] font-medium tracking-tight">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT ── Soft-masked photo + Floating Macro Card */}
        <motion.div
          className="flex items-center justify-center lg:justify-end relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        >
          {/* Photo container */}
          <div
            className="relative"
            style={{ width: "min(480px, 90vw)", aspectRatio: "1 / 1" }}
          >
            {/* Soft-rounded Photo */}
            <motion.div
              style={{
                scale: photoScale,
              }}
              className="w-full h-full rounded-[24px] overflow-hidden shadow-2xl relative z-0"
            >
              <Image 
                src="/HeroWomenPicture.png"
                alt="Personalized Nutrition"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Floating Container (Closed Box) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, x: -40 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                x: 0,
                y: [0, -15, 0],
              }}
              transition={{ 
                delay: 0.8, 
                duration: 4, 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { delay: 0.8, duration: 0.8, type: "spring" },
                opacity: { delay: 0.8, duration: 0.8 }
              }}
              className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-10 md:-left-20 z-10 w-48 sm:w-64 md:w-80 pointer-events-none drop-shadow-[0_40px_80px_rgba(26,26,26,0.25)] hidden xs:block"
            >
              <div className="relative w-full h-full">
                <Image 
                  src="/ContainerPhoto.png"
                  alt="Nourishbox Container"
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Horizontal marquee ticker ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="relative z-10 w-full overflow-hidden border-t border-[#C4602A] mt-4"
      >
        <div className="py-3 flex whitespace-nowrap">
          {/* Two copies side-by-side for the seamless loop */}
          <span className="animate-marquee flex-shrink-0 text-[#C4602A] font-bold text-xs sm:text-sm tracking-[0.2em] capitalize">
            <span>{TICKER}{TICKER}</span>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
