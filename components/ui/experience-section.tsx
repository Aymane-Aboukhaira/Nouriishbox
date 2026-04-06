"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    index: "01",
    title: "Your Personalized Macro Plan",
    desc:
      "We assign you a custom macro profile that perfectly aligns with your individual health goals — calculated using clinically validated equations, not guesswork.",
    photo: "#3D5C4E",
    image: "/OpenedBox.png",
    photoLabel: "Product Photo — Open Kraft Containers",
  },
  {
    index: "02",
    title: "Zero-Waste Sunday Lock",
    desc:
      "Lock your meals by Sunday for a zero-waste, sustainable delivery schedule the following week. Zero overproduction, zero compromise.",
    photo: "#C4602A",
    image: "/stackedboxes.png",
    photoLabel: "Photo — Sunday Prep Layout",
  },
];

// ─── SVG icon paths for each feature (hand-drawn feel) ───────────────────────
const ICON_PATHS = [
  // 01 — Macro dial
  "M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2zm0 3v7l5 3",
  // 02 — Calendar lock
  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
];

// ─── Animated SVG Icon ────────────────────────────────────────────────────────
function TracedIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="48"
      height="48"
      fill="none"
      stroke="#F5F0E8"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d={path}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Single feature strip ─────────────────────────────────────────────────────
function FeatureStrip({
  feature,
  iconPath,
  index,
  onEnter,
}: {
  feature: (typeof FEATURES)[0];
  iconPath: string;
  index: number;
  onEnter: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [iconActive, setIconActive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 30%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Curtain wipe reveal is a one-way trigger
    if (v > 0.1 && !revealed) {
      setRevealed(true);
    }
    
    // Toggle icon and update global active feature bidirectionally
    if (v > 0 && v < 1) {
      setIconActive(true);
      onEnter(index);
    } else {
      setIconActive(false);
    }
  });

  return (
    <div
      ref={ref}
      className="relative border-b border-[#3D5C4E] py-4"
    >
      {/* Pill hover container */}
      <div className="relative rounded-[100px] transition-colors duration-400 hover:bg-[#C4602A]/10 overflow-hidden">
        {/* Green curtain wipe — pulls left to reveal content */}
        <motion.div
          className="absolute inset-0 bg-[#2C3E2D] z-10 origin-right"
          initial={{ scaleX: 1 }}
          animate={revealed ? { scaleX: 0 } : { scaleX: 1 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Content */}
        <div className="py-12 md:py-16 px-8 md:px-16 flex flex-col md:flex-row items-start md:items-center gap-10 relative z-20">
          {/* Icon */}
          <div className="shrink-0 w-16 flex items-center justify-center">
            <TracedIcon path={iconPath} active={iconActive} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-[#F5F0E8] text-sm tracking-[0.2em] mb-3 uppercase">
              {feature.index}
            </p>
            <h3 className="font-serif font-bold text-3xl md:text-5xl text-[#F5F0E8] capitalize tracking-tight leading-[1] mb-5">
              {feature.title}
            </h3>
            <p className="text-[#F5F0E8]/80 font-sans font-normal text-base md:text-lg leading-[1.7] max-w-xl">
              {feature.desc}
            </p>
          </div>

          {/* Index number (decorative) */}
          <div className="shrink-0 hidden lg:block">
            <span className="font-serif text-[8rem] leading-none text-[#F5F0E8]/5 select-none">
              {feature.index}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function ExperienceSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // Parallax: photo floats upward on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative bg-[#2C3E2D] overflow-hidden text-[#F5F0E8]"
    >
      {/* ── Vertical title running up the left edge ── */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-16 z-20 items-center justify-center border-r border-[#3D5C4E]">
        <span
          className="font-sans font-semibold text-[#F5F0E8] text-xs tracking-[0.35em] uppercase whitespace-nowrap select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          YOUR NOURISHBOX EXPERIENCE
        </span>
      </div>

      {/* ── Inner layout: strips left + sticky photo right ── */}
      <div className="lg:pl-16 grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">

        {/* LEFT — scrollable feature strips */}
        <div>
          {FEATURES.map((feature, i) => (
            <FeatureStrip
              key={i}
              feature={feature}
              iconPath={ICON_PATHS[i]}
              index={i}
              onEnter={setActiveFeature}
            />
          ))}
        </div>

        {/* RIGHT — sticky crossfading photo */}
        <div className="hidden lg:flex sticky top-0 h-screen items-center justify-center overflow-hidden border-l border-[#3D5C4E]">
          <motion.div
            className="relative w-full h-full"
            style={{ y: photoY }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center p-10 gap-4"
                style={{ backgroundColor: FEATURES[activeFeature].photo }}
              >
                {/* Photo placeholder with soft 20px corners */}
                <div className="w-full h-full flex items-center justify-center border border-[#F5F0E8]/10 rounded-[20px] overflow-hidden relative">
                  {FEATURES[activeFeature].image ? (
                    <Image 
                      src={FEATURES[activeFeature].image}
                      alt={FEATURES[activeFeature].title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center px-8 relative z-10">
                      <span className="font-sans font-semibold text-[#F5F0E8] text-lg tracking-widest uppercase block mb-4">
                        {FEATURES[activeFeature].photoLabel}
                      </span>
                      {/* Floating feature number */}
                      <span className="font-serif text-9xl text-[#F5F0E8]/20 leading-none">
                        {FEATURES[activeFeature].index}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    i === activeFeature
                      ? "bg-[#C4602A] w-6"
                      : "bg-[#F5F0E8]/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
