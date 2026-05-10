"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useMealsStore } from "@/lib/store";
import { MealCard } from "@/components/ui/meal-card";
import { useState } from "react";
import { Search, ArrowRight, Flame, Leaf, Wheat, Fish } from "lucide-react";
import type { MealCategory } from "@/lib/types";

const CATEGORIES: { value: "all" | MealCategory; label: string; emoji: string }[] = [
  { value: "all", label: "Tous", emoji: "✨" },
  { value: "breakfast", label: "Petit-déj", emoji: "☀️" },
  { value: "lunch", label: "Déjeuner", emoji: "🥗" },
  { value: "dinner", label: "Dîner", emoji: "🌙" },
  { value: "snack", label: "Collation", emoji: "⚡" },
];

export default function PublicMenuPage() {
  const router = useRouter();
  const { meals } = useMealsStore();
  const [activeCategory, setActiveCategory] = useState<"all" | MealCategory>("all");
  const [search, setSearch] = useState("");

  const filtered = meals
    .filter((m) => m.is_active)
    .filter((m) => activeCategory === "all" || m.category === activeCategory)
    .filter(
      (m) =>
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

  const dietFilters = [
    { label: "Protéiné", icon: Flame, count: meals.filter((m) => m.tags.includes("high-protein")).length },
    { label: "Végétalien", icon: Leaf, count: meals.filter((m) => m.is_vegan).length },
    { label: "Sans Gluten", icon: Wheat, count: meals.filter((m) => m.tags.includes("gluten-free")).length },
    { label: "Poisson", icon: Fish, count: meals.filter((m) => m.tags.includes("fish")).length },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-[140px] pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C3E2D]/5 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Notre Menu</span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4">
            Frais. Local. <span className="text-[#C4602A]">Délicieux.</span>
          </h1>
          <p className="text-lg text-[#6B6B6B] font-sans max-w-xl mx-auto mb-10">
            Plus de {meals.filter((m) => m.is_active).length} plats préparés chaque semaine par nos chefs à Tanger. Chaque repas est portionné selon vos macros exactes.
          </p>
        </motion.div>

        {/* Diet quick-stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto mb-10">
          {dietFilters.map((df, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8E3DB] shadow-sm">
              <df.icon size={16} className="text-[#C4602A]" />
              <span className="text-sm font-bold text-[#1A1A1A]">{df.label}</span>
              <span className="text-xs text-[#9C9C9C] font-sans">({df.count})</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="sticky top-[88px] z-30 bg-[#FFF8F4]/80 backdrop-blur-xl border-b border-[#E8E3DB] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
            <input
              type="text"
              placeholder="Rechercher un plat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-[#E8E3DB] text-sm text-[#1A1A1A] placeholder:text-[#9C9C9C] outline-none focus:border-[#6BC4A0] transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? "bg-[#2C3E2D] text-[#F5F0E8] shadow-md"
                    : "bg-white text-[#6B6B6B] border border-[#E8E3DB] hover:border-[#D4C9BE]"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="text-[#D4C9BE] mb-4" size={56} />
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">Aucun plat trouvé</h3>
            <p className="text-[#6B6B6B] text-sm mb-4">Essayez un autre mot-clé ou catégorie</p>
            <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="px-6 py-2 border-2 border-[#E8E3DB] text-[#1A1A1A] font-bold rounded-full hover:border-[#D4C9BE]">Tout afficher</button>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((meal, idx) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: idx * 0.03, duration: 0.5 }}
              >
                <MealCard meal={meal} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#2C3E2D] rounded-[3rem] py-16 px-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4602A]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="font-serif text-4xl text-[#F5F0E8] mb-4 relative z-10">Prêt à goûter ?</h2>
          <p className="text-lg text-[#F5F0E8]/60 max-w-xl mx-auto mb-10 font-sans relative z-10">
            Créez votre profil en 2 minutes et recevez un menu personnalisé basé sur vos objectifs.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/onboarding")}
            className="bg-[#C4602A] text-[#F5F0E8] px-10 py-5 rounded-full text-lg font-bold shadow-lg hover:bg-[#A04F22] transition-colors flex items-center gap-3 mx-auto relative z-10"
          >
            Commencer gratuitement <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      <PublicFooter />

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
