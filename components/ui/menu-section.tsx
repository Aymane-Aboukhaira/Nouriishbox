"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { useMealsStore } from "@/lib/store";
import type { Meal } from "@/lib/types";

// ─── Filters ──────────────────────────────────────────────────────────────────
const FILTERS = ["Featured", "Keto", "Vegan", "Protein"];

// Masonry vertical offsets — alternating heights so the grid feels editorial
const OFFSETS = [0, 32, 16, 48, 8, 40, 24, 56];

// BG tints per meal slot (placeholder colours)
const PHOTO_COLORS = [
  "#C4602A", "#3D5C4E", "#2C3E2D", "#E2725B",
  "#8B5545", "#4A7C68", "#1A3A2A", "#D4744A",
];

// ─── Simplified Meal Card ─────────────────────────────────────────────────────
function MealCard({
  meal,
  index,
  onAddToPlate,
}: {
  meal: Meal;
  index: number;
  onAddToPlate: (name: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ marginTop: OFFSETS[index % OFFSETS.length] }}
      className="relative"
    >
      {/* Green glow behind card on hover */}
      <div
        className="absolute -inset-4 rounded-none transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: hovered ? 1 : 0,
          background: "radial-gradient(ellipse at center, rgba(44,62,45,0.35) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: hovered ? -6 : 0,
          boxShadow: hovered 
            ? "0 12px 40px rgba(44,62,45,0.12)" 
            : "0 4px 20px rgba(44,62,45,0.04)"
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer overflow-hidden relative group rounded-[20px] bg-[#F5F0E8]"
      >
        {/* Photo */}
        <div
          className="w-full aspect-[4/3] overflow-hidden relative rounded-t-[20px]"
          style={{ backgroundColor: PHOTO_COLORS[index % PHOTO_COLORS.length] }}
        >
          <motion.div
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full relative transform-origin-center"
          >
            {meal.image_url ? (
              <Image 
                src={meal.image_url}
                alt={meal.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">{meal.emoji}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Card body */}
        <div
          className="p-6 flex flex-col gap-3 relative rounded-b-[20px] transition-colors duration-400"
          style={{ backgroundColor: hovered ? "#2C3E2D" : "#F5F0E8" }}
        >
          <h3
            className="font-serif font-semibold text-xl leading-tight capitalize transition-colors duration-400"
            style={{ color: hovered ? "#F5F0E8" : "#1A1A1A" }}
          >
            {meal.name}
          </h3>

          <div className="flex flex-wrap gap-2">
            {meal.tags.map((tag) => {
              const bg = tag === "Featured" ? "bg-[#C4602A]/15 text-[#C4602A]" : "bg-[#6BC4A0]/15 text-[#2C3E2D]";
              const hoverBg = tag === "Featured" ? "bg-[#C4602A]/20 text-[#F5F0E8]" : "bg-[#6BC4A0]/20 text-[#F5F0E8]";
              return (
                <span
                  key={tag}
                  className={`px-2.5 py-0.5 text-[10px] font-sans font-medium capitalize tracking-wide rounded-[100px] transition-colors duration-400 ${hovered ? hoverBg : bg}`}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div
            className="flex flex-col gap-2 pt-4 border-t mt-1 transition-colors duration-400"
            style={{ borderColor: hovered ? "#3D5C4E" : "rgba(44,62,45,0.1)" }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-xs font-sans font-bold tracking-wide transition-colors duration-400"
                style={{ color: hovered ? "#F5F0E8" : "#1A1A1A" }}
              >
                {meal.macros.kcal} kcal
              </span>
              <div className="flex text-[#C4602A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
            </div>
            
            {/* Full Macros Display */}
            <div className="grid grid-cols-3 gap-1">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: hovered ? "#A8E6CF" : "#2F8B60" }}>PRO</span>
                <span className="text-[11px] font-black" style={{ color: hovered ? "#F5F0E8" : "#1A1A1A" }}>{meal.macros.protein_g}g</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: hovered ? "#FFE5A0" : "#C4602A" }}>GLU</span>
                <span className="text-[11px] font-black" style={{ color: hovered ? "#F5F0E8" : "#1A1A1A" }}>{meal.macros.carbs_g}g</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: hovered ? "#FFD3B6" : "#E2725B" }}>LIP</span>
                <span className="text-[11px] font-black" style={{ color: hovered ? "#F5F0E8" : "#1A1A1A" }}>{meal.macros.fats_g}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* ADD TO PLATE — liquid expand from below */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex justify-center pointer-events-none"
          style={{
            height: hovered ? "64px" : "0px",
            opacity: hovered ? 1 : 0,
            transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            alignItems: "flex-end"
          }}
        >
          <button
            onClick={() => onAddToPlate(meal.name)}
            className="w-full h-10 bg-[#3D5C4E] hover:bg-[#1A1A1A] text-[#F5F0E8] font-sans font-medium text-sm capitalize tracking-wide transition-colors duration-200 rounded-[100px] shadow-[0_4px_12px_rgba(26,26,26,0.3)] pointer-events-auto shrink-0 border border-[#F5F0E8]/10"
          >
            Ajouter
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Split-text reveal for the heading ────────────────────────────────────────
function SplitHeading({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 40%"],
  });
  const topY    = useTransform(scrollYProgress, [0, 1], ["-60%", "0%"]);
  const bottomY = useTransform(scrollYProgress, [0, 1], ["60%",  "0%"]);

  const words = text.split(" ");
  const mid = Math.ceil(words.length / 2);
  const topLine    = words.slice(0, mid).join(" ");
  const bottomLine = words.slice(mid).join(" ");

  return (
    <div ref={ref} className="overflow-hidden" aria-label={text}>
      <motion.div style={{ y: topY }} className="block">
        <span className="font-serif font-bold text-5xl md:text-7xl text-[#1A1A1A] capitalize tracking-tight leading-[0.9] block">
          {topLine}
        </span>
      </motion.div>
      <motion.div style={{ y: bottomY }} className="block">
        <span className="font-serif font-bold text-5xl md:text-7xl text-[#1A1A1A] capitalize tracking-tight leading-[0.9] block">
          {bottomLine}
        </span>
      </motion.div>
    </div>
  );
}

import { FloatingBackgroundIcons } from "./floating-background-icons";

// ─── Main section ─────────────────────────────────────────────────────────────
export function MenuSection({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const { meals } = useMealsStore();
  const [activeFilter, setActiveFilter] = useState("Featured");

  const filtered = useMemo(() => {
    // Determine the base set of meals to filter from
    const activeMeals = meals.filter(m => m.is_active);
    
    if (activeFilter === "Featured") {
       const featured = activeMeals.filter(m => m.tags.includes("Featured")).slice(0, 8);
       // Fallback: if no featured found (e.g. stale store), show first 8
       return featured.length > 0 ? featured : activeMeals.slice(0, 8);
    }
    
    const results = activeMeals.filter(m => 
      m.tags.some(t => t.toLowerCase() === activeFilter.toLowerCase()) || 
      m.category.toLowerCase() === activeFilter.toLowerCase()
    ).slice(0, 8);

    // Final fallback if specific filter is empty
    return results.length > 0 ? results : activeMeals.slice(0, 8);
  }, [meals, activeFilter]);

  if (meals.length === 0) return null;

  return (
    <section id="menu" className="py-32 px-6 relative bg-[#F5F0E8] overflow-hidden">

      {/* ── Random floating decorative icons ── */}
      <FloatingBackgroundIcons count={25} />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Section header ── */}
        <div className="text-center mb-16 flex flex-col items-center gap-10">
          <SplitHeading text="Les Plats Stars de Cette Semaine" />

          {/* Filter pills */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {FILTERS.map((filter) => (
              <motion.button
                key={filter}
                variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: "spring" } } }}
                onClick={() => setActiveFilter(filter)}
                className={`px-7 py-2.5 text-sm font-medium font-sans capitalize rounded-[100px] border transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-[#2C3E2D] text-[#F5F0E8] border-[#2C3E2D]"
                    : "bg-transparent border-[#2C3E2D]/20 text-[#1A1A1A] hover:bg-[#2C3E2D]/5"
                }`}
              >
                {filter === "Featured" ? "Sélection" : filter === "Keto" ? "Céto" : filter === "Vegan" ? "Végétalien" : filter === "Protein" ? "Protéiné" : filter}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* ── Desktop: staggered masonry grid ── */}
        <div className="hidden sm:block min-h-[600px]">
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            <AnimatePresence mode="popLayout">
              {filtered.map((meal, idx) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  index={idx}
                  onAddToPlate={(name) => console.log("Add:", name)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Mobile: horizontal snap carousel ── */}
        <div className="sm:hidden -mx-6 px-6">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {filtered.map((meal, idx) => (
              <div key={meal.id} className="snap-center shrink-0 w-[80vw]">
                <MealCard
                  meal={meal}
                  index={idx}
                  onAddToPlate={(name) => console.log("Add:", name)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-20 text-center">
          <button
            onClick={onNavigate}
            className="bg-transparent border border-[#C4602A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8] hover:border-[#1A1A1A] px-12 py-5 text-sm capitalize tracking-wide font-bold font-sans transition-all duration-300 rounded-full"
          >
            Explorer tous nos repas
          </button>
        </div>
      </div>
    </section>
  );
}
