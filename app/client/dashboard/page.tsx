"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/layout/header";
import { MacroBlob } from "@/components/ui/macro-blob";
import { MacroBlobSkeleton } from "@/components/ui/macro-blob-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { StreakPlant } from "@/components/ui/streak-plant";
import { usePointsStore, useMealsStore, usePlannerStore, useProfileStore, useSubscriptionStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, ChevronRight, Leaf, Calendar, TrendingDown, TrendingUp, Minus,
    Dumbbell, Flame, Trophy, Sparkles, Star, Truck, X
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Meal } from "@/lib/types";

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const [showRatingSheet, setShowRatingSheet] = useState(false);
    const [ratingMeal, setRatingMeal] = useState<{ meal: Meal, plannedId: string } | null>(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [hideWeeklySummary, setHideWeeklySummary] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        setHasMounted(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Countdown interval
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const { points, addPoints } = usePointsStore();
    const { meals } = useMealsStore();
    const { plan, updateMealStatus } = usePlannerStore();
    const { profile } = useProfileStore();
    const { subscription } = useSubscriptionStore();

    if (!hasMounted) return null;

    const hours = now.getHours();
    const dayOfWeek = now.getDay();
    const isSundayEvening = dayOfWeek === 0 && hours >= 17;

    const firstName = profile.name ? profile.name.split(" ")[0] : "Bienvenue";
    const targets = { kcal: profile.targets?.kcal || 2000, protein_g: profile.targets?.protein_g || 150, carbs_g: profile.targets?.carbs_g || 200, fats_g: profile.targets?.fats_g || 65 };

    // Derived helpers
    const getTodayPlanned = () => plan.planned_meals.filter((pm) => pm.day_index === 0 && pm.status !== "skipped");
    const todayPlanned = getTodayPlanned();
    const todayMealIds = todayPlanned.map((pm) => pm.meal_id);
    const todayMeals = meals.filter((m) => todayMealIds.includes(m.id));

    const getTodayConsumed = () => {
        const confirmedToday = plan.planned_meals.filter(pm => pm.day_index === 0 && pm.status === "confirmed");
        const consumedMeals = meals.filter(m => confirmedToday.some(pm => pm.meal_id === m.id));
        return consumedMeals.reduce((acc, meal) => ({
            kcal: acc.kcal + meal.macros.kcal,
            protein_g: acc.protein_g + meal.macros.protein_g,
            carbs_g: acc.carbs_g + meal.macros.carbs_g,
            fats_g: acc.fats_g + meal.macros.fats_g,
        }), { kcal: 0, protein_g: 0, carbs_g: 0, fats_g: 0 });
    };

    const getEmptyPlannerDays = () => {
        const daysWithMeals = new Set(plan.planned_meals.map(pm => pm.day_index));
        const empty = [];
        for (let i = 0; i < 7; i++) {
            if (!daysWithMeals.has(i)) empty.push(i);
        }
        return empty; // 0=Mon, 6=Sun
    };

    const consumed = getTodayConsumed();
    const emptyDays = getEmptyPlannerDays();

    // Feature 1: Greeting
    let timeGreeting = "Bon après-midi";
    if (hours >= 5 && hours < 12) timeGreeting = "Bonjour";
    else if (hours >= 17 && hours < 22) timeGreeting = "Bonsoir";
    else if (hours >= 22 || hours < 5) timeGreeting = "Encore debout,";

    let contextSubline = "Voici votre bilan nutritionnel pour aujourd'hui.";
    const hasNext3DaysEmpty = emptyDays.some(d => d <= 3);
    const isWednesdayAfter18 = dayOfWeek === 3 && hours >= 18; // 3 is Wednesday

    if (hasNext3DaysEmpty && isWednesdayAfter18) {
        contextSubline = "La limite de jeudi est dans quelques heures — vous avez des créneaux vides.";
    } else if (plan.planned_meals.length === 0) {
        contextSubline = "Votre semaine n'est pas encore planifiée. Construisons-la — cela prend 2 minutes.";
    } else if (consumed.kcal === 0 && hours > 9) {
        contextSubline = "Vous n'avez pas encore enregistré de repas aujourd'hui. Votre premier repas vous attend.";
    } else if (consumed.protein_g < targets.protein_g * 0.3 && hours > 14) {
        const gap = Math.round(targets.protein_g - consumed.protein_g);
        contextSubline = `Il vous manque ${gap}g de protéines — une collation riche en protéines réglerait cela.`;
    } else if (points.streak > 0) {
        contextSubline = `Jour ${points.streak} de votre série — continuez.`;
    }

    // Goal Chip
    let goalChip = null;
    switch(profile.goal) {
        case "weight_loss": goalChip = { text: "Brûler les graisses", icon: TrendingDown, color: "#FFA07A" }; break;
        case "muscle_gain": goalChip = { text: "Prendre de la masse", icon: TrendingUp, color: "#6BC4A0" }; break;
        case "maintenance": goalChip = { text: "Maintien", icon: Minus, color: "#B09AE0" }; break;
        default: goalChip = { text: "Alimentation saine", icon: Leaf, color: "#6BC4A0" }; break;
    }

    // Feature 2: Insight Strip
    const insights = [];
    if ((targets.protein_g - consumed.protein_g) > 20) {
        insights.push({
            id: 'protein', color: '#B09AE0', icon: Dumbbell,
            title: `${Math.round(targets.protein_g - consumed.protein_g)}g de protéines restantes`,
            sub: "Ajoutez un repas riche en protéines pour combler l'écart",
            cta: { label: 'Trouver des repas', href: '/client/menu?filter=high-protein' }
        });
    }
    if (points.streak > 2 && consumed.kcal === 0 && hours > 16) {
        insights.push({
            id: 'streak', color: '#FFA07A', icon: Flame,
            title: `Série de ${points.streak} jours en danger`,
            sub: 'Enregistrez un repas avant minuit pour la maintenir',
            cta: { label: 'Enregistrer', action: 'scroll' }
        });
    }
    if (emptyDays.length > 0) {
        insights.push({
            id: 'empty', color: '#6BC4A0', icon: Calendar,
            title: `${emptyDays.length} jour${emptyDays.length > 1 ? 's' : ''} non planifié${emptyDays.length > 1 ? 's' : ''} cette semaine`,
            sub: emptyDays.length === 1 ? "Un jour n'a pas de repas" : 'Certains jours sont encore vides',
            cta: { label: 'Ouvrir le planificateur', href: '/client/planner' }
        });
    }
    const pctCal = consumed.kcal / targets.kcal;
    if (pctCal >= 0.85 && pctCal <= 1.05) {
        insights.push({
            id: 'ontrack', color: '#F59E0B', icon: Trophy,
            title: "En bonne voie aujourd'hui",
            sub: `${Math.round(pctCal * 100)}% de votre objectif calorique atteint`,
            cta: null
        });
    }

    const topInsights = insights.slice(0, 3);
    if (topInsights.length === 0) {
        topInsights.push({
            id: 'perfect', color: '#F59E0B', icon: Trophy,
            title: "Vous assurez aujourd'hui",
            sub: "Tous les objectifs sont en bonne voie. Continuez.",
            cta: null
        });
    }

    // Feature 5: Countdown
    const subStartDate = new Date(subscription.starts_at || Date.now());
    let deliveryDaysDelta = 7;
    const deliveryDate = new Date(subStartDate);
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDaysDelta);
    
    // Nearest Thursday at Midnight cutoff
    const cutoffDate = new Date(now);
    cutoffDate.setHours(23, 59, 59, 999);
    while (cutoffDate.getDay() !== 4) cutoffDate.setDate(cutoffDate.getDate() + 1);
    
    const msUntilCutoff = cutoffDate.getTime() - now.getTime();
    let hoursLeft = Math.floor((msUntilCutoff / (1000 * 60 * 60)) % 24);
    let minutesLeft = Math.floor((msUntilCutoff / 1000 / 60) % 60);
    let secondsLeft = Math.floor((msUntilCutoff / 1000) % 60);

    const isCutoffUrgent = emptyDays.length > 0 && msUntilCutoff < 86400000;
    const isDeliveryTomorrow = msUntilCutoff < 172800000 && msUntilCutoff > 86400000 && emptyDays.length === 0;

    const deliveryDateName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(deliveryDate);

    // Feature 7: Summary
    const daysPlannedCount = 7 - emptyDays.length;
    const avgCal = Math.round(consumed.kcal); // Using today's consumed as avg mock
    
    // Handlers
    const handleEatMeal = (meal: Meal, plannedId: string) => {
        updateMealStatus(plannedId, "confirmed");
        setRatingMeal({ meal, plannedId });
        setShowRatingSheet(true);
    };

    const handleRatingSubmit = () => {
        addPoints(10);
        setShowRatingSheet(false);
        // Show +10 animation toast
        toast.custom((t) => (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 bg-[#F59E0B] text-white px-4 py-2 rounded-xl shadow-lg border-2 border-[#D97706] font-bold">
                <Star size={18} className="fill-white" /> +10 Points Gagnés !
            </motion.div>
        ));
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden relative">
            <Header
                title=""
                subtitle=""
            />
            
            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10 pt-2">
                
                {/* Feature 1 — Smart greeting strip */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="max-w-xl">
                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
                                className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2D2D2D]"
                            >
                                {timeGreeting}{timeGreeting.endsWith(',') ? '' : ','} {firstName}.
                            </motion.h1>
                            <motion.p 
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
                                className="text-[#6B6B6B] mt-2 md:text-lg"
                            >
                                {contextSubline}
                            </motion.p>
                        </div>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="inline-flex self-start md:self-auto">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E8E0D8] shadow-sm">
                                <goalChip.icon size={14} style={{ color: goalChip.color }} />
                                <span className="text-xs font-bold text-[#2D2D2D]">{goalChip.text}</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Feature 2 — AI insight cards strip */}
                <section className="-mx-6 px-6 md:mx-0 md:px-0">
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                        {topInsights.map((insight, i) => (
                            <motion.div
                                key={insight.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 + i * 0.06 }}
                                className="flex-none w-[280px] bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(45,45,45,0.04)] relative overflow-hidden snap-center flex flex-col justify-between"
                                style={{ borderLeft: `3px solid ${insight.color}` }}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <insight.icon size={16} style={{ color: insight.color }} />
                                        <h4 className="font-bold text-[#2D2D2D] leading-tight">{insight.title}</h4>
                                    </div>
                                    <p className="text-xs text-[#9C9C9C]">{insight.sub}</p>
                                </div>
                                {insight.cta && (
                                    <div className="mt-4">
                                        {insight.cta.href ? (
                                            <Link href={insight.cta.href} className="text-xs font-bold text-[#2D2D2D] underline hover:text-[#6BC4A0] transition-colors">{insight.cta.label} →</Link>
                                        ) : (
                                            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="text-xs font-bold text-[#2D2D2D] underline hover:text-[#FFA07A] transition-colors">{insight.cta.label} →</button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Feature 5 — Next delivery countdown widget */}
                <motion.section 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                >
                    <div className={`w-full rounded-2xl p-5 shadow-[0_4px_24px_rgba(45,45,45,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${isCutoffUrgent ? 'bg-[#FF6B6B]/5 border-[#FF6B6B]/20' : (isDeliveryTomorrow ? 'bg-[#FFA07A]/5 border-[#FFA07A]/20' : 'bg-white border-[#F0EBE3]')}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCutoffUrgent ? 'bg-[#FF6B6B]/10' : (isDeliveryTomorrow ? 'bg-[#FFA07A]/10' : 'bg-[#6BC4A0]/10')}`}>
                                <Truck size={20} className={isCutoffUrgent ? "text-[#FF6B6B] animate-pulse" : (isDeliveryTomorrow ? "text-[#FFA07A]" : "text-[#6BC4A0]")} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold capitalize tracking-wide text-[#9C9C9C] mb-0.5">Prochaine livraison</h4>
                                {isCutoffUrgent ? (
                                    <p className="font-semibold text-[#FF6B6B] text-sm"><Link href="/client/planner" className="underline hover:text-[#E05252]">{emptyDays.length} jours non planifiés — confirmez avant minuit →</Link></p>
                                ) : (
                                    <p className={`font-semibold text-sm ${isDeliveryTomorrow ? 'text-[#FFA07A]' : 'text-[#2D2D2D]'}`}>
                                        {isDeliveryTomorrow ? 'Arrive demain — plan confirmé' : `${deliveryDateName}, 7h–12h`}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center border border-[#E8E0D8]/50 bg-[#F8F5F2] rounded-xl overflow-hidden divide-x divide-[#E8E0D8]/50">
                            <div className="px-3 py-1.5 flex flex-col items-center min-w-[48px]">
                                <span className="font-bold text-[#6B6B6B] font-mono leading-none">{String(hoursLeft).padStart(2, '0')}</span>
                                <span className="text-[9px] text-[#9C9C9C] capitalize font-bold mt-0.5">Heures</span>
                            </div>
                            <div className="px-3 py-1.5 flex flex-col items-center min-w-[48px]">
                                <span className="font-bold text-[#6B6B6B] font-mono leading-none">{String(minutesLeft).padStart(2, '0')}</span>
                                <span className="text-[9px] text-[#9C9C9C] capitalize font-bold mt-0.5">Min</span>
                            </div>
                            <div className="px-3 py-1.5 flex flex-col items-center min-w-[48px]">
                                <span className="font-bold text-[#6B6B6B] font-mono leading-none">{String(secondsLeft).padStart(2, '0')}</span>
                                <span className="text-[9px] text-[#9C9C9C] capitalize font-bold mt-0.5">Sec</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Macro Progress Section */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {isLoading ? (
                            <>
                                <MacroBlobSkeleton />
                                <MacroBlobSkeleton />
                                <MacroBlobSkeleton />
                                <MacroBlobSkeleton />
                            </>
                        ) : (
                            <>
                                <MacroBlob
                                    label="Calories"
                                    value={consumed.kcal}
                                    target={targets.kcal}
                                    unit=" kcal"
                                    color="#FFA07A"
                                    bgColor="linear-gradient(135deg, #FFD3B622, #FFA07A11)"
                                    delay={0}
                                />
                                <MacroBlob
                                    label="Protéines"
                                    value={consumed.protein_g}
                                    target={targets.protein_g}
                                    color="#B09AE0"
                                    bgColor="linear-gradient(135deg, #D6C1FF22, #B09AE011)"
                                    delay={0.1}
                                />
                                <MacroBlob
                                    label="Glucides"
                                    value={consumed.carbs_g}
                                    target={targets.carbs_g}
                                    color="#6BC4A0"
                                    bgColor="linear-gradient(135deg, #A8E6CF22, #6BC4A011)"
                                    delay={0.2}
                                />
                                <MacroBlob
                                    label="Lipides"
                                    value={consumed.fats_g}
                                    target={targets.fats_g}
                                    color="#F59E0B"
                                    bgColor="linear-gradient(135deg, #FFE5A022, #F59E0B11)"
                                    delay={0.3}
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* Bottom grid: Today's meals + Streak + Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Today's Meals / Feature 6: Empty State */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`md:col-span-2 p-6 rounded-[20px] ${todayMeals.length === 0 ? 'bg-[#FFF8F4] border-dashed border-2 border-[#D4C9BE]' : 'bg-white shadow-[0_12px_40px_rgba(45,45,45,0.06)]'}`}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className={`font-serif text-xl ${todayMeals.length === 0 ? 'text-[#9C9C9C]' : 'text-[#2D2D2D]'}`}>Repas d'Aujourd'hui</h2>
                            <Link href="/client/planner">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    className="flex items-center gap-1.5 text-sm text-[#6BC4A0] font-semibold"
                                >
                                    <Calendar size={14} /> Planificateur
                                </motion.button>
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="w-full h-[76px] rounded-2xl" />
                                <Skeleton className="w-full h-[76px] rounded-2xl" />
                                <Skeleton className="w-full h-[76px] rounded-2xl" />
                            </div>
                        ) : todayMeals.length === 0 ? (
                            <div className="flex flex-col items-center py-10 text-center">
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4">
                                    <path d="M12 32C12 43.0457 20.9543 52 32 52C43.0457 52 52 43.0457 52 32M8 32H56" stroke="#6BC4A0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M24 20C24 20 28 16 28 12C28 8 24 4 24 4" stroke="#6BC4A0" strokeWidth="3" strokeLinecap="round"/>
                                    <path d="M32 20C32 20 36 16 36 12C36 8 32 4 32 4" stroke="#6BC4A0" strokeWidth="3" strokeLinecap="round"/>
                                    <path d="M40 20C40 20 44 16 44 12C44 8 40 4 40 4" stroke="#6BC4A0" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                                <h3 className="font-serif text-2xl text-[#2D2D2D] mb-1">
                                    {profile.goal === 'weight_loss' ? "Votre budget calorique est encore ouvert aujourd'hui" :
                                     profile.goal === 'muscle_gain' ? "Nourrissez vos muscles — rien de prévu pour le moment" :
                                     profile.goal === 'maintenance' ? "Une ardoise vierge — que mangez-vous aujourd'hui ?" :
                                     "Nouveau départ — remplissons cette journée de bons plats"}
                                </h3>
                                <p className="text-[#6B6B6B] text-sm mb-6">
                                    Nous suggérerons des repas adaptés à votre cible de {profile.goal === 'muscle_gain' ? 'protéines' : profile.goal === 'weight_loss' ? 'calories' : 'macros équilibrés'}.
                                </p>
                                <Link href="/client/menu?filter=today-match">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-[#6BC4A0] px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-[0_4px_16px_rgba(107,196,160,0.3)]">
                                        Trouver des repas pour aujourd'hui →
                                    </motion.button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todayMeals.map((meal, idx) => {
                                    const mappedPlanner = todayPlanned.find(pm => pm.meal_id === meal.id);
                                    const isConsumed = mappedPlanner?.status === "confirmed";
                                    return (
                                        <motion.div
                                            key={`${meal.id}-${idx}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.08 }}
                                            className={`flex items-center gap-4 p-3.5 rounded-2xl transition-colors cursor-pointer group ${isConsumed ? 'bg-[#F9F9F9] opacity-70 grayscale-[30%]' : 'hover:bg-[#F1FAF4] border border-transparent'}`}
                                        >
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                                style={{ background: "linear-gradient(135deg, #F1FAF4, #A8E6CF22)" }}>
                                                {meal.emoji}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm text-[#2D2D2D]">{meal.name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[11px] text-[#FFA07A] font-medium">{meal.macros.kcal} kcal</span>
                                                    <span className="text-[11px] text-[#B09AE0] font-medium">{meal.macros.protein_g}g P</span>
                                                    <span className="text-[11px] text-[#6BC4A0] font-medium">{meal.macros.carbs_g}g G</span>
                                                </div>
                                            </div>
                                            {!isConsumed ? (
                                                <button
                                                    onClick={() => mappedPlanner && handleEatMeal(meal, mappedPlanner.id)}
                                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-xs font-semibold text-[#6BC4A0] border border-[#A8E6CF] px-4 py-2 rounded-xl transition-all hover:bg-[#F1FAF4]"
                                                >
                                                    Manger
                                                </button>
                                            ) : (
                                                <div className="text-xs font-bold text-[#9C9C9C] px-3">Mangé ✓</div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column: Streak + Quick Actions */}
                    <div className="flex flex-col gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <StreakPlant streak={points.streak} stage={points.plant_stage} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="p-5 rounded-[20px] bg-white shadow-[0_12px_40px_rgba(45,45,45,0.06)]"
                        >
                            <h3 className="font-semibold text-sm text-[#2D2D2D] mb-3">Actions Rapides</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Explorer le menu", href: "/client/menu", color: "#6BC4A0", emoji: "🥗" },
                                    { label: "Mon planificateur", href: "/client/planner", color: "#B09AE0", emoji: "📅" },
                                    { label: "Clinique IA", href: "/client/clinic", color: "#FFA07A", emoji: "💬" },
                                ].map((action) => (
                                    <Link key={action.href} href={action.href}>
                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F1FAF4] transition-colors cursor-pointer"
                                        >
                                            <span className="text-lg">{action.emoji}</span>
                                            <span className="text-sm font-medium text-[#2D2D2D]">{action.label}</span>
                                            <ChevronRight size={14} className="ml-auto text-[#9C9C9C]" />
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                            className="p-5 rounded-[20px] relative overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #6BC4A0, #2F8B60)", boxShadow: "0 8px 32px rgba(107,196,160,0.3)" }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={48} color="white" /></div>
                            <div className="flex items-center gap-2 mb-1 relative z-10">
                                <Leaf size={16} className="text-white/80" />
                                <span className="text-white/80 text-xs font-medium">NourishPoints</span>
                            </div>
                            <p className="text-white text-3xl font-bold relative z-10">{points.balance.toLocaleString()}</p>
                            <p className="text-white/70 text-xs mt-1 relative z-10">≈ {Math.floor(points.balance / 100)} repas gratuits</p>
                        </motion.div>
                    </div>
                </div>

                {/* Feature 7: Weekly Summary Card (Sunday Evenings Only) */}
                <AnimatePresence>
                    {isSundayEvening && !hideWeeklySummary && (
                        <motion.section 
                            initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            viewport={{ once: true }}
                            className="w-full bg-[#B09AE0]/5 border border-[#B09AE0]/20 rounded-[20px] p-6 md:p-8 relative"
                        >
                            <button onClick={() => setHideWeeklySummary(true)} className="absolute top-6 right-6 p-1 text-[#9C9C9C] hover:text-[#2D2D2D] transition-colors"><X size={16} /></button>
                            <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Votre semaine en revue</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs font-bold text-[#9C9C9C] capitalize tracking-wide mb-1">Planification</p>
                                    <p className="text-2xl font-bold text-[#2D2D2D]">{daysPlannedCount}<span className="text-[#9C9C9C] text-lg font-medium">/7 jours</span></p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs font-bold text-[#9C9C9C] capitalize tracking-wide mb-1">Calories Atteintes</p>
                                    <p className="text-2xl font-bold text-[#2D2D2D]">{Math.round((avgCal / targets.kcal) * 100)}%</p>
                                    <p className="text-xs text-[#9C9C9C] font-mono mt-0.5">({avgCal}/{targets.kcal})</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs font-bold text-[#9C9C9C] capitalize tracking-wide mb-1">Meilleure Série</p>
                                    <p className="text-2xl font-bold text-[#2D2D2D]">{points.streak} <span className="text-[#9C9C9C] text-lg font-medium">jours</span></p>
                                </div>
                            </div>
                            <p className="text-[#6B6B6B] italic text-sm font-sans">
                                Une nouvelle semaine commence demain — votre prochaine box est en cours de préparation.
                            </p>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>

            {/* Feature 4: Post-meal rating bottom sheet */}
            <AnimatePresence>
                {showRatingSheet && ratingMeal && (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
                        {/* Backdrop removed so page remains fully interactive */}
                        
                        {/* Box */}
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white px-6 py-8 rounded-t-3xl shadow-[0_-12px_40px_rgba(45,45,45,0.08)] mx-auto w-full max-w-2xl relative pointer-events-auto flex flex-col"
                        >
                            <button 
                                onClick={() => setShowRatingSheet(false)}
                                className="absolute top-4 right-4 p-2 bg-[#FFF8F4] text-[#9C9C9C] hover:text-[#2D2D2D] rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <p className="text-xs font-semibold text-[#9C9C9C] text-center mb-4 capitalize tracking-wider mt-2">Comment était {ratingMeal.meal.name} ?</p>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star, i) => (
                                    <motion.button 
                                        key={star}
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                                        onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                    >
                                        <Star size={36} className={`transition-colors ${hoverRating >= star ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E8E0D8] fill-transparent'}`} />
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex justify-center gap-3 mb-8">
                                {["😋 Délicieux", "😊 Satisfait", "😐 Encore faim"].map((r, i) => (
                                    <button key={i} className="px-4 py-2 rounded-full border border-[#E8E0D8] text-sm font-bold text-[#2D2D2D] hover:border-[#6BC4A0] hover:bg-[#F1FAF4] hover:text-[#2F8B60] transition-colors focus:ring-2 focus:ring-[#6BC4A0]/20">
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <button onClick={() => setShowRatingSheet(false)} className="text-sm font-bold text-[#9C9C9C] hover:text-[#2D2D2D] px-4 py-3 underline underline-offset-4">
                                    Ignorer ce sondage
                                </button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleRatingSubmit} 
                                    className="bg-[#6BC4A0] px-8 py-3 rounded-full text-white font-bold shadow-[0_4px_16px_rgba(107,196,160,0.3)] relative overflow-hidden"
                                >
                                    Terminé +10 pts →
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
        </div>
    );
}
