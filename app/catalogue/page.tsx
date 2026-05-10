"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useMealsStore } from "@/lib/store";
import type { Meal, MealCategory } from "@/lib/types";
import {
  Search, ArrowRight, Flame, Droplets, Wheat, X,
  Clock, Leaf, ShieldCheck, ChefHat, Star, Filter,
  SlidersHorizontal, ChevronDown, Sparkles, Eye
} from "lucide-react";

const CAT_META: Record<MealCategory, { label: string; emoji: string; color: string; bg: string; desc: string }> = {
  breakfast: { label: "Petit-Déjeuner", emoji: "☀️", color: "#F59E0B", bg: "#FFF9DB", desc: "Commencez la journée avec énergie" },
  lunch: { label: "Déjeuner", emoji: "🥗", color: "#6BC4A0", bg: "#E8F7F1", desc: "Repas équilibrés pour votre journée" },
  dinner: { label: "Dîner", emoji: "🌙", color: "#B09AE0", bg: "#F0EDF9", desc: "Finissez la journée en beauté" },
  snack: { label: "Collations & Desserts", emoji: "⚡", color: "#C4602A", bg: "#FFF0EA", desc: "Gourmandises saines entre les repas" },
};

const TIER_INFO: Record<string, { label: string; color: string; bg: string }> = {
  budget: { label: "Budget", color: "#085041", bg: "#E1F5EE" },
  standard: { label: "Standard", color: "#3730A3", bg: "#EEF2FF" },
  premium: { label: "Premium", color: "#7C3AED", bg: "#F3EAFA" },
};

function MacroBar({ label, value, unit, color, max }: { label: string; value: number; unit: string; color: string; max: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-[#6B6B6B]">{label}</span>
        <span style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((value / max) * 100, 100)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

function DetailDrawer({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const cat = CAT_META[meal.category];
  const tier = TIER_INFO[meal.tier] ?? TIER_INFO.standard;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 28 }} onClick={e => e.stopPropagation()} className="relative z-10 bg-white rounded-t-[32px] md:rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Image */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-[32px] md:rounded-t-[32px]">
          <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition"><X size={20} /></button>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex gap-2 mb-3">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: cat.bg, color: cat.color }}>{cat.emoji} {cat.label}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: tier.bg, color: tier.color }}>{tier.label}</span>
              {meal.is_vegan && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8F7F1] text-[#085041]">🌱 Vegan</span>}
              {meal.is_gluten_free && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFF9DB] text-[#92620A]">GF</span>}
            </div>
            <h2 className="font-serif text-3xl text-white font-bold">{meal.emoji} {meal.name}</h2>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <p className="text-[#6B6B6B] font-sans leading-relaxed text-lg">{meal.description}</p>

          {/* Price + Time */}
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-2xl bg-[#E8F7F1] text-center">
              <p className="text-2xl font-bold text-[#085041]">{meal.price_mad} <span className="text-sm">MAD</span></p>
              <p className="text-[10px] text-[#085041]/60 font-bold uppercase tracking-wider mt-1">Prix</p>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-[#FFF0EA] text-center">
              <p className="text-2xl font-bold text-[#C4602A]">{meal.prep_time_min} <span className="text-sm">min</span></p>
              <p className="text-[10px] text-[#C4602A]/60 font-bold uppercase tracking-wider mt-1">Préparation</p>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-[#F0EDF9] text-center">
              <p className="text-2xl font-bold text-[#7C3AED]">{meal.macros.kcal}</p>
              <p className="text-[10px] text-[#7C3AED]/60 font-bold uppercase tracking-wider mt-1">Calories</p>
            </div>
          </div>

          {/* Macros */}
          <div>
            <h3 className="font-serif text-lg text-[#1A1A1A] mb-4">Valeurs Nutritionnelles</h3>
            <div className="space-y-3">
              <MacroBar label="Protéines" value={meal.macros.protein_g} unit="g" color="#6BC4A0" max={65} />
              <MacroBar label="Glucides" value={meal.macros.carbs_g} unit="g" color="#F59E0B" max={65} />
              <MacroBar label="Lipides" value={meal.macros.fats_g} unit="g" color="#C4602A" max={30} />
            </div>
          </div>

          {/* Allergens */}
          {meal.allergens.length > 0 && (
            <div>
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-3">Allergènes</h3>
              <div className="flex flex-wrap gap-2">
                {meal.allergens.map(a => <span key={a} className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FFF0EA] text-[#C4602A] border border-[#C4602A]/10 capitalize">{a}</span>)}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {meal.tags.map(t => <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAFAF7] border border-[#E8E3DB] text-[#6B6B6B]">{t}</span>)}
            {meal.is_halal && <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E8F7F1] text-[#085041]">☪️ Halal</span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CatalogueCard({ meal, onDetail }: { meal: Meal; onDetail: (m: Meal) => void }) {
  const cat = CAT_META[meal.category];
  const tier = TIER_INFO[meal.tier] ?? TIER_INFO.standard;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5 }} whileHover={{ y: -6 }} onClick={() => onDetail(meal)} className="group bg-white rounded-[24px] overflow-hidden border border-[#E8E3DB] shadow-sm hover:shadow-xl transition-all cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ background: cat.bg, color: cat.color }}>{cat.emoji} {cat.label}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ background: tier.bg, color: tier.color }}>{tier.label}</span>
        </div>
        {meal.is_vegan && <span className="absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E8F7F1] text-[#085041] shadow-sm">🌱 Vegan</span>}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#1A1A1A] shadow-sm"><Eye size={10} /> Voir détails</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif font-bold text-[15px] text-[#1A1A1A] leading-tight mb-2 line-clamp-1 group-hover:text-[#C4602A] transition-colors">{meal.emoji} {meal.name}</h3>
        <p className="text-[11px] text-[#9C9C9C] font-sans line-clamp-1 mb-3">{meal.description}</p>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8F4] text-[#C4602A] border border-[#F0E4D8]"><Flame size={8} className="inline -mt-0.5" /> {meal.macros.kcal} cal</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E8F7F1] text-[#085041]">{meal.macros.protein_g}g prot</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFF9DB] text-[#92620A]">{meal.macros.carbs_g}g gluc</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-[#2F8B60]">{meal.price_mad} MAD</span>
          <span className="flex items-center gap-1 text-[10px] text-[#9C9C9C]"><Clock size={10} />{meal.prep_time_min} min</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CataloguePage() {
  const router = useRouter();
  const { meals } = useMealsStore();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<MealCategory | "all">("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [veganOnly, setVeganOnly] = useState(false);
  const [gfOnly, setGfOnly] = useState(false);
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const active = meals.filter(m => m.is_active);
  const filtered = useMemo(() => active.filter(m => {
    if (selectedCat !== "all" && m.category !== selectedCat) return false;
    if (selectedTier !== "all" && m.tier !== selectedTier) return false;
    if (veganOnly && !m.is_vegan) return false;
    if (gfOnly && !m.is_gluten_free) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [active, selectedCat, selectedTier, veganOnly, gfOnly, search]);

  const grouped = useMemo(() => {
    const cats: MealCategory[] = ["breakfast", "lunch", "dinner", "snack"];
    return cats.map(c => ({ cat: c, meals: filtered.filter(m => m.category === c) })).filter(g => g.meals.length > 0);
  }, [filtered]);

  const stats = useMemo(() => ({
    total: active.length,
    minPrice: Math.min(...active.map(m => m.price_mad)),
    maxPrice: Math.max(...active.map(m => m.price_mad)),
    vegan: active.filter(m => m.is_vegan).length,
    gf: active.filter(m => m.is_gluten_free).length,
    avgCal: Math.round(active.reduce((s, m) => s + m.macros.kcal, 0) / active.length),
  }), [active]);

  const resetFilters = () => { setSearch(""); setSelectedCat("all"); setSelectedTier("all"); setVeganOnly(false); setGfOnly(false); };
  const hasFilters = search || selectedCat !== "all" || selectedTier !== "all" || veganOnly || gfOnly;

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-[120px] pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[#2C3E2D] z-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.25em]">Catalogue Complet</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="font-serif font-bold text-[#F5F0E8] leading-[0.95] tracking-tight mt-4 mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            {stats.total} plats frais,<br /><span className="text-[#C4602A]">cuisinés à Tanger</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg text-[#F5F0E8]/60 font-sans max-w-xl mx-auto mb-10">
            Chaque repas est portionné selon vos macros, préparé par nos chefs, et livré frais à votre porte.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
            {[
              { v: `${stats.total}`, l: "Plats" },
              { v: `${stats.minPrice}–${stats.maxPrice}`, l: "MAD" },
              { v: `${stats.vegan}`, l: "Vegan" },
              { v: `${stats.gf}`, l: "Sans gluten" },
              { v: `${stats.avgCal}`, l: "Cal. moy." },
              { v: "100%", l: "Halal" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-serif font-bold text-xl text-[#F5F0E8]">{s.v}</p>
                <p className="text-[10px] text-[#F5F0E8]/40 font-bold uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-[88px] z-30 bg-[#FFF8F4]/90 backdrop-blur-xl border-b border-[#E8E3DB] py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
              <input type="text" placeholder="Rechercher un plat, ingrédient..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E8E3DB] text-sm outline-none focus:border-[#6BC4A0] transition-colors" />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {(["all", "breakfast", "lunch", "dinner", "snack"] as const).map(c => (
                <button key={c} onClick={() => setSelectedCat(c)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCat === c ? "bg-[#2C3E2D] text-[#F5F0E8]" : "bg-white text-[#6B6B6B] border border-[#E8E3DB]"}`}>
                  {c === "all" ? "✨ Tous" : `${CAT_META[c].emoji} ${CAT_META[c].label}`}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${showFilters ? "bg-[#C4602A] text-white" : "bg-white text-[#6B6B6B] border border-[#E8E3DB]"}`}>
              <SlidersHorizontal size={14} /> Filtres {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#C4602A]" />}
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  {Object.entries(TIER_INFO).map(([k, v]) => (
                    <button key={k} onClick={() => setSelectedTier(selectedTier === k ? "all" : k)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTier === k ? "text-white" : "border border-[#E8E3DB] text-[#6B6B6B]"}`} style={selectedTier === k ? { backgroundColor: v.color } : {}}>
                      {v.label}
                    </button>
                  ))}
                  <button onClick={() => setVeganOnly(!veganOnly)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${veganOnly ? "bg-[#085041] text-white" : "border border-[#E8E3DB] text-[#6B6B6B]"}`}>🌱 Vegan</button>
                  <button onClick={() => setGfOnly(!gfOnly)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${gfOnly ? "bg-[#92620A] text-white" : "border border-[#E8E3DB] text-[#6B6B6B]"}`}>🌾 Sans Gluten</button>
                  {hasFilters && <button onClick={resetFilters} className="text-xs font-bold text-[#C4602A] hover:underline ml-2">Réinitialiser</button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-[#9C9C9C] font-sans"><strong className="text-[#1A1A1A]">{filtered.length}</strong> plat{filtered.length !== 1 && "s"} trouvé{filtered.length !== 1 && "s"}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <Search size={56} className="text-[#D4C9BE] mb-4" />
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">Aucun plat trouvé</h3>
            <p className="text-sm text-[#6B6B6B] mb-6">Essayez d'autres filtres</p>
            <button onClick={resetFilters} className="px-6 py-2.5 border-2 border-[#E8E3DB] text-[#1A1A1A] font-bold rounded-full hover:border-[#C4602A] transition-colors">Tout afficher</button>
          </div>
        ) : selectedCat === "all" ? (
          /* Grouped by category */
          grouped.map(({ cat, meals: catMeals }) => {
            const meta = CAT_META[cat];
            return (
              <section key={cat} className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: meta.bg }}>{meta.emoji}</div>
                  <div>
                    <h2 className="font-serif text-2xl text-[#1A1A1A]">{meta.label}</h2>
                    <p className="text-xs text-[#9C9C9C] font-sans">{meta.desc} · {catMeals.length} plat{catMeals.length > 1 && "s"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {catMeals.map(m => <CatalogueCard key={m.id} meal={m} onDetail={setDetailMeal} />)}
                </div>
              </section>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(m => <CatalogueCard key={m.id} meal={m} onDetail={setDetailMeal} />)}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#2C3E2D] rounded-[3rem] py-16 px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4602A]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <Sparkles className="mx-auto mb-4 text-[#C4602A]" size={36} />
          <h2 className="font-serif text-3xl md:text-4xl text-[#F5F0E8] mb-4 relative z-10">Envie de goûter ?</h2>
          <p className="text-lg text-[#F5F0E8]/60 max-w-xl mx-auto mb-8 font-sans relative z-10">Créez votre profil, recevez vos macros personnalisées, et commandez vos favoris.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push("/onboarding")} className="bg-[#C4602A] text-[#F5F0E8] px-10 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-[#A04F22] transition-colors flex items-center gap-3 mx-auto relative z-10">
            Commencer gratuitement <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* DETAIL DRAWER */}
      <AnimatePresence>{detailMeal && <DetailDrawer meal={detailMeal} onClose={() => setDetailMeal(null)} />}</AnimatePresence>

      <PublicFooter />
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
