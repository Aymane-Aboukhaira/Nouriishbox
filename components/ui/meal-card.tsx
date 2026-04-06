"use client";
import { motion } from "framer-motion";
import { Plus, Clock, Flame, Wheat, Droplets } from "lucide-react";
import type { Meal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MealCardProps {
    meal: Meal;
    variant?: "default" | "selected" | "planner" | "compact";
    onAdd?: (meal: Meal) => void;
    onRemove?: (meal: Meal) => void;
    isAdded?: boolean;
    showAdd?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    breakfast: { bg: "#FFE5A0", text: "#92620A", dot: "#F59E0B" },
    lunch: { bg: "#A8E6CF", text: "#166534", dot: "#6BC4A0" },
    dinner: { bg: "#D6C1FF", text: "#5B21B6", dot: "#B09AE0" },
    snack: { bg: "#FFD3B6", text: "#9A3412", dot: "#FFA07A" },
};

const CATEGORY_LABELS: Record<string, string> = {
    breakfast: "Petit-déj",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation",
};

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    budget:   { bg: "#E1F5EE", text: "#085041", label: "💚 Budget" },
    standard: { bg: "#EEF2FF", text: "#3730A3", label: "⭐ Standard" },
    premium:  { bg: "#F3EEFA", text: "#B09AE0", label: "👑 Premium" },
    kids:     { bg: "#FFF0E5", text: "#E07050", label: "🧒 Kids" },
};

export function MealCard({
    meal,
    variant = "default",
    onAdd,
    onRemove,
    isAdded = false,
    showAdd = true,
}: MealCardProps) {
    const catColor = CATEGORY_COLORS[meal.category];
    const tier = TIER_STYLES[meal.tier] ?? TIER_STYLES.standard;
    const isCompact = variant === "compact" || variant === "planner";

    if (isCompact) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/80 border border-[#F0E4D8] cursor-grab active:cursor-grabbing"
                style={{ boxShadow: "0 2px 8px rgba(45,45,45,0.06)" }}
            >
                <span className="text-2xl flex-shrink-0">{meal.emoji}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2D2D2D] truncate">{meal.name}</p>
                    <p className="text-[10px] text-[#9C9C9C]">{meal.macros.kcal} kcal · {meal.macros.protein_g}g prot</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(45,45,45,0.14)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-[20px] overflow-hidden cursor-pointer"
            style={{
                border: isAdded ? `2px solid #6BC4A0` : "1px solid #F0E4D8",
                boxShadow: isAdded
                    ? "0 8px 32px rgba(107,196,160,0.18)"
                    : "0 4px 16px rgba(45,45,45,0.06)",
            }}
        >
            {/* Emoji / Image area */}
            <div
                className="relative h-44 flex items-center justify-center overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${catColor.bg}88, ${catColor.bg}44)`,
                }}
            >
                {meal.image_url ? (
                    <img 
                        src={meal.image_url} 
                        alt={meal.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <span className="text-6xl">{meal.emoji}</span>
                )}
                
                {/* Category badge */}
                <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize tracking-wide z-10 shadow-sm"
                    style={{ background: catColor.bg, color: catColor.text }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: catColor.dot }}
                    />
                    {CATEGORY_LABELS[meal.category]}
                </div>

                {/* Tier badge */}
                <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold z-10 shadow-sm"
                    style={{ background: tier.bg, color: tier.text }}
                >
                    {tier.label}
                </div>

                {/* Vegan tag — shifted down to avoid overlap with tier */}
                {meal.is_vegan && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold bg-[#A8E6CF] text-[#166534] z-10 shadow-sm">
                        🌱 Vegan
                    </div>
                )}
                {isAdded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#6BC4A0]/20 backdrop-blur-[2px] flex items-center justify-center z-20"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#6BC4A0] text-white flex items-center justify-center text-lg font-bold shadow-lg border-2 border-white">
                            ✓
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-serif font-bold text-base text-[#2D2D2D] leading-tight mb-2 group-hover:text-[#2F8B60] transition-colors line-clamp-1">
                    {meal.name}
                </h3>

                {/* Macros chips */}
                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-[#FFF8F4] text-[#C4602A] border border-[#F0E4D8]">
                        <Flame size={10} /> {meal.macros.kcal} Cal.
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-[#F3EEFA] text-[#B09AE0] border border-[#E8E0D8]">
                         {meal.macros.protein_g}g Prot
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-[#E1F5EE] text-[#085041] border border-[#A8E6CF]">
                         {meal.macros.carbs_g}g Gluc
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-[#FFF0E5] text-[#E07050] border border-[#FFD3B6]">
                         {meal.macros.fats_g}g Lipi
                    </span>
                </div>

                {/* Footer: price + prep time + add button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Price — prominent green */}
                        <span className="text-sm font-black text-[#2F8B60]">
                            {meal.price_mad} MAD
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-[#9C9C9C]">
                            <Clock size={11} />
                            <span>{meal.prep_time_min} min</span>
                        </div>
                    </div>
                    {showAdd && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isAdded) onRemove?.(meal);
                                else onAdd?.(meal);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all",
                                isAdded
                                    ? "bg-[#F1FAF4] text-[#2F8B60] border border-[#A8E6CF]"
                                    : "text-white"
                            )}
                            style={
                                !isAdded
                                    ? { background: "linear-gradient(135deg, #6BC4A0, #2F8B60)" }
                                    : {}
                            }
                        >
                            {isAdded ? (
                                "✓ Ajouté"
                            ) : (
                                <>
                                    <Plus size={12} />
                                    Ajouter
                                </>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
