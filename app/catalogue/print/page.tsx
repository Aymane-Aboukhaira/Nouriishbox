"use client";
import { useMealsStore } from "@/lib/store";
import type { Meal, MealCategory } from "@/lib/types";

const CAT: Record<MealCategory, { label: string; emoji: string; color: string }> = {
  breakfast: { label: "Petit-Déjeuner", emoji: "☀️", color: "#F59E0B" },
  lunch: { label: "Déjeuner", emoji: "🥗", color: "#6BC4A0" },
  dinner: { label: "Dîner", emoji: "🌙", color: "#B09AE0" },
  snack: { label: "Collations & Desserts", emoji: "⚡", color: "#C4602A" },
};

const TIER_LABEL: Record<string, string> = { budget: "Budget", standard: "Standard", premium: "Premium", kids: "Kids" };

function MealRow({ meal, idx }: { meal: Meal; idx: number }) {
  return (
    <tr className={idx % 2 === 0 ? "bg-white" : "bg-[#FAFAF7]"}>
      <td className="py-2 px-3 text-sm font-bold text-[#1A1A1A] whitespace-nowrap">
        <span className="mr-1">{meal.emoji}</span>{meal.name}
      </td>
      <td className="py-2 px-3 text-xs text-[#6B6B6B] max-w-[200px]">{meal.description}</td>
      <td className="py-2 px-3 text-xs text-center font-bold text-[#C4602A]">{meal.macros.kcal}</td>
      <td className="py-2 px-3 text-xs text-center font-bold text-[#6BC4A0]">{meal.macros.protein_g}g</td>
      <td className="py-2 px-3 text-xs text-center font-bold text-[#F59E0B]">{meal.macros.carbs_g}g</td>
      <td className="py-2 px-3 text-xs text-center font-bold text-[#B09AE0]">{meal.macros.fats_g}g</td>
      <td className="py-2 px-3 text-xs text-center">{TIER_LABEL[meal.tier]}</td>
      <td className="py-2 px-3 text-xs text-center font-bold text-[#2F8B60]">{meal.price_mad}</td>
      <td className="py-2 px-3 text-xs text-center text-[#9C9C9C]">{meal.prep_time_min} min</td>
      <td className="py-2 px-3 text-[10px] text-[#6B6B6B]">
        {[
          meal.is_vegan && "🌱 Vegan",
          meal.is_gluten_free && "GF",
          meal.is_halal && "☪️ Halal",
        ].filter(Boolean).join(" · ")}
      </td>
      <td className="py-2 px-3 text-[10px] text-[#9C9C9C]">{meal.allergens.length > 0 ? meal.allergens.join(", ") : "—"}</td>
    </tr>
  );
}

function CategorySection({ category, meals }: { category: MealCategory; meals: Meal[] }) {
  const meta = CAT[category];
  return (
    <div className="mb-10 break-inside-avoid">
      <div className="flex items-center gap-3 mb-3 pb-2 border-b-2" style={{ borderColor: meta.color }}>
        <span className="text-xl">{meta.emoji}</span>
        <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">{meta.label}</h2>
        <span className="text-xs text-[#9C9C9C] font-sans ml-auto">{meals.length} plat{meals.length > 1 && "s"}</span>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-[#2C3E2D] text-[#F5F0E8]">
            {["Plat", "Description", "Cal.", "Prot.", "Gluc.", "Lip.", "Tier", "Prix (MAD)", "Prép.", "Régime", "Allergènes"].map(h => (
              <th key={h} className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {meals.map((m, i) => <MealRow key={m.id} meal={m} idx={i} />)}
        </tbody>
      </table>
    </div>
  );
}

export default function PrintCatalogue() {
  const { meals } = useMealsStore();
  const active = meals.filter(m => m.is_active);
  const cats: MealCategory[] = ["breakfast", "lunch", "dinner", "snack"];
  const grouped = cats.map(c => ({ cat: c, meals: active.filter(m => m.category === c) })).filter(g => g.meals.length > 0);

  const stats = {
    total: active.length,
    vegan: active.filter(m => m.is_vegan).length,
    gf: active.filter(m => m.is_gluten_free).length,
    minPrice: Math.min(...active.map(m => m.price_mad)),
    maxPrice: Math.max(...active.map(m => m.price_mad)),
    avgCal: Math.round(active.reduce((s, m) => s + m.macros.kcal, 0) / active.length),
  };

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-page { padding: 0 !important; }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `}</style>

      {/* Print button - hidden when printing */}
      <div className="no-print fixed top-6 right-6 z-50 flex gap-3">
        <button onClick={() => window.print()} className="bg-[#2C3E2D] text-[#F5F0E8] px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-[#1A1A1A] transition-colors flex items-center gap-2">
          🖨️ Imprimer / PDF
        </button>
        <a href="/catalogue" className="bg-white text-[#1A1A1A] px-6 py-3 rounded-full font-bold text-sm shadow-lg border border-[#E8E3DB] hover:border-[#C4602A] transition-colors">
          ← Retour
        </a>
      </div>

      <div className="print-page min-h-screen bg-white p-8 md:p-12 max-w-[1400px] mx-auto font-sans">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#2C3E2D]">
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#1A1A1A] mb-1">
              <span className="text-[#6BC4A0]">nourish</span><span className="text-[#C4602A]">box</span>
            </h1>
            <p className="text-sm text-[#6B6B6B]">Catalogue des repas · Tanger, Maroc</p>
            <p className="text-xs text-[#9C9C9C] mt-1">Mis à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9C9C9C]">www.nourishbox.ma</p>
            <p className="text-xs text-[#9C9C9C]">hello@nourishbox.ma</p>
            <p className="text-xs text-[#9C9C9C]">+212 6 00 00 00 00</p>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-6 gap-4 mb-8 p-4 rounded-xl bg-[#FAFAF7] border border-[#E8E3DB]">
          {[
            { v: stats.total, l: "Plats actifs" },
            { v: `${stats.minPrice}–${stats.maxPrice} MAD`, l: "Fourchette prix" },
            { v: stats.vegan, l: "Options vegan" },
            { v: stats.gf, l: "Sans gluten" },
            { v: `${stats.avgCal} kcal`, l: "Calories moy." },
            { v: "100%", l: "Halal certifié" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-bold text-lg text-[#1A1A1A]">{s.v}</p>
              <p className="text-[10px] text-[#9C9C9C] font-semibold uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>

        {/* CATEGORY SECTIONS */}
        {grouped.map(({ cat, meals: catMeals }) => (
          <CategorySection key={cat} category={cat} meals={catMeals} />
        ))}

        {/* FOOTER */}
        <div className="mt-10 pt-6 border-t-2 border-[#E8E3DB] flex justify-between items-end">
          <div>
            <p className="text-xs text-[#6B6B6B]">
              <strong>Légende :</strong> Cal. = Calories · Prot. = Protéines · Gluc. = Glucides · Lip. = Lipides · GF = Sans Gluten · Prép. = Temps de préparation
            </p>
            <p className="text-[10px] text-[#9C9C9C] mt-1">
              Les valeurs nutritionnelles sont calculées par portion. Prix en Dirhams marocains (MAD), livraison gratuite incluse. Menu sujet à disponibilité saisonnière.
            </p>
          </div>
          <div className="text-right shrink-0 ml-8">
            <p className="font-serif text-sm font-bold text-[#1A1A1A]">
              <span className="text-[#6BC4A0]">nourish</span><span className="text-[#C4602A]">box</span>
            </p>
            <p className="text-[10px] text-[#9C9C9C]">© {new Date().getFullYear()} Nourishbox SARL</p>
          </div>
        </div>
      </div>
    </>
  );
}
