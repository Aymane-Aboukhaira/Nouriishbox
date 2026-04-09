"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { MealCard } from "@/components/ui/meal-card";
import { MealCardSkeleton } from "@/components/ui/meal-card-skeleton";
import { useMealsStore, usePlannerStore, useProfileStore, usePointsStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, CheckCircle, ShieldCheck, Star, X } from "lucide-react";
import { toast } from "sonner";
import type { MealCategory, Meal } from "@/lib/types";
import { isMealExcludedByTaste, getDietBoost } from "@/lib/taste-filter";

const CATEGORIES: { value: "all" | MealCategory; label: string; emoji: string }[] = [
    { value: "all", label: "Tous", emoji: "✨" },
    { value: "breakfast", label: "Petit-déj", emoji: "☀️" },
    { value: "lunch", label: "Déjeuner", emoji: "🥗" },
    { value: "dinner", label: "Dîner", emoji: "🌙" },
    { value: "snack", label: "Collation", emoji: "⚡" },
];

const DAY_KEYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ── Pure Functions ───────────────────────────────────────────

function getTodayRemaining(profile: any, plan: any, meals: Meal[]) {
    // 0 = Monday in our planner logic. (JS getDay: 0 = Sun).
    const todayIndex = (new Date().getDay() + 6) % 7;
    const todayMealIds = plan.planned_meals.filter((pm: any) => pm.day_index === todayIndex).map((pm: any) => pm.meal_id);
    const todayMeals = meals.filter(m => todayMealIds.includes(m.id));

    const consumed = todayMeals.reduce((acc, m) => ({
        protein: acc.protein + m.macros.protein_g,
        carbs: acc.carbs + m.macros.carbs_g,
        fats: acc.fats + m.macros.fats_g,
        calories: acc.calories + m.macros.kcal,
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });

    const pTarget = profile.targets?.protein_g || 150;
    const cTarget = profile.targets?.carbs_g || 200;
    const fTarget = profile.targets?.fats_g || 65;
    const kTarget = profile.targets?.kcal || 2000;

    return {
        protein: Math.max(0, pTarget - consumed.protein),
        carbs: Math.max(0, cTarget - consumed.carbs),
        fats: Math.max(0, fTarget - consumed.fats),
        calories: Math.max(0, kTarget - consumed.calories),
    };
}

function getMatchScore(meal: Meal, remaining: ReturnType<typeof getTodayRemaining>): number {
    if (remaining.calories <= 0) return 0; // Targets already met
    
    const proteinScore = Math.max(0, 1 - Math.abs(meal.macros.protein_g - remaining.protein) / Math.max(remaining.protein, 1));
    const carbsScore = Math.max(0, 1 - Math.abs(meal.macros.carbs_g - remaining.carbs) / Math.max(remaining.carbs, 1));
    const fatsScore = Math.max(0, 1 - Math.abs(meal.macros.fats_g - remaining.fats) / Math.max(remaining.fats, 1));
    
    // Weighted average: Protein is most important (50%), then Carbs (30%), then Fats (20%)
    return Math.round((proteinScore * 0.5 + carbsScore * 0.3 + fatsScore * 0.2) * 100);
}

// ── Sub-Components ───────────────────────────────────────────

function MenuMealCard({
    meal,
    matchScore,
    isTomorrow,
    isAdded,
    onAddClick,
    onCardClick,
    onRemoveClick
}: {
    meal: Meal;
    matchScore: number;
    isTomorrow: boolean;
    isAdded: boolean;
    onAddClick: (meal: Meal, rect: DOMRect) => void;
    onCardClick: (meal: Meal) => void;
    onRemoveClick: (meal: Meal) => void;
}) {
    let pillStyle = "bg-[#F1EFE8] text-[#5F5E5A]";
    let pillLabel = `${matchScore}%`;

    if (isTomorrow) {
        pillStyle = "bg-[#F3EEFA] text-[#B09AE0]";
        pillLabel = "Demain ?";
    } else if (matchScore >= 80) {
        pillStyle = "bg-[#E1F5EE] text-[#085041]";
        pillLabel = `${matchScore}% Match`;
    } else if (matchScore >= 60) {
        pillStyle = "bg-[#E1F5EE] text-[#085041]";
        pillLabel = `${matchScore}% Match`;
    }

    const lastClickedBtn = useRef<DOMRect | null>(null);

    return (
        <div 
            className="relative h-full" 
            onClick={() => onCardClick(meal)}
            onClickCapture={(e) => {
                const target = e.target as HTMLElement;
                const btn = target.closest("button");
                if (btn) lastClickedBtn.current = btn.getBoundingClientRect();
            }}
        >
            <div className="pointer-events-none">
                {/* Pointer events none for the wrapper to let clicks pass through, except we need them! */}
            </div>
            
            <MealCard
                meal={meal}
                isAdded={isAdded}
                onAdd={() => {
                    if (lastClickedBtn.current) onAddClick(meal, lastClickedBtn.current);
                }}
                onRemove={(m) => onRemoveClick(m)}
            />

            {/* Score Pill */}
            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium z-10 shadow-sm ${pillStyle}`}>
                {pillLabel}
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────

export default function MenuPage() {
    const { meals } = useMealsStore();
    const { profile } = useProfileStore();
    const { plan, assignMeal, removeMealFromDay } = usePlannerStore();
    const { addPoints } = usePointsStore();

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    const [activeCategory, setActiveCategory] = useState<"all" | MealCategory>("all");
    const [search, setSearch] = useState("");
    const [veganOnly, setVeganOnly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [fixMacrosActive, setFixMacrosActive] = useState(false);
    const [gridAnimKey, setGridAnimKey] = useState(0);

    const [activePopoverMealId, setActivePopoverMealId] = useState<string | null>(null);
    const [popoverRect, setPopoverRect] = useState<DOMRect | null>(null);

    // Store only the meal ID — look up the live Meal from masterMealsList at render.
    // This guarantees the detail drawer always shows current price/name/macros, even after admin edits.
    const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
    const selectedMeal: Meal | null = selectedMealId ? (meals.find(m => m.id === selectedMealId) ?? null) : null;

    const hasInitiallyLoaded = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            hasInitiallyLoaded.current = true;
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Filter mutually exclusive Logic
    useEffect(() => {
        if (fixMacrosActive) {
            setActiveCategory("all");
            setGridAnimKey(k => k + 1);
        }
    }, [fixMacrosActive]);

    // Derived Macros
    const todayRemaining = hasMounted ? getTodayRemaining(profile, plan, meals) : { protein: 0, carbs: 0, fats: 0, calories: 0 };
    const targetMet = todayRemaining.calories <= 0;

    // Taste preferences
    const tastePrefs = profile.tastePreferences || { dislikes: [], spiceTolerance: 'medium' as const, dietLeaning: 'none' as const };

    // Built for you today scoring (with taste filtering + diet boost)
    const scoredMeals = useMemo(() => {
        return meals
            .filter(m => !isMealExcludedByTaste(m, tastePrefs))
            .map(m => {
                const remaining = targetMet 
                    ? { protein: (profile.targets?.protein_g || 150) / 3, carbs: (profile.targets?.carbs_g || 200) / 3, fats: (profile.targets?.fats_g || 65) / 3, calories: (profile.targets?.kcal || 2000) / 3 }
                    : todayRemaining;
                const baseScore = getMatchScore(m, remaining as any);
                const boost = getDietBoost(m, tastePrefs);
                return { meal: m, score: Math.min(100, baseScore + boost) };
            })
            .sort((a, b) => b.score - a.score);
    }, [meals, tastePrefs, targetMet, todayRemaining, profile.targets]);

    const top4Today = scoredMeals.slice(0, 4);
    
    // Check if user has logged meals today (meaning they have non-zero consumed)
    const consumedCalories = (profile.targets?.kcal || 2000) - todayRemaining.calories;
    const loggedNothing = consumedCalories === 0;

    // Filter Logic (with taste filtering + diet boost)
    let filtered = useMemo(() => {
        return meals
            .filter(m => !isMealExcludedByTaste(m, tastePrefs))
            .map(m => {
                const score = getMatchScore(m, targetMet ? {
                    protein: (profile.targets?.protein_g || 150) / 3, carbs: (profile.targets?.carbs_g || 200) / 3, fats: (profile.targets?.fats_g || 65) / 3, calories: (profile.targets?.kcal || 2000) / 3
                } as any : todayRemaining);
                const boost = getDietBoost(m, tastePrefs);
                return { meal: m, score: Math.min(100, score + boost) };
            })
            .filter(({meal}) => {
                const matchesCategory = activeCategory === "all" || meal.category === activeCategory;
                const matchesSearch =
                    search === "" ||
                    meal.name.toLowerCase().includes(search.toLowerCase()) ||
                    meal.tags.some(t => t.includes(search.toLowerCase()));
                const matchesVegan = !veganOnly || meal.is_vegan;
                return matchesCategory && matchesSearch && matchesVegan && meal.is_active;
            });
    }, [meals, tastePrefs, targetMet, todayRemaining, profile.targets, activeCategory, search, veganOnly]);

    if (fixMacrosActive) {
        filtered = [...filtered].sort((a, b) => b.score - a.score);
    }

    const addedMealIds = new Set(plan.planned_meals.map(pm => pm.meal_id));

    // Popover Close Listener
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.day-selector-popover')) {
                setActivePopoverMealId(null);
            }
        };
        if (activePopoverMealId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activePopoverMealId]);

    // Actions
    const handleAddClick = (meal: Meal, rect: DOMRect) => {
        setActivePopoverMealId(meal.id);
        setPopoverRect(rect);
    };

    const assignToDay = (dayIndex: number, meal: Meal) => {
        assignMeal(DAY_KEYS[dayIndex], meal.id);
        setActivePopoverMealId(null);
        setSelectedMealId(null);
        addPoints(5);
        toast.success(`✨ ${meal.name} ajouté à ${DAY_LABELS[dayIndex]}`);
    };

    const handleAssignToNextFreeDay = (meal: Meal) => {
        const usedDays = plan.planned_meals.map(pm => pm.day_index);
        const freeDay = [0, 1, 2, 3, 4, 5, 6].find(d => !plan.paused_days.includes(d) && usedDays.filter(ud => ud === d).length < 3) ?? 0;
        assignToDay(freeDay, meal);
    };

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen relative pb-32">
            <Header title="Explorer notre Menu" subtitle="Conçu pour les besoins spécifiques de votre corps" />
            
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                
                {/* Feature 1: Built for you today */}
                {!isLoading && search === "" && !fixMacrosActive && activeCategory === "all" && (
                    <div className="mb-10 w-full full-width-scroll overflow-hidden">
                        <div className="flex items-end justify-between mb-4">
                            <h2 className="font-serif text-2xl text-[#2D2D2D]">Conçu pour vous aujourd'hui</h2>
                            <p className="text-xs text-[#9C9C9C] font-semibold">Mis à jour à {new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        {targetMet ? (
                            <div className="bg-[#FAEEDA]/50 rounded-[20px] p-6 flex flex-col items-center justify-center text-center border border-[#FAEEDA]">
                                <div className="w-12 h-12 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-3">
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <h3 className="font-serif text-xl text-[#633806] mb-1">Vous avez atteint vos objectifs pour aujourd'hui</h3>
                                <p className="text-[#92620A] text-sm">Revenez demain — ou parcourez nos repas pour demain.</p>
                            </div>
                        ) : (
                            <>
                                {loggedNothing && (
                                    <p className="text-xs text-[#9C9C9C] italic mb-4">Rien d'enregistré encore — voici un excellent point de départ pour aujourd'hui.</p>
                                )}
                                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
                                    {top4Today.map(({ meal, score }, i) => (
                                        <motion.div 
                                            key={meal.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className="min-w-[200px] max-w-[200px] bg-white rounded-[20px] p-4 border border-[#F0E4D8] shadow-sm flex flex-col cursor-pointer"
                                            onClick={() => setSelectedMealId(meal.id)}
                                        >
                                            <div className="text-4xl mb-2 text-center">{meal.emoji}</div>
                                            <h4 className="font-serif text-[15px] text-[#2D2D2D] leading-tight mb-1 line-clamp-2 min-h-[36px]">{meal.name}</h4>
                                            <p className="text-[10px] text-[#9C9C9C] font-semibold mb-3">{meal.macros.kcal} kcal</p>
                                            
                                            {/* Micro Macro Bars */}
                                            <div className="flex flex-col gap-[3px] mb-4">
                                                <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full">
                                                    <div className="h-full bg-[#B09AE0] rounded-full" style={{ width: `${Math.min(meal.macros.protein_g / remainingVal(todayRemaining.protein), 100)}%` }} />
                                                </div>
                                                <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full">
                                                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${Math.min(meal.macros.carbs_g / remainingVal(todayRemaining.carbs), 100)}%` }} />
                                                </div>
                                                <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full">
                                                    <div className="h-full bg-[#FFA07A] rounded-full" style={{ width: `${Math.min(meal.macros.fats_g / remainingVal(todayRemaining.fats), 100)}%` }} />
                                                </div>
                                            </div>

                                            {/* Score Badge */}
                                            <div className="mb-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${score >= 80 ? 'bg-[#E1F5EE] text-[#085041]' : score >= 60 ? 'bg-[#FAEEDA] text-[#633806]' : 'bg-[#F1EFE8] text-[#5F5E5A]'}`}>
                                                    {score >= 80 ? "Parfait pour le moment" : score >= 60 ? "Excellent match" : "Bonne option"}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAddClick(meal, e.currentTarget.getBoundingClientRect()); }}
                                                className="w-full bg-[#6BC4A0] hover:bg-[#5BB48F] text-white py-2 rounded-xl text-xs font-bold transition-colors mt-auto"
                                            >
                                                + Ajouter
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Search & Built-in Filters */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="flex-1 relative w-full">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                        <input
                            type="text"
                            placeholder="Rechercher un repas, ingrédient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#F0E4D8] text-sm text-[#2D2D2D] placeholder:text-[#9C9C9C] outline-none focus:border-[#A8E6CF] transition-colors"
                        />
                    </div>
                </div>

                {/* Categories & Fix Macros Pill */}
                <div className="flex flex-col mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar">
                        {/* Fix My Macros Filter */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setFixMacrosActive(!fixMacrosActive); if(search) setSearch(""); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${fixMacrosActive ? 'bg-[#6BC4A0] text-white outline outline-2 outline-offset-2 outline-[#6BC4A0]' : 'bg-[#FFF8F4] text-[#6BC4A0] border-2 border-[#6BC4A0]'}`}
                        >
                            <Zap size={14} className={fixMacrosActive ? "text-white" : "text-[#6BC4A0]"} fill={fixMacrosActive ? "white" : "none"} />
                            Corriger mes macros
                        </motion.button>
                        
                        <div className="w-px h-6 bg-[#F0E4D8] my-auto mx-1 flex-shrink-0" />

                        {CATEGORIES.map((cat) => (
                            <motion.button
                                key={cat.value}
                                onClick={() => { setActiveCategory(cat.value); setFixMacrosActive(false); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat.value && !fixMacrosActive ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white text-[#6B6B6B] border border-[#F0E4D8] hover:border-[#D4C9BE]'}`}
                            >
                                <span>{cat.emoji}</span> {cat.label}
                            </motion.button>
                        ))}

                        <motion.button
                            onClick={() => setVeganOnly(!veganOnly)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all flex-shrink-0 ${veganOnly ? 'bg-[#A8E6CF] text-[#166534] border-[#6BC4A0]' : 'bg-white text-[#6B6B6B] border-[#F0E4D8]'}`}
                        >
                            🌱 Vegan
                        </motion.button>
                    </div>
                    {fixMacrosActive && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-[#6B6B6B] mt-2">
                            Affichage de {filtered.length} repas · triés selon leur correspondance à vos macros
                        </motion.p>
                    )}
                </div>

                {/* Main Grid & Empty States */}
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5">
                            {[...Array(8)].map((_, i) => <MealCardSkeleton key={i} />)}
                        </motion.div>
                    ) : filtered.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
                            {fixMacrosActive ? (
                                <>
                                    <CheckCircle className="text-[#6BC4A0] mb-4" size={56} />
                                    <h3 className="font-serif text-2xl text-[#2D2D2D] mb-1">Vous êtes parfaitement sur la bonne voie aujourd'hui !</h3>
                                    <p className="text-[#6B6B6B] text-sm">Aucun écart de macro à combler.</p>
                                </>
                            ) : search !== "" ? (
                                <>
                                    <Search className="text-[#D4C9BE] mb-4" size={56} />
                                    <h3 className="font-serif text-2xl text-[#2D2D2D] mb-1">Aucun repas trouvé</h3>
                                    <p className="text-[#6B6B6B] text-sm mb-4">Essayez une recherche différente ou effacez vos filtres</p>
                                    <button onClick={() => setSearch("")} className="px-6 py-2 border-2 border-[#F0E4D8] text-[#2D2D2D] font-bold rounded-full hover:border-[#D4C9BE]">Effacer la recherche</button>
                                </>
                            ) : (
                                <>
                                    <Search className="text-[#D4C9BE] mb-4" size={56} />
                                    <h3 className="font-serif text-2xl text-[#2D2D2D] mb-1">Rien dans {activeCategory} pour le moment</h3>
                                    <p className="text-[#6B6B6B] text-sm mb-4">Revenez la semaine prochaine — notre menu change avec les saisons</p>
                                    <button onClick={() => setActiveCategory("all")} className="px-6 py-2 border-2 border-[#F0E4D8] text-[#2D2D2D] font-bold rounded-full hover:border-[#D4C9BE]">Afficher tous les repas</button>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key={gridAnimKey} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5">
                            {filtered.map(({ meal, score }, idx) => (
                                <motion.div
                                    key={meal.id}
                                    layout
                                    initial={hasInitiallyLoaded.current && !fixMacrosActive ? false : { opacity: 0, y: 16 }}
                                    whileInView={hasInitiallyLoaded.current && !fixMacrosActive ? undefined : { opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ delay: fixMacrosActive ? idx * 0.04 : (hasInitiallyLoaded.current ? 0 : idx * 0.03) }}
                                >
                                    <MenuMealCard
                                        meal={meal}
                                        matchScore={score}
                                        isTomorrow={targetMet}
                                        isAdded={addedMealIds.has(meal.id)}
                                        onCardClick={(m) => setSelectedMealId(m.id)}
                                        onAddClick={handleAddClick}
                                        onRemoveClick={(m) => {
                                            const pm = plan.planned_meals.find(x => x.meal_id === m.id);
                                            if (pm) removeMealFromDay(pm.id);
                                            toast.info(`${m.name} retiré`);
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feature 4: Day Selector Popover */}
            <AnimatePresence>
                {activePopoverMealId && popoverRect && (
                    <div className="fixed inset-0 z-50 pointer-events-none day-selector-popover-wrapper">
                        {/* Interactive layer */}
                        <div className="absolute inset-0 pointer-events-auto" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            style={{
                                position: 'absolute',
                                left: Math.max(16, Math.min(popoverRect.left + popoverRect.width / 2 - 160, window.innerWidth - 336)),
                                top: popoverRect.bottom > window.innerHeight - 200 ? popoverRect.top - 120 : popoverRect.bottom + 8,
                                transformOrigin: popoverRect.bottom > window.innerHeight - 200 ? 'bottom center' : 'top center',
                            }}
                            className="bg-white rounded-2xl shadow-[0_12px_48px_rgba(45,45,45,0.15)] p-3 w-[320px] pointer-events-auto border border-[#E8E0D8] day-selector-popover"
                        >
                            <h4 className="text-xs font-bold text-[#2D2D2D] mb-2 px-1">Ajouter à quel jour ?</h4>
                            <div className="flex items-center justify-between gap-1 mb-3">
                                {DAY_LABELS.map((label, i) => {
                                    const isPaused = plan.paused_days.includes(i);
                                    const hasMeal = plan.planned_meals.some(pm => pm.day_index === i);
                                    const isToday = i === (new Date().getDay() + 6) % 7;
                                    
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            {isToday && <span className="text-[8px] font-bold text-[#6BC4A0] absolute -top-3">Aujourd'hui</span>}
                                            <button
                                                disabled={isPaused}
                                                onClick={() => assignToDay(i, meals.find(m => m.id === activePopoverMealId)!)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${isPaused ? 'opacity-40 line-through cursor-not-allowed bg-gray-50 text-gray-400' : hasMeal ? 'bg-[#F1EFE8] text-[#9C9C9C] hover:bg-[#D4C9BE] hover:text-[#2D2D2D]' : 'border-2 border-[#6BC4A0] text-[#6BC4A0] hover:bg-[#6BC4A0] hover:text-white'}`}
                                            >
                                                {label.substring(0,3)}
                                                {hasMeal && !isPaused && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#9C9C9C]" />}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                            <button onClick={() => handleAssignToNextFreeDay(meals.find(m => m.id === activePopoverMealId)!)} className="text-[11px] text-[#6BC4A0] font-bold hover:underline w-full text-center mt-1">
                                Ou ajouter au prochain jour vide →
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Feature 5: Meal Detail Drawer — derives live data from masterMealsList, never stale */}
            <AnimatePresence>
                {selectedMeal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none pb-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMealId(null)} className="absolute inset-0 bg-[#2D2D2D]/40 backdrop-blur-sm pointer-events-auto text-[#F5F0E8]" />
                        
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                            drag="y"
                            dragDirectionLock
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 1 }}
                            onDragEnd={(e, info) => { if (info.offset.y > 60) setSelectedMealId(null); }}
                            className="w-full max-w-2xl bg-white rounded-t-3xl shadow-[0_-12px_48px_rgba(45,45,45,0.1)] relative pointer-events-auto h-[85vh] md:h-auto max-h-[90vh] flex flex-col"
                        >
                            <div className="flex-shrink-0 flex items-center justify-center pt-4 pb-2">
                                <div className="w-10 h-1 rounded-full bg-[#D4C9BE]" />
                            </div>
                            
                            <div className="px-6 pb-6 overflow-y-auto hide-scrollbar flex-1">
                                {/* Premium Hero Image Section — now inside scrollable area */}
                                <div className="relative h-64 md:h-72 w-full flex-shrink-0 overflow-hidden bg-[#F5F0E8] mb-6 mt-2">
                                    <div className="w-full h-full rounded-[24px] overflow-hidden relative group">
                                        {selectedMeal.image_url ? (
                                            <img 
                                                src={selectedMeal.image_url} 
                                                alt={selectedMeal.name} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5E6D3] to-[#E8DCC4]">
                                                <span className="text-8xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{selectedMeal.emoji}</span>
                                            </div>
                                        )}
                                        {/* Category & Tier Badges overlaying image */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
                                                selectedMeal.tier === 'premium' ? 'bg-[#F3EEFA]/90 text-[#B09AE0]' :
                                                selectedMeal.tier === 'standard' ? 'bg-[#E1F5EE]/90 text-[#085041]' :
                                                selectedMeal.tier === 'kids' ? 'bg-[#FFF0E5]/90 text-[#E07050]' :
                                                'bg-white/90 text-[#6B6B6B]'
                                            }`}>
                                                {selectedMeal.tier === 'premium' ? '👑 Premium' : selectedMeal.tier === 'standard' ? '⭐ Standard' : selectedMeal.tier === 'kids' ? '🧒 Enfants' : '💚 Budget'}
                                            </span>
                                        </div>
                                        
                                        <div className="absolute bottom-4 right-4">
                                            <span className="bg-white/90 backdrop-blur-md text-[#2F8B60] text-sm font-black px-4 py-2 rounded-2xl shadow-sm">
                                                {selectedMeal.price_mad} MAD
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="font-serif text-3xl text-[#2D2D2D] pr-4">{selectedMeal.name}</h2>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[#9C9C9C] text-sm font-medium">{selectedMeal.macros.kcal} calories</p>
                                            <div className="w-1 h-1 rounded-full bg-[#D4C9BE]" />
                                            <p className="text-[#9C9C9C] text-sm font-medium">{selectedMeal.prep_time_min} min de prép</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button onClick={() => setSelectedMealId(null)} className="p-2.5 bg-[#F1EFE8] rounded-full text-[#5F5E5A] hover:bg-[#E8E0D8] transition-colors shadow-sm">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Protéines</span>
                                            <span className="text-xs font-black text-[#B09AE0]">{selectedMeal.macros.protein_g}g</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(selectedMeal.macros.protein_g / (profile.targets?.protein_g||150) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#B09AE0]" />
                                        </div>
                                        <p className="text-[9px] text-[#9C9C9C] mt-2">sur {profile.targets?.protein_g||150}g d'objectif quotidien</p>
                                    </div>
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Glucides</span>
                                            <span className="text-xs font-black text-[#F59E0B]">{selectedMeal.macros.carbs_g}g</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(selectedMeal.macros.carbs_g / (profile.targets?.carbs_g||200) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#F59E0B]" />
                                        </div>
                                        <p className="text-[9px] text-[#9C9C9C] mt-2">sur {profile.targets?.carbs_g||200}g d'objectif quotidien</p>
                                    </div>
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Lipides</span>
                                            <span className="text-xs font-black text-[#FFA07A]">{selectedMeal.macros.fats_g}g</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(selectedMeal.macros.fats_g / (profile.targets?.fats_g||65) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#FFA07A]" />
                                        </div>
                                        <p className="text-[9px] text-[#9C9C9C] mt-2">sur {profile.targets?.fats_g||65}g d'objectif quotidien</p>
                                    </div>
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Calories</span>
                                            <span className="text-xs font-black text-[#6BC4A0]">{selectedMeal.macros.kcal}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(selectedMeal.macros.kcal / (profile.targets?.kcal||2000) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#6BC4A0]" />
                                        </div>
                                        <p className="text-[9px] text-[#9C9C9C] mt-2">sur une limite de {profile.targets?.kcal||2000} kcal</p>
                                    </div>
                                </div>

                                {/* Ingredients & Allergens */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[#2D2D2D] mb-2">Ingrédients</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedMeal as any).ingredients?.map((ing: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-[#F5F0EA] text-[#6B6B6B] rounded-full text-[11px] font-medium">{ing}</span>
                                        )) || <span className="text-[11px] text-[#9C9C9C]">Liste d'ingrédients parfaitement préparée par nos chefs.</span>}
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[#2D2D2D] mb-2">Contient</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMeal.allergens.length > 0 ? (
                                            selectedMeal.allergens.map((alg, i) => (
                                                <span key={i} className="px-3 py-1 bg-[#FCEBEB] text-[#791F1F] rounded-full text-[11px] font-bold">{alg.replace('_', ' ')}</span>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[#6BC4A0] text-[11px] font-bold">
                                                <ShieldCheck size={14} /> Aucun allergène courant
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rating Note */}
                                <div className="mb-8">
                                    {(selectedMeal as any).rating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-[#F59E0B]"><Star size={14} fill="#F59E0B" /><Star size={14} fill="#F59E0B" /><Star size={14} fill="#F59E0B" /></div>
                                            <span className="text-xs font-bold text-[#633806]">Vous avez noté ce repas {(selectedMeal as any).rating}★</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-[#9C9C9C] italic">Première fois que vous essayez celui-ci</span>
                                    )}
                                </div>

                                {/* Action button */}
                                <div className="mt-auto">
                                    {plan.planned_meals.some(pm => pm.meal_id === selectedMeal.id) ? (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMealId(null);
                                                setTimeout(() => {
                                                    setActivePopoverMealId(selectedMeal.id);
                                                    setPopoverRect({ left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, bottom: window.innerHeight / 2, right: window.innerWidth / 2 } as DOMRect);
                                                }, 300);
                                            }}
                                            className="w-full bg-white border-2 border-[#6BC4A0] text-[#6BC4A0] hover:bg-[#F1FAF4] font-bold py-4 rounded-full transition-colors flex justify-center items-center gap-2"
                                        >
                                            Échanger avec un autre jour →
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMealId(null);
                                                setTimeout(() => {
                                                    setActivePopoverMealId(selectedMeal.id);
                                                    setPopoverRect({ left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, bottom: window.innerHeight / 2, right: window.innerWidth / 2 } as DOMRect);
                                                }, 300);
                                            }}
                                            className="w-full bg-[#6BC4A0] text-white hover:bg-[#5BB48F] font-bold py-4 rounded-full shadow-[0_8px_24px_rgba(107,196,160,0.3)] transition-colors flex justify-center items-center gap-2"
                                        >
                                            Ajouter au plan →
                                        </button>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}

function remainingVal(val: number) {
    return Math.max(val, 1) * 1.5;
}
