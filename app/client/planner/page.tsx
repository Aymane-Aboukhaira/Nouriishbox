"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { usePlannerStore, useMealsStore, useProfileStore, useSubscriptionStore, usePointsStore, useFamilyStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
    closestCenter,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { Pause, Play, CheckCircle, Trash2, Plus, AlertTriangle, X, Search, Copy, Wand2, ShieldCheck, Star, Lock, MapPin, Clock3, MessageCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PlannedMeal, Meal, DeliveryTimeSlot, DeliveryLocation } from "@/lib/types";
import { isMealExcludedByTaste, getDietBoost } from "@/lib/taste-filter";

const DAY_KEYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAY_EMOJIS = ["☀️", "🌤️", "⛅", "🌥️", "🌦️", "🌈", "🌙"];

// ── Helpers ──────────────────────────────────────────────────
function getThursdayCutoff(): Date {
    const now = new Date();
    const day = now.getDay();
    const daysUntilThursday = (4 - day + 7) % 7;
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() + daysUntilThursday);
    cutoff.setHours(23, 59, 59, 0);
    return cutoff;
}

function generateWeekPlan(
    strategy: 'balanced' | 'variety' | 'repeat',
    meals: Meal[],
    profile: any,
    pausedDays: number[]
): Record<string, Meal> {
    const result: Record<string, Meal> = {};
    const usedIds = new Set<string>();
    
    const perMealProtein = (profile.targets?.protein_g || 150) / 3;
    const perMealCarbs = (profile.targets?.carbs_g || 200) / 3;
    const perMealFats = (profile.targets?.fats_g || 65) / 3;
    
    // Sort meals by macro match initially
    const scored = meals.map(m => ({
        ...m,
        score: Math.max(0, 100 - (
            Math.abs(m.macros.protein_g - perMealProtein) +
            Math.abs(m.macros.carbs_g - perMealCarbs) +
            Math.abs(m.macros.fats_g - perMealFats)
        ) / (perMealProtein + perMealCarbs + perMealFats) * 100)
    })).sort((a, b) => b.score - a.score);
    
    // Seed for regenerate variation: random noise
    const isRegen = Math.random() > 0.5;
    if (isRegen && strategy !== 'repeat') {
        scored.sort((a, b) => (b.score + Math.random() * 10) - (a.score + Math.random() * 10));
    }

    DAY_KEYS.forEach((dayKey, i) => {
        if (pausedDays.includes(i)) return; // skip paused days
        
        let candidates = [...scored];
        
        if (strategy === 'variety') {
            const available = candidates.filter(m => !usedIds.has(m.id));
            if (available.length > 0) candidates = available; // Fallback to duplicates if extremely exhausted
        } else if (strategy === 'repeat') {
            // Repeat favourites strategy
            // Using placeholder rating or fallback to highest score
            candidates.sort((a, b) => {
                const aRating = (a as any).rating || a.score;
                const bRating = (b as any).rating || b.score;
                return bRating - aRating;
            });
        }
        
        const pick = candidates[0] || scored[0];
        result[dayKey] = pick;
        usedIds.add(pick.id);
        
        if (strategy === 'balanced') {
            // slight rotation for variety across the week while maintaining quality
            const pickedIdx = scored.findIndex(m => m.id === pick.id);
            if (pickedIdx > -1) {
                const [item] = scored.splice(pickedIdx, 1);
                scored.push(item);
            }
        }
    });
    
    return result;
}

// ── Components ───────────────────────────────────────────────

function DayMacroBar({ meal, profile, isHovered }: { meal: Meal; profile: any; isHovered: boolean }) {
    const pTarget = (profile.targets?.protein_g || 150) / 3;
    const cTarget = (profile.targets?.carbs_g || 200) / 3;
    const fTarget = (profile.targets?.fats_g || 65) / 3;
    const pPct = Math.min(Math.round(meal.macros.protein_g / pTarget * 100), 100);
    const cPct = Math.min(Math.round(meal.macros.carbs_g / cTarget * 100), 100);
    const fPct = Math.min(Math.round(meal.macros.fats_g / fTarget * 100), 100);

    return (
        <div className="relative mt-1 mb-2 pointer-events-none">
            {/* Desktop: compact bars */}
            <div className="hidden lg:flex flex-col gap-[2px]">
                <div className="h-[3px] w-full bg-[#F0EBE3] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full bg-[#B09AE0]" />
                </div>
                <div className="h-[3px] w-full bg-[#F0EBE3] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full bg-[#F59E0B]" />
                </div>
                <div className="h-[3px] w-full bg-[#F0EBE3] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${fPct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full bg-[#FFA07A]" />
                </div>
            </div>

            {/* Mobile: stacked rows with labels, bars, percentages */}
            <div className="flex lg:hidden flex-col gap-1.5">
                {[
                    { label: 'Prot', value: meal.macros.protein_g, target: pTarget, pct: pPct, color: '#B09AE0' },
                    { label: 'Gluc', value: meal.macros.carbs_g, target: cTarget, pct: cPct, color: '#F59E0B' },
                    { label: 'Lip', value: meal.macros.fats_g, target: fTarget, pct: fPct, color: '#FFA07A' },
                ].map(m => (
                    <div key={m.label} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#6B6B6B] w-8 flex-shrink-0">{m.label}</span>
                        <div className="flex-1 h-[8px] bg-[#F0EBE3] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: m.color }} />
                        </div>
                        <span className="text-[13px] font-bold text-[#2D2D2D] w-10 text-right flex-shrink-0">{m.pct}%</span>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: -8 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 bg-[#2D2D2D] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                    >
                        P: {meal.macros.protein_g}g · C: {meal.macros.carbs_g}g · F: {meal.macros.fats_g}g
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DraggableMealItem({
    plannedMeal,
    meal,
    profile,
    isConfirmed,
    isNew,
    dayKey,
    onRemove,
    onDuplicate,
    onCardClick,
}: {
    plannedMeal: PlannedMeal;
    meal: Meal;
    profile: any;
    isConfirmed: boolean;
    isNew: boolean;
    dayKey: string;
    onRemove: () => void;
    onDuplicate: () => void;
    onCardClick: () => void;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: plannedMeal.id,
        data: { type: 'Meal', dayKey, plannedMealId: plannedMeal.id, plannedMeal, meal },
        disabled: isConfirmed,
    });

    const [isHovered, setIsHovered] = useState(false);
    const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
    const isDragRef = useRef(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isDragging ? 0.4 : 1, scale: isDragging ? 1.02 : 1 }}
            transition={{ duration: 0.15 }}
            className="group relative"
        >
            {/* Full-card drag wrapper: ref + listeners live here, NOT on motion.div */}
            <div
                ref={setNodeRef}
                {...(isConfirmed ? {} : listeners)}
                {...(isConfirmed ? {} : attributes)}
                className={`w-full h-full ${!isConfirmed ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onPointerDown={(e) => {
                    pointerStartRef.current = { x: e.clientX, y: e.clientY };
                    isDragRef.current = false;
                    if (!isConfirmed && listeners?.onPointerDown) {
                        listeners.onPointerDown(e);
                    }
                }}
                onPointerMove={(e) => {
                    if (!pointerStartRef.current) return;
                    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
                    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
                    if (dx > 5 || dy > 5) isDragRef.current = true;
                }}
                onClick={() => {
                    if (!isDragRef.current) onCardClick();
                }}
            >
                <DayMacroBar meal={meal} profile={profile} isHovered={isHovered} />
                <motion.div
                    animate={isNew ? { backgroundColor: ['#E1F5EE', '#FFFFFF'] } : {}}
                    transition={{ duration: 0.6 }}
                    className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-2xl border transition-all relative ${isConfirmed ? 'border-[#F0E4D8]' : 'border-[#F0E4D8] hover:border-[#6BC4A0] bg-white'}`}
                    style={{ boxShadow: "0 2px 8px rgba(45,45,45,0.05)" }}
                >
                    <span className="text-xl flex-shrink-0">{meal.emoji}</span>
                    <div className="flex-1 min-w-0 pr-1">
                        <p className="text-[11px] font-semibold text-[#2D2D2D] leading-tight line-clamp-2">{meal.name}</p>
                        <p className="text-[9px] text-[#9C9C9C]">{meal.macros.kcal} kcal</p>
                    </div>
                    {!isConfirmed ? (
                        <div className="flex lg:flex-col items-center gap-2 lg:gap-1 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-all absolute lg:right-1 lg:top-1/2 lg:-translate-y-1/2 -top-2 -right-2 bg-white shadow-md lg:shadow-sm border border-[#F0E4D8] rounded-full lg:rounded-2xl p-1 z-20">
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                                className="text-[#9C9C9C] hover:text-[#B09AE0] p-2 rounded-full lg:rounded-xl transition-colors min-w-[44px] min-h-[44px] lg:min-w-[32px] lg:min-h-[32px] flex items-center justify-center"
                            >
                                <Copy size={16} className="lg:w-[14px] lg:h-[14px]" />
                            </button>
                            <div className="w-[1px] h-4 bg-[#F0E4D8] lg:hidden" />
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                className="text-[#9C9C9C] hover:text-[#E05252] p-2 rounded-full lg:rounded-xl transition-colors min-w-[44px] min-h-[44px] lg:min-w-[32px] lg:min-h-[32px] flex items-center justify-center"
                            >
                                <Trash2 size={16} className="lg:w-[14px] lg:h-[14px]" />
                            </button>
                        </div>
                    ) : (
                        <div className="absolute -top-2 -right-2 bg-[#6BC4A0] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <CheckCircle size={10} className="text-white" />
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

function DrawerDraggableMeal({ meal, score, onAdd }: { meal: Meal; score: number; onAdd?: () => void }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `drawer-meal-${meal.id}`,
        data: { type: 'drawer-meal', meal }
    });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className="min-w-[140px] max-w-[160px] min-h-[64px] bg-white rounded-2xl border border-[#F0E4D8] p-3 shadow-sm flex flex-col items-center text-center hover:border-[#6BC4A0] cursor-grab active:cursor-grabbing transition-colors relative">
            <div className="text-2xl mb-1 mt-1">{meal.emoji}</div>
            <p className="text-[12px] font-semibold text-[#2D2D2D] line-clamp-2 h-8 leading-tight mb-1">{meal.name}</p>
            <p className="text-[11px] text-[#9C9C9C] mb-2">{meal.macros.kcal} kcal</p>
            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-full mb-3 ${score >= 80 ? 'bg-[#E1F5EE] text-[#085041]' : score >= 60 ? 'bg-[#FAEEDA] text-[#633806]' : 'bg-[#E8E8E8] text-[#9C9C9C]'}`}>
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Bon match' : 'Correct'} ({score}%)
            </div>
            <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
                className="w-full bg-[#F1EFE8] text-[#2D2D2D] hover:bg-[#E8E0D8] py-2 rounded-xl text-xs font-bold mt-auto transition-colors shadow-sm min-h-[44px]"
            >
                + Ajouter
            </button>
        </div>
    );
}

function DrawerDraggablePreviouslyUsed({ meal, dayLabel, onAdd }: { meal: Meal; dayLabel: string; onAdd?: () => void }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `drawer-meal-used-${meal.id}`,
        data: { type: 'drawer-meal', meal }
    });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className="flex items-center justify-between min-w-[200px] bg-[#F9F9F9] rounded-xl p-2.5 border border-transparent hover:border-[#6BC4A0] cursor-grab active:cursor-grabbing transition-colors group">
            <div className="flex items-center gap-2">
                <span className="text-lg">{meal.emoji}</span>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold truncate w-24 text-[#2D2D2D]">{meal.name}</p>
                    <p className="text-[9px] text-[#9C9C9C]">le {dayLabel}</p>
                </div>
            </div>
            <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
                className="text-[10px] font-bold text-[#6BC4A0] bg-[#E1F5EE] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#bbf0da]"
            >
                + Ajouter
            </button>
        </div>
    );
}

function DayColumn({
    dayIndex,
    dayKey,
    dayLabel,
    dayEmoji,
    plannedMeals,
    meals,
    profile,
    isPaused,
    isConfirmed,
    urgencyHours,
    newlyAddedIds,
    onTogglePause,
    onRemoveMeal,
    onDuplicateMeal,
    onOpenAddDrawer,
    onCardClick,
    activeDragId,
}: {
    dayIndex: number;
    dayKey: string;
    dayLabel: string;
    dayEmoji: string;
    plannedMeals: PlannedMeal[];
    meals: Meal[];
    profile: any;
    isPaused: boolean;
    isConfirmed: boolean;
    urgencyHours: number;
    newlyAddedIds: Set<string>;
    onTogglePause: () => void;
    onRemoveMeal: (id: string) => void;
    onDuplicateMeal: (meal: Meal) => void;
    onOpenAddDrawer: () => void;
    onCardClick: (meal: Meal, pmId: string) => void;
    activeDragId: string | null;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: dayKey,
        data: { type: 'DayColumn', dayKey }
    });
    const hasMeal = plannedMeals.length > 0;
    
    // Header UI
    let headerColor = "text-[#2D2D2D]";
    let dayScore = 0;

    if (hasMeal && !isPaused) {
        const meal = meals.find((m) => m.id === plannedMeals[0].meal_id);
        if (meal) {
            const pPct = meal.macros.protein_g / ((profile.targets?.protein_g || 150) / 3);
            const cPct = meal.macros.carbs_g / ((profile.targets?.carbs_g || 200) / 3);
            const fPct = meal.macros.fats_g / ((profile.targets?.fats_g || 65) / 3);
            dayScore = (pPct + cPct + fPct) / 3 * 100;
            if (dayScore > 70) headerColor = "text-[#6BC4A0]";
            else if (dayScore < 50) headerColor = "text-[#F59E0B]";
        }
    } else if (isPaused) {
        headerColor = "text-[#9C9C9C] line-through";
    } else if (!hasMeal && urgencyHours < 12) {
        headerColor = "text-[#FFA07A] animate-[pulse_2s_ease-in-out_infinite]";
    } else if (!hasMeal && urgencyHours < 48) {
        headerColor = "text-[#F59E0B]";
    }

    const isEmptyUrgent = !hasMeal && !isPaused && urgencyHours < 24;
    const isEmptyWarning = !hasMeal && !isPaused && urgencyHours >= 24 && urgencyHours < 48;

    return (
        <div className="flex flex-col gap-2 relative min-w-0 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className={`text-xs font-bold transition-colors ${headerColor}`}>{dayEmoji} {dayLabel}</p>
                </div>
                {!isConfirmed && (
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={onTogglePause} title={isPaused ? "Reprendre" : "Pause"}
                        className="w-6 h-6 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                        style={{ background: isPaused ? "#FFD3B6" : "transparent", color: isPaused ? "#E07050" : "#9C9C9C" }}
                    >
                        {isPaused ? <Play size={10} /> : <Pause size={10} />}
                    </motion.button>
                )}
            </div>

            {/* Drop zone */}
            <motion.div
                ref={setNodeRef}
                animate={(isEmptyUrgent || !!activeDragId) ? { scale: [1, 1.01, 1], opacity: [1, 0.8, 1] } : { scale: 1, opacity: 1 }}
                transition={(isEmptyUrgent || !!activeDragId) ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                className={`flex flex-col gap-2 min-h-[160px] lg:min-h-[500px] flex-1 w-full p-2.5 rounded-2xl transition-all relative ${!hasMeal && !isPaused ? 'cursor-pointer' : ''}`}
                onClick={() => { if (!hasMeal && !isPaused && !isConfirmed) onOpenAddDrawer(); }}
                style={{
                    background: isPaused
                        ? "repeating-linear-gradient(-45deg, #FFF8F4, #FFF8F4 4px, #F0E4D8 4px, #F0E4D8 8px)"
                        : isOver
                            ? "linear-gradient(135deg, #F1FAF4, #A8E6CF22)"
                            : isEmptyUrgent ? "rgba(255,160,122,0.08)"
                            : "rgba(255,248,244,0.5)",
                    border: isPaused
                        ? "2px dashed #9C9C9C"
                        : isOver
                            ? "2px dashed #6BC4A0"
                            : isEmptyUrgent ? "2px dashed #FFA07A"
                            : isEmptyWarning ? "2px dashed #F59E0B"
                            : "2px dashed #F0E4D8",
                    opacity: isPaused ? 0.6 : 1,
                }}
            >
                {isEmptyWarning && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10">
                        Limite imminente
                    </div>
                )}
                {isEmptyUrgent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFA07A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10 shadow-sm">
                        Confirmez aujourd'hui
                    </div>
                )}
                
                {isPaused ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 text-[#9C9C9C]">
                        <span className="text-xl mb-1 mt-6">🔕</span>
                        <div className="h-[3px] w-full bg-[#E8E8E8] rounded-full mx-2 mb-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#D4C9BE] skew-x-[-45deg] bg-[length:10px_10px]" style={{backgroundImage: 'linear-gradient(-45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1) 100%)'}} />
                        </div>
                        <p className="text-[10px] text-center font-bold capitalize tracking-wider line-through">En pause</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {plannedMeals.map((pm) => {
                            const meal = meals.find((m) => m.id === pm.meal_id);
                            if (!meal) return null;
                            return (
                                <DraggableMealItem
                                    key={pm.id}
                                    plannedMeal={pm}
                                    meal={meal}
                                    profile={profile}
                                    isConfirmed={isConfirmed}
                                    isNew={newlyAddedIds.has(pm.id)}
                                    dayKey={dayKey}
                                    onRemove={() => onRemoveMeal(pm.id)}
                                    onDuplicate={() => onDuplicateMeal(meal)}
                                    onCardClick={() => onCardClick(meal, pm.id)}
                                />
                            );
                        })}
                        {plannedMeals.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-[#C4C4C4] py-6">
                                <div className="h-[3px] w-[80%] border-t-2 border-dashed border-[#F0E4D8] mb-4" />
                                <div className={`w-10 h-10 lg:w-8 lg:h-8 rounded-full border-2 flex items-center justify-center mb-2 ${isEmptyUrgent ? 'border-[#FFA07A]' : isEmptyWarning ? 'border-[#F59E0B]/50' : 'border-[#F0E4D8]'}`}>
                                    <Plus size={20} className={isEmptyUrgent ? "text-[#FFA07A]" : isEmptyWarning ? "text-[#F59E0B] animate-[pulse_4s_ease-in-out_infinite]" : "text-[#D4C9BE]"} />
                                </div>
                                <p className={`text-xs lg:text-[10px] font-bold capitalize tracking-wider ${isEmptyUrgent ? 'text-[#FFA07A]' : 'text-[#D4C9BE]'}`}>Déposer ici</p>
                                <p className="text-[10px] text-[#D4C9BE] mt-0.5 lg:hidden">ou appuyez pour ajouter</p>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}

// ── Main Planner Page ────────────────────────────────────────
export default function PlannerPage() {
    const router = useRouter();
    const { plan, moveMeal, togglePauseDay, setConfirmed, removeMealFromDay, assignMeal, deliveryAssignments, setDeliveryAssignment, plannerDays, clearMemberPlan } = usePlannerStore();
    const { meals } = useMealsStore();
    const { profile, setSavedAddress } = useProfileStore();
    const { members, activeMemberId, setActiveMember } = useFamilyStore();
    const { subscription } = useSubscriptionStore();
    const { addPoints } = usePointsStore();

    // Filter meals for the active family member
    const activeMemberMeals = useMemo(() => {
        return plan.planned_meals.filter(pm => 
            pm.family_member_id === activeMemberId || 
            (activeMemberId === 'f1' && (pm.family_member_id === 'u1' || !pm.family_member_id))
        );
    }, [plan.planned_meals, activeMemberId]);

    // ── Feature 6: Sunday lock ────────────────────────────────
    const isSunday = new Date().getDay() === 0;
    const isReadOnly = plan.confirmed || isSunday;
    const beforeNineAM = new Date().getHours() < 9;

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [activeDragData, setActiveDragData] = useState<any>(null);
    // Store only IDs — never snapshot the Meal object. Look up live from masterMealsList at render.
    const [selectedMeal, setSelectedMeal] = useState<{ mealId: string; pmId: string } | null>(null);
    const liveMeal: Meal | undefined = selectedMeal ? meals.find(m => m.id === selectedMeal.mealId) : undefined;

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    // Mobile: which day tab is currently active (0=Mon ... 6=Sun)
    const [mobileDayIndex, setMobileDayIndex] = useState(() => {
        const today = new Date().getDay(); // 0=Sun,1=Mon,...6=Sat
        // Map JS day (0=Sun) to our Mon-indexed array (0=Mon)
        const mapped = today === 0 ? 6 : today - 1;
        return mapped;
    });

    // ── Feature 2: Delivery assignment inline edit ────────────
    const [pendingAddress, setPendingAddress] = useState<{ pmId: string; location: DeliveryLocation; value: string } | null>(null);

    // ── Task 2: Delivery Assignment Sheet for Quick Add ───────
    const [pendingMeal, setPendingMeal] = useState<{ meal: Meal; dayKey: string } | null>(null);
    const [showDeliverySheet, setShowDeliverySheet] = useState(false);
    // Selected day in the delivery sheet (defaults to drawer day, user can change)
    const [sheetSelectedDay, setSheetSelectedDay] = useState<string>('lundi');
    const [sheetSelectedTime, setSheetSelectedTime] = useState<DeliveryTimeSlot>('12:30');
    const [sheetSelectedLocation, setSheetSelectedLocation] = useState<DeliveryLocation>('home');
    const [sheetPendingAddress, setSheetPendingAddress] = useState<string>('');

    const weeklyTotals = useMemo(() => {
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fats = 0;
        
        activeMemberMeals.forEach(pm => {
            const meal = meals.find(m => m.id === pm.meal_id);
            if (meal) {
                calories += meal.macros.kcal;
                protein += meal.macros.protein_g;
                carbs += meal.macros.carbs_g;
                fats += meal.macros.fats_g;
            }
        });
        
        return { calories, protein, carbs, fats };
    }, [activeMemberMeals, meals]);

    const [displayScore, setDisplayScore] = useState(0);
    const [urgencyHours, setUrgencyHours] = useState(999);
    const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

    // Track recently added IDs for flash animations
    const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

    // Drawer States (activeDrawerDay is a dayKey string now)
    const [drawerMode, setDrawerMode] = useState<'add' | 'duplicate' | 'closed'>('closed');
    const [activeDrawerDay, setActiveDrawerDay] = useState<string | null>(null);
    const [duplicateMeal, setDuplicateMeal] = useState<Meal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const drawerRef = useRef<HTMLDivElement>(null);

    // Replan Modal States
    const [showReplanModal, setShowReplanModal] = useState(false);
    const [replanStrategy, setReplanStrategy] = useState<'balanced' | 'variety' | 'repeat'>('balanced');
    const [proposedPlan, setProposedPlan] = useState<Record<string, Meal>>({});

    const handleGenerateMockPlan = useCallback(() => {
        const p = generateWeekPlan(replanStrategy, meals, profile, plan.paused_days);
        setProposedPlan(p);
    }, [replanStrategy, meals, profile, plan.paused_days]);

    // Regen proposed plan if modal opens
    useEffect(() => {
        if (showReplanModal) handleGenerateMockPlan();
    }, [showReplanModal, handleGenerateMockPlan]);

    // Keep activeDrawerDay current for handlers
    const activeDrawerDayRef = useRef(activeDrawerDay);
    useEffect(() => { activeDrawerDayRef.current = activeDrawerDay; }, [activeDrawerDay]);

    // Close drawer on outside tap
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (drawerMode !== 'closed' && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                setDrawerMode('closed');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [drawerMode]);

    // Calculate Week Score
    const weekScore = (() => {
        if (!hasMounted) return 0;
        const activeDays = Array.from({ length: 7 }, (_, i) => ({
            day: i,
            isPaused: plan.paused_days.includes(i),
            meal: activeMemberMeals.find(pm => pm.day_index === i)
        })).filter(d => !d.isPaused && d.meal);
        
        if (activeDays.length === 0) return 0;
        
        let totalScore = 0;
        for (const day of activeDays) {
            const meal = meals.find(m => m.id === day.meal!.meal_id);
            if (!meal) continue;
            
            const proteinTarget = (profile.targets?.protein_g || 150) / 3;
            const carbsTarget = (profile.targets?.carbs_g || 200) / 3;
            const fatsTarget = (profile.targets?.fats_g || 65) / 3;
            
            const pScore = Math.max(0, 1 - Math.abs(meal.macros.protein_g - proteinTarget) / proteinTarget);
            const cScore = Math.max(0, 1 - Math.abs(meal.macros.carbs_g - carbsTarget) / carbsTarget);
            const fScore = Math.max(0, 1 - Math.abs(meal.macros.fats_g - fatsTarget) / fatsTarget);
            
            totalScore += (pScore * 0.5 + cScore * 0.3 + fScore * 0.2);
        }
        return Math.round((totalScore / activeDays.length) * 100);
    })();

    // Score Animation
    useEffect(() => {
        if (!hasMounted) return;
        let start = displayScore;
        const target = weekScore;
        if (start === target) return;
        const diff = target - start;
        const step = diff > 0 ? 1 : -1;
        const interval = setInterval(() => {
            start += step;
            setDisplayScore(start);
            if (start === target) clearInterval(interval);
        }, 16);
        return () => clearInterval(interval);
    }, [weekScore, hasMounted, displayScore]);

    // Countdown / Urgency
    useEffect(() => {
        const update = () => {
            const h = (getThursdayCutoff().getTime() - Date.now()) / (1000 * 60 * 60);
            setUrgencyHours(h);
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, []);

    // Derived states
    const isPlanEmpty = plan.planned_meals.length === 0 && !plannerDays;
    const nonPausedLayoutCount = 7 - plan.paused_days.length;
    const activeLayoutCount = activeMemberMeals.length;
    const hasEmptyGaps = activeLayoutCount < nonPausedLayoutCount;

    // Actions
    const handleConfirm = () => {
        if (isSunday) return; // Sunday lock
        if (hasEmptyGaps) {
            setShowIncompleteWarning(true);
            return;
        }
        // Open Confirm & Pay modal instead of directly confirming
        setShowConfirmModal(true);
    };

    const executeConfirm = () => {
        setShowIncompleteWarning(false);
        // Open the modal instead of directly setting confirmed
        setShowConfirmModal(true);
    };

    const handleApplyProposedPlan = () => {
        // First wipe only current member's meals to replace them independently.
        clearMemberPlan(activeMemberId);

        // Assign the proposed meals
        Object.entries(proposedPlan).forEach(([dayKey, meal]) => {
            assignMeal(dayKey, meal.id, activeMemberId);
        });

        // Track new IDs briefly for staggered animes
        // using timeouts for simple staggering simulation is tough directly via Zustand, 
        // the columns naturally re-render
        addPoints(15);
        
        // Compute projected score real quick
        let totalScore = 0;
        const activeDaysCount = Object.keys(proposedPlan).length;
        Object.values(proposedPlan).forEach(meal => {
            const proteinTarget = (profile.targets?.protein_g || 150) / 3;
            const carbsTarget = (profile.targets?.carbs_g || 200) / 3;
            const fatsTarget = (profile.targets?.fats_g || 65) / 3;
            
            const pScore = Math.max(0, 1 - Math.abs(meal.macros.protein_g - proteinTarget) / proteinTarget);
            const cScore = Math.max(0, 1 - Math.abs(meal.macros.carbs_g - carbsTarget) / carbsTarget);
            const fScore = Math.max(0, 1 - Math.abs(meal.macros.fats_g - fatsTarget) / fatsTarget);
            totalScore += (pScore * 0.5 + cScore * 0.3 + fScore * 0.2);
        });
        const projScore = activeDaysCount ? Math.round((totalScore / activeDaysCount) * 100) : 0;
        
        toast.success(`Semaine reconstruite — Score nutritionnel proj. ${projScore}/100 🌿`);
        setShowReplanModal(false);
    };

    const handleAddFromDrawer = (meal: Meal, dayKey?: string) => {
        const day = dayKey ?? activeDrawerDayRef.current;
        if (!day) return;
        assignMeal(day, meal.id, activeMemberId);
        toast.success(`Ajouté à ${capitalize(day)}`);
    };

    const openDeliverySheet = (meal: Meal) => {
        const day = activeDrawerDayRef.current ?? 'lundi';
        setPendingMeal({ meal, dayKey: day });
        setSheetSelectedDay(day);
        setSheetSelectedTime('12:30');
        setSheetSelectedLocation('home');
        setSheetPendingAddress('');
        setShowDeliverySheet(true);
    };

    // Dnd logic
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );
    const handleDragStart = (e: DragStartEvent) => {
        setActiveDragId(e.active.id as string);
        setActiveDragData(e.active.data.current);
    };
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragId(null);
            const { active, over } = event;
            const dragData = activeDragData;
            setActiveDragData(null);
            
            console.log("DRAG END TRIGGERED");
            console.log("ACTIVE ITEM:", active.id, active.data.current);
            console.log("OVER ITEM:", over?.id, over?.data.current);

            if (isReadOnly) return; // Sunday lock or confirmed lock
            if (!over) return;

            const overData = over.data.current;
            const targetDayKey = overData?.dayKey || (over.id as string);
            
            let newDayIndex = DAY_KEYS.indexOf(targetDayKey);
            if (newDayIndex === -1 && targetDayKey.startsWith("day-")) {
                newDayIndex = parseInt(targetDayKey.replace("day-", ""));
            }
            if (newDayIndex === -1) return;

            if (dragData?.type === 'drawer-meal') {
                const meal = dragData.meal as Meal;
                if (plan.paused_days.includes(newDayIndex)) {
                    toast.error("Jour en pause.");
                    return;
                }
                assignMeal(DAY_KEYS[newDayIndex], meal.id, activeMemberId);
                toast.success(`${meal.name} ajouté à ${DAY_LABELS[newDayIndex]}`);
                return;
            }

            if (dragData?.type === 'Meal' || active.id) {
                const sourceDayKey = active.data.current?.dayKey;
                const pmId = (active.data.current?.plannedMealId || active.id) as string;
                
                const pm = plan.planned_meals.find((pm) => pm.id === pmId);
                if (!pm) return;
                
                if (plan.paused_days.includes(newDayIndex)) {
                    toast.error("Jour en pause.");
                    return;
                }
                
                if (sourceDayKey !== DAY_KEYS[newDayIndex] || pm.day_index !== newDayIndex) {
                     moveMeal(pmId, newDayIndex);
                }
            }
        },
        [plan, moveMeal, assignMeal, activeDragData]
    );

    // Filter meals for Drawer (taste-aware)
    const tastePrefs = profile.tastePreferences || { dislikes: [], spiceTolerance: 'medium' as const, dietLeaning: 'none' as const };
    const proteinTarget = (profile.targets?.protein_g || 150) / 3;
    const carbsTarget = (profile.targets?.carbs_g || 200) / 3;
    const fatsTarget = (profile.targets?.fats_g || 65) / 3;

    const drawerSuggestions = useMemo(() => {
        return meals
            .filter(m => !isMealExcludedByTaste(m, tastePrefs))
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(m => {
                const baseScore = Math.max(0, 100 - (
                    Math.abs(m.macros.protein_g - proteinTarget) +
                    Math.abs(m.macros.carbs_g - carbsTarget) +
                    Math.abs(m.macros.fats_g - fatsTarget)
                ) / (proteinTarget + carbsTarget + fatsTarget) * 100);
                const boost = getDietBoost(m, tastePrefs);
                return { meal: m, score: Math.min(100, Math.round(baseScore + boost)) };
            })
            .sort((a, b) => b.score - a.score);
    }, [meals, tastePrefs, searchQuery, proteinTarget, carbsTarget, fatsTarget]);

    const alreadyUsedMealIds = Array.from(new Set(plan.planned_meals.map(pm => pm.meal_id)));
    const alreadyUsedMeals = meals.filter(m => alreadyUsedMealIds.includes(m.id) && !isMealExcludedByTaste(m, tastePrefs));

    // ── Feature 3: Volume discount pricing (MUST be before early return) ───
    const totalMeals = plan.planned_meals.length;
    const subtotal = useMemo(() => plan.planned_meals.reduce((s, pm) => {
        const m = meals.find(x => x.id === pm.meal_id);
        return s + (m?.price_mad ?? 0);
    }, 0), [plan.planned_meals, meals]);
    const discountPct = totalMeals >= 20 ? 10 : totalMeals >= 10 ? 5 : 0;
    const discountedTotal = Math.round(subtotal * (1 - discountPct / 100));


    if (!hasMounted) return null;

    const activePlannedMeal = activeDragId && !activeDragId.startsWith('drawer-') ? activeMemberMeals.find((pm) => pm.id === activeDragId) : null;
    let activeMealFromState = null;
    if (activePlannedMeal) {
        activeMealFromState = meals.find((m) => m.id === activePlannedMeal.meal_id);
    } else if (activeDragData?.type === 'drawer-meal') {
        activeMealFromState = activeDragData.meal;
    }
    const activeMeal = activeMealFromState;

    let scoreColor = "#9C9C9C";
    if (displayScore >= 90) scoreColor = "#6BC4A0";
    else if (displayScore >= 75) scoreColor = "#F59E0B";
    else if (displayScore >= 50) scoreColor = "#FFA07A";

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="min-h-screen relative overflow-x-hidden flex flex-col">
                <Header title="Mon Planificateur" subtitle={isSunday ? "Semaine confirmée — les livraisons commencent lundi" : plan.confirmed ? "Vos repas sont verrouillés et en préparation." : "Planifiez votre nutrition de la semaine"} />

                {/* ── Feature 3: Sticky volume discount header ── */}
                {totalMeals > 0 && (
                    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[#F0E4D8] px-4 sm:px-6 py-2.5">
                        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-[#2D2D2D]">{totalMeals} repas</span>
                                <span className="text-[#9C9C9C]">·</span>
                                <span className="text-[#9C9C9C] line-through text-xs">{subtotal} MAD</span>
                                <span className="font-black text-[#2F8B60] text-base">{discountedTotal} MAD</span>
                                {discountPct > 0 && (
                                    <span className="bg-[#E1F5EE] text-[#085041] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        -{discountPct}% volume
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Feature 6: Sunday lock banner ── */}
                {isSunday && (
                    <div className="mx-6 mt-4 md:mx-8">
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#2D2D2D] text-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                        >
                            <div className="flex items-center gap-3">
                                <Lock size={18} className="text-[#6BC4A0] flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Semaine confirmée — les livraisons commencent lundi 🚀</p>
                                    <p className="text-[#9C9C9C] text-xs mt-0.5">Le planificateur est en lecture seule aujourd'hui. Les modifications reprennent lundi.</p>
                                </div>
                            </div>
                            {beforeNineAM && (
                                <a
                                    href="https://wa.me/212600000000?text=Bonjour%20Nourishbox%20%E2%80%94%20urgent%20change%20needed"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5e] text-white text-xs font-bold px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                                >
                                    <MessageCircle size={13} /> Urgence WhatsApp
                                </a>
                            )}
                        </motion.div>
                    </div>
                )}
                
                <div className={`p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full transition-all ${plan.confirmed ? 'border-[3px] border-[#6BC4A0]/20 rounded-[20px] m-2 sm:m-4 pb-12' : 'pb-32'}`}>
                
                {/* Global Urgency Banner */}
                <AnimatePresence>
                    {hasEmptyGaps && urgencyHours < 24 && !plan.confirmed && !isPlanEmpty && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="bg-[#FFA07A]/12 border-l-[4px] border-[#FFA07A] rounded-xl p-4 mb-8 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-[#FFA07A]" size={20} />
                                <p className="text-[#2D2D2D] font-medium text-sm">
                                    Limite de jeudi dans <span className="font-bold text-[#FFA07A]">{Math.floor(urgencyHours)}h</span> — {nonPausedLayoutCount - activeLayoutCount} jour(s) encore vide(s).
                                </p>
                            </div>
                            <button onClick={() => setShowReplanModal(true)} className="text-[#FFA07A] text-sm font-bold underline hover:text-[#E05252]">Replanifier la semaine →</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Feature: Family Profile Toggle ── */}
                {members.length > 1 && (
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex bg-[#F8F9FA] rounded-full p-1.5 border border-[#F0E4D8] overflow-x-auto max-w-full hide-scrollbar">
                            {members.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => setActiveMember(member.id)}
                                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeMemberId === member.id ? 'text-white shadow-sm' : 'text-[#6B6B6B] hover:bg-[#EAEAEA]'}`}
                                >
                                    {activeMemberId === member.id && (
                                        <motion.div layoutId="activeMemberBg" className="absolute inset-0 rounded-full" style={{ backgroundColor: member.avatar_color || '#6BC4A0' }} />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: activeMemberId === member.id ? 'rgba(255,255,255,0.3)' : member.avatar_color }}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        {member.id === 'f1' || member.id === 'u1' ? 'Moi' : member.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Score & Actions Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-baseline gap-3 relative">
                            <motion.h1 className="font-serif text-4xl sm:text-5xl transition-colors" style={{ color: scoreColor, textShadow: displayScore >= 90 ? '0 0 20px rgba(107,196,160,0.5)' : 'none' }}>
                                {displayScore}<span className="text-[#9C9C9C] text-3xl">/100</span>
                            </motion.h1>
                            <AnimatePresence>
                                {displayScore >= 90 && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-full border border-[#F59E0B]/20 flex items-center gap-1 shadow-sm relative bottom-1">
                                        ✦ <span className="text-xs font-bold capitalize tracking-wide">Excellente semaine</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <p className="text-[#9C9C9C] text-sm mt-1">{activeLayoutCount} sur {nonPausedLayoutCount} jours planifiés</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 relative flex-wrap sm:flex-nowrap">
                        {/* FIX 2: Replan Week Button */}
                        {!plan.confirmed && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowReplanModal(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-white text-[#6BC4A0] border-2 border-[#6BC4A0] transition-colors order-last sm:order-none w-full sm:w-auto mt-4 sm:mt-0"
                            >
                                <Wand2 size={16} /> Replanifier la semaine
                            </motion.button>
                        )}
                        
                    {plan.confirmed && (
                            <button onClick={() => { setConfirmed(false); toast("Plan déverrouillé — modifiez et reconfirmez", { icon: "🔓" }); }} className="text-[#9C9C9C] text-sm font-bold underline hover:text-[#2D2D2D] mr-2">
                                Modifier le plan
                            </button>
                        )}
                        {/* ── Feature 5/6: Confirm button or locked state ── */}
                        {!isSunday && (
                        <motion.button
                            whileHover={{ scale: (plan.confirmed && subscription.status === 'active') ? 1 : 1.02 }}
                            whileTap={{ scale: (plan.confirmed && subscription.status === 'active') ? 1 : 0.98 }}
                            animate={!hasEmptyGaps && !plan.confirmed ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                            transition={!hasEmptyGaps && !plan.confirmed ? { repeat: Infinity, duration: 3 } : { duration: 0 }}
                            onClick={plan.confirmed ? (subscription.status !== 'active' ? () => router.push('/checkout') : undefined) : handleConfirm}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all min-w-[220px] ${
                                plan.confirmed 
                                    ? (subscription.status !== 'active' 
                                        ? 'bg-accent text-background shadow-lg hover:bg-accent/90' 
                                        : 'bg-white border-2 border-[#6BC4A0] text-[#6BC4A0] cursor-default')
                                    : (subscription.status !== 'active' 
                                        ? 'bg-[#2D2D2D] text-white' 
                                        : (hasEmptyGaps ? 'bg-[#F59E0B] text-white shadow-lg' : 'bg-[#6BC4A0] text-white shadow-[0_8px_24px_rgba(107,196,160,0.4)]'))
                            }`}
                        >
                            {plan.confirmed ? (
                                subscription.status !== 'active' ? (
                                    <><ShoppingBag size={18} /> S'abonner et Régler mon Plan →</>
                                ) : (
                                    <><CheckCircle size={18} /> Semaine confirmée ✓</>
                                )
                            ) : (
                                subscription.status !== 'active' ? "S'abonner pour confirmer →" :
                                (hasEmptyGaps ? 'Confirmer (incomplet)' : 'Confirmer et réviser →')
                            )}
                        </motion.button>
                        )}
                    </div>
                </div>

                {/* ── Weekly Summary Card (Mobile) ── */}
                <AnimatePresence>
                    {!isPlanEmpty && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:hidden mx-4 mb-8 bg-white rounded-[24px] border border-[#F0E4D8] p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="text-[10px] font-bold text-[#9C9C9C] uppercase tracking-wider">Cibles de la semaine</h3>
                                    <p className="font-serif text-lg text-[#2D2D2D]">Résumé hebdomadaire</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-[#6BC4A0]">{weeklyTotals.calories}</span>
                                    <span className="text-[10px] text-[#9C9C9C] font-bold block mt-[-4px]">KCAL</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { label: 'Protéines', val: weeklyTotals.protein, target: (profile.targets?.protein_g || 150) * 7 / 3, color: '#B09AE0' },
                                    { label: 'Glucides', val: weeklyTotals.carbs, target: (profile.targets?.carbs_g || 200) * 7 / 3, color: '#F59E0B' },
                                    { label: 'Lipides', val: weeklyTotals.fats, target: (profile.targets?.fats_g || 65) * 7 / 3, color: '#FFA07A' },
                                ].map(m => {
                                    const pct = Math.min(Math.round(m.val / m.target * 100), 100);
                                    return (
                                        <div key={m.label} className="space-y-1.5">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[12px] font-bold text-[#6B6B6B]">{m.label}</span>
                                                <span className="text-[12px] font-black text-[#2D2D2D]">
                                                    {Math.round(m.val)}g <span className="text-[#9C9C9C] font-bold">/ {Math.round(m.target)}g</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ backgroundColor: m.color }} />
                                                </div>
                                                <span className="text-[13px] font-black text-[#2D2D2D] w-10 text-right">{pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                {isPlanEmpty && !plan.confirmed ? (
                    // Empty State
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-[20px] border-2 border-dashed border-[#A8E6CF] flex flex-col items-center justify-center py-20 px-4 text-center">
                        <svg width="240" height="70" viewBox="0 0 240 70" fill="none" className="mb-6">
                            <g stroke="#6BC4A0" strokeWidth="2" strokeDasharray="4 4" fill="rgba(107, 196, 160, 0.05)">
                                <rect x="5" y="5" width="26" height="60" rx="4"/>
                                <rect x="39" y="5" width="26" height="60" rx="4"/>
                                <rect x="73" y="5" width="26" height="60" rx="4"/>
                                <rect x="107" y="5" width="26" height="60" rx="4"/>
                                <rect x="141" y="5" width="26" height="60" rx="4"/>
                                <rect x="175" y="5" width="26" height="60" rx="4"/>
                                <rect x="209" y="5" width="26" height="60" rx="4"/>
                            </g>
                        </svg>
                        <h2 className="font-serif text-3xl text-[#2D2D2D] mb-3">
                            {profile.goal === 'weight_loss' ? "Planifiez votre semaine de déficit" : profile.goal === 'muscle_gain' ? "Construisez votre semaine de gains" : "Votre semaine est une page blanche"}
                        </h2>
                        <p className="text-[#6B6B6B] text-sm max-w-md mx-auto mb-8">
                            Ajoutez des repas à chaque jour et nous suivrons votre score nutritionnel en temps réel. Nous pouvons également pré-remplir la semaine.
                        </p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowReplanModal(true)} className="bg-[#6BC4A0] text-white px-8 py-3 rounded-full font-bold shadow-[0_8px_24px_rgba(107,196,160,0.3)]">
                            Commencer avec nos favoris →
                        </motion.button>
                    </motion.div>
                ) : (
                    // Mobile: tab-based day selector / Desktop: full 7-col kanban
                    <>
                        {/* -- MOBILE day pill tabs (hidden on lg+) -- */}
                        <div className="lg:hidden mb-3">
                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 hide-scrollbar">
                                {Array.from({ length: 7 }, (_, i) => {
                                    const hasMeal = activeMemberMeals.some(pm => pm.day_index === i);
                                    const isPaused = plan.paused_days.includes(i);
                                    const isActive = mobileDayIndex === i;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setMobileDayIndex(i)}
                                            className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-all ${
                                                isActive
                                                    ? 'bg-[#6BC4A0] border-[#6BC4A0] text-white shadow-md'
                                                    : hasMeal
                                                        ? 'bg-white border-[#6BC4A0]/40 text-[#2D2D2D]'
                                                        : isPaused
                                                            ? 'bg-[#FFF8F4] border-[#E8D8CC] text-[#9C9C9C]'
                                                            : 'bg-white border-[#F0E4D8] text-[#9C9C9C]'
                                            }`}
                                        >
                                            <span className="text-base leading-none">{DAY_EMOJIS[i]}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
                                                {DAY_LABELS[i].substring(0, 3)}
                                            </span>
                                            <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                                                hasMeal ? (isActive ? 'bg-white' : 'bg-[#6BC4A0]') : 'bg-transparent'
                                            }`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* -- MOBILE: single active day column -- */}
                        <div className="lg:hidden">
                            <DayColumn
                                dayIndex={mobileDayIndex}
                                dayKey={DAY_KEYS[mobileDayIndex]}
                                dayLabel={DAY_LABELS[mobileDayIndex]}
                                dayEmoji={DAY_EMOJIS[mobileDayIndex]}
                                plannedMeals={activeMemberMeals.filter(pm => pm.day_index === mobileDayIndex)}
                                meals={meals}
                                profile={profile}
                                isPaused={plan.paused_days.includes(mobileDayIndex)}
                                isConfirmed={plan.confirmed}
                                urgencyHours={urgencyHours}
                                newlyAddedIds={newlyAddedIds}
                                onTogglePause={() => togglePauseDay(mobileDayIndex)}
                                onRemoveMeal={(id) => removeMealFromDay(id)}
                                onDuplicateMeal={(meal) => {
                                    setDuplicateMeal(meal);
                                    setActiveDrawerDay(null);
                                    setDrawerMode('duplicate');
                                }}
                                onOpenAddDrawer={() => {
                                    setActiveDrawerDay(DAY_KEYS[mobileDayIndex]);
                                    setDrawerMode('add');
                                }}
                                onCardClick={(meal, pmId) => setSelectedMeal({ mealId: meal.id, pmId })}
                                activeDragId={activeDragId}
                            />
                        </div>

                        {/* -- DESKTOP: full 7-col kanban grid -- */}
                        <div className="hidden lg:grid lg:grid-cols-7 gap-4">
                            {Array.from({ length: 7 }, (_, i) => (
                                <DayColumn
                                    key={i}
                                    dayIndex={i}
                                    dayKey={DAY_KEYS[i]}
                                    dayLabel={DAY_LABELS[i]}
                                    dayEmoji={DAY_EMOJIS[i]}
                                    plannedMeals={activeMemberMeals.filter((pm) => pm.day_index === i)}
                                    meals={meals}
                                    profile={profile}
                                    isPaused={plan.paused_days.includes(i)}
                                    isConfirmed={plan.confirmed}
                                    urgencyHours={urgencyHours}
                                    newlyAddedIds={newlyAddedIds}
                                    onTogglePause={() => togglePauseDay(i)}
                                    onRemoveMeal={(id) => removeMealFromDay(id)}
                                    onDuplicateMeal={(meal) => {
                                        setDuplicateMeal(meal);
                                        setActiveDrawerDay(null);
                                        setDrawerMode('duplicate');
                                    }}
                                    onOpenAddDrawer={() => {
                                        setActiveDrawerDay(DAY_KEYS[i]);
                                        setDrawerMode('add');
                                    }}
                                    onCardClick={(meal, pmId) => setSelectedMeal({ mealId: meal.id, pmId })}
                                    activeDragId={activeDragId}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Live Cart Total — derived entirely from masterMealsList, never stale */}
            {plan.planned_meals.length > 0 && (
                <div className="mx-6 mb-3 md:mx-8">
                    {(() => {
                        const total = plan.planned_meals.reduce((sum, pm) => {
                            const m = meals.find(x => x.id === pm.meal_id);
                            return sum + (m?.price_mad ?? 0);
                        }, 0);
                        const mealCount = plan.planned_meals.length;
                        return (
                            <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-[#F0E4D8] shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#2D2D2D]">Total de la semaine</span>
                                    <span className="text-[11px] text-[#9C9C9C] font-medium">{mealCount} repas</span>
                                </div>
                                <span className="text-base font-black text-[#2F8B60]">{total} MAD</span>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── Mobile Floating Action Button ── */}
            <AnimatePresence>
                {!plan.confirmed && drawerMode === 'closed' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="lg:hidden fixed bottom-6 right-6 z-40"
                    >
                         <button
                            onClick={() => {
                                setActiveDrawerDay(DAY_KEYS[mobileDayIndex]);
                                setDrawerMode('add');
                            }}
                            className="bg-[#6BC4A0] text-white px-6 py-4 rounded-full shadow-[0_8px_32px_rgba(107,196,160,0.4)] flex items-center gap-2 font-bold active:scale-95 transition-transform"
                        >
                            <Plus size={20} />
                            Ajouter des repas
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick-Add Drawer */}
            <div className={`w-full z-[60] ${drawerMode === 'closed' ? 'hidden lg:block sticky bottom-0' : 'fixed inset-0 lg:sticky lg:bottom-0 overflow-hidden'}`}>
                <style>{`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                
                <AnimatePresence>
                    {drawerMode !== 'closed' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerMode('closed')}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
                        />
                    )}
                </AnimatePresence>

                <motion.div
                    ref={drawerRef}
                    initial={{ height: 48, y: '100%' }}
                    animate={{ 
                        height: drawerMode === 'closed' ? 48 : 'auto',
                        y: drawerMode === 'closed' && typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : 0
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                    className={`w-full relative ${drawerMode === 'closed' ? 'bg-[#FFF8F4] border-t border-[#E8E0D8]' : 'bg-white rounded-t-[32px] lg:rounded-t-none lg:rounded-none shadow-[0_-8px_30px_rgba(45,45,45,0.08)] lg:shadow-none'}`}
                >
                    {/* Desktop-only closed state bar */}
                    {drawerMode === 'closed' ? (
                        <div className="h-12 w-full hidden lg:flex items-center justify-center relative cursor-pointer hover:bg-[#F9F4F0] transition-colors"
                             onClick={() => { setActiveDrawerDay(DAY_KEYS[0]); setDrawerMode('add'); }}>
                            <div className="absolute left-6 text-[#9C9C9C] text-xs font-semibold">+ Ajout rapide</div>
                            <div className="w-6 h-[3px] bg-[#D4C9BE] rounded-full" />
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto hide-scrollbar">
                            {/* Mobile Handle */}
                            <div className="lg:hidden flex justify-center mb-6 mt-[-16px]">
                                <div className="w-12 h-1.5 bg-[#E8E0D8] rounded-full" />
                            </div>

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl text-[#2D2D2D]">
                                    {drawerMode === 'duplicate' && duplicateMeal ? `Dupliquer : ${duplicateMeal.name}` :
                                     drawerMode === 'add' && activeDrawerDay !== null ? `Ajout à ${capitalize(activeDrawerDay)}` :
                                     "Ajout rapide de repas"}
                                </h3>
                                <button onClick={() => setDrawerMode('closed')} className="px-4 py-1.5 rounded-full border border-[#E8E0D8] text-xs font-bold text-[#6B6B6B] hover:text-[#2D2D2D] hover:border-[#D4C9BE]">
                                    Terminé
                                </button>
                            </div>

                            {/* Content */}
                            {drawerMode === 'duplicate' && duplicateMeal ? (
                                <div>
                                    <p className="text-xs text-[#9C9C9C] capitalize font-bold tracking-wider mb-3">Copier vers quel jour ?</p>
                                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6">
                                        {DAY_LABELS.map((label, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { assignMeal(DAY_KEYS[i], duplicateMeal.id, activeMemberId); toast.success(`Copié vers ${label}`); }}
                                                className="bg-[#F1FAF4] hover:bg-[#6BC4A0] hover:text-white text-[#6BC4A0] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shadow-sm border border-[#A8E6CF]"
                                            >
                                                + {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Search */}
                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9C9C]" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher des repas..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-[#FFF8F4] border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#6BC4A0] outline-none text-[#2D2D2D] placeholder-[#9C9C9C]"
                                        />
                                    </div>
                                    
                                    {/* Best Matches Row */}
                                    <p className="text-[10px] text-[#9C9C9C] capitalize font-bold mb-2 tracking-wider">Meilleurs matchs pour vos macros</p>
                                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
                                    {drawerSuggestions.map((s, i) => (
                                            <DrawerDraggableMeal
                                                key={i}
                                                meal={s.meal}
                                                score={s.score}
                                                onAdd={() => openDeliverySheet(s.meal)}
                                            />
                                        ))}
                                    </div>

                                    {/* Previously Used Row */}
                                    {alreadyUsedMeals.length > 0 && (
                                        <>
                                            <p className="text-[10px] text-[#9C9C9C] capitalize font-bold mb-2 tracking-wider mt-2">Déjà dans votre semaine - réutiliser</p>
                                            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
                                                {alreadyUsedMeals.map((m, i) => {
                                                    const assignedDay = plan.planned_meals.find(pm => pm.meal_id === m.id)?.day_index || 0;
                                                    return (
                                                        <DrawerDraggablePreviouslyUsed key={i} meal={m} dayLabel={DAY_LABELS[assignedDay]} onAdd={() => openDeliverySheet(m)} />
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-2 text-center">
                                        <button onClick={() => router.push('/client/menu')} className="text-[11px] font-bold text-[#6BC4A0]/80 hover:text-[#6BC4A0]">Parcourir le menu complet →</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>

            {/* Incomplete Warning Modal */}
            <AnimatePresence>
                {showIncompleteWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#2D2D2D]/40 backdrop-blur-sm text-[#F5F0E8]" onClick={() => setShowIncompleteWarning(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[20px] p-8 max-w-md w-full relative z-10 shadow-[0_24px_48px_rgba(45,45,45,0.2)]">
                            <h3 className="font-serif text-2xl text-[#2D2D2D] mb-2">Votre semaine a des trous</h3>
                            <p className="text-[#6B6B6B] mb-8">{nonPausedLayoutCount - activeLayoutCount} jour(s) sont encore vides. Vous pouvez confirmer maintenant ou remplir les trous pour un meilleur score nutritionnel.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => setShowIncompleteWarning(false)} className="w-full bg-[#6BC4A0] hover:bg-[#5BB48F] text-white font-bold py-3.5 rounded-2xl transition-colors">
                                    Attendez, je vais remplir les trous
                                </button>
                                <button onClick={executeConfirm} className="w-full bg-white border-2 border-[#E8E0D8] hover:border-[#D4C9BE] text-[#6B6B6B] font-bold py-3.5 rounded-full transition-colors">
                                    Confirmer quand même
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FIX 2: Replan Modal */}
            <AnimatePresence>
                {showReplanModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ minHeight: '520px' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#2D2D2D]/50 backdrop-blur-sm text-[#F5F0E8]" onClick={() => setShowReplanModal(false)} />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                            className="bg-white rounded-[20px] p-7 max-w-[480px] w-full relative z-10 shadow-[0_24px_48px_rgba(45,45,45,0.2)] max-h-[90vh] overflow-y-auto"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F1FAF4] mb-3">
                                    <Wand2 className="text-[#6BC4A0]" size={24} />
                                </div>
                                <h3 className="font-serif text-2xl text-[#2D2D2D]">Reconstruire votre semaine</h3>
                                <p className="text-[#6B6B6B] mt-2 text-sm px-2">Nous remplirons les 7 jours avec des repas qui correspondent le mieux à vos cibles macro. Votre plan actuel sera remplacé.</p>
                            </div>

                            {/* Strategy Selector */}
                            <div className="flex flex-col gap-2 mb-6">
                                {(
                                    [
                                        { id: 'balanced', label: 'Macros équilibrés', desc: 'Meilleur match protéines/glucides/lipides par jour' },
                                        { id: 'variety', label: 'Variété maximale', desc: '7 repas différents, tous bien adaptés' },
                                        { id: 'repeat', label: 'Répéter les favoris', desc: 'Vos meilleurs repas, répétés au besoin' }
                                    ] as const
                                ).map((st) => (
                                    <button
                                        key={st.id}
                                        onClick={() => setReplanStrategy(st.id)}
                                        className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all text-left ${replanStrategy === st.id ? 'border-[#6BC4A0] bg-[#F1FAF4]' : 'border-[#F0E4D8] hover:border-[#D4C9BE] bg-white'}`}
                                    >
                                        <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${replanStrategy === st.id ? 'border-[#6BC4A0]' : 'border-[#D4C9BE]'}`}>
                                            {replanStrategy === st.id && <div className="w-2 h-2 rounded-full bg-[#6BC4A0]" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${replanStrategy === st.id ? 'text-[#2D2D2D]' : 'text-[#6B6B6B]'}`}>{st.label}</p>
                                            <p className="text-xs text-[#9C9C9C]">{st.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Preview Grid */}
                            <div className="bg-[#FFF8F4] rounded-2xl p-4 mb-4 border border-[#F0E4D8]">
                                <h4 className="text-[10px] text-[#9C9C9C] capitalize font-bold tracking-wider mb-3">Aperçu en direct</h4>
                                <div className="flex flex-col gap-2">
                                    {DAY_KEYS.map((dayKey, i) => {
                                        const isPaused = plan.paused_days.includes(i);
                                        const meal = proposedPlan[dayKey];
                                        return (
                                            <motion.div 
                                                key={dayKey}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ staggerChildren: 0.04, delay: i * 0.04 }}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-[#9C9C9C] w-8">
                                                        {DAY_LABELS[i].substring(0, 3)}
                                                    </span>
                                                    {isPaused ? (
                                                        <span className="text-xs text-[#C4C4C4] italic">En pause</span>
                                                    ) : meal ? (
                                                        <span className="text-xs font-semibold text-[#2D2D2D] truncate max-w-[140px]">{meal.name}</span>
                                                    ) : (
                                                        <span className="text-xs text-[#C4C4C4]">Vide</span>
                                                    )}
                                                </div>
                                                {!isPaused && meal && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-[#9C9C9C]">{meal.macros.kcal}kcal</span>
                                                        <div className="w-2 h-2 rounded-full bg-[#6BC4A0]" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6 px-1">
                                <p className="text-sm font-bold text-[#6BC4A0]">Score projeté : {
                                    (() => {
                                        let totalSc = 0;
                                        let activeDaysCount = 0;
                                        Object.values(proposedPlan).forEach(meal => {
                                            activeDaysCount++;
                                            const pTarget = (profile.targets?.protein_g || 150) / 3;
                                            const cTarget = (profile.targets?.carbs_g || 200) / 3;
                                            const fTarget = (profile.targets?.fats_g || 65) / 3;
                                            const pScore = Math.max(0, 1 - Math.abs(meal.macros.protein_g - pTarget) / pTarget);
                                            const cScore = Math.max(0, 1 - Math.abs(meal.macros.carbs_g - cTarget) / cTarget);
                                            const fScore = Math.max(0, 1 - Math.abs(meal.macros.fats_g - fTarget) / fTarget);
                                            totalSc += (pScore * 0.5 + cScore * 0.3 + fScore * 0.2);
                                        });
                                        return activeDaysCount ? Math.round((totalSc / activeDaysCount) * 100) : 0;
                                    })()
                                }/100</p>
                                <button onClick={handleGenerateMockPlan} className="text-xs font-bold text-[#9C9C9C] hover:text-[#2D2D2D] flex items-center gap-1 transition-colors rounded-full">
                                    Régénérer <span className="text-[10px]">↺</span>
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col gap-2">
                                <button onClick={handleApplyProposedPlan} className="w-full bg-[#6BC4A0] hover:bg-[#5BB48F] text-white font-bold py-3.5 rounded-full transition-colors">
                                    Appliquer le plan
                                </button>
                                <button onClick={() => setShowReplanModal(false)} className="w-full bg-white text-[#9C9C9C] hover:text-[#6B6B6B] font-bold py-2 rounded-full transition-colors text-sm">
                                    Annuler
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            </div>

            <DragOverlay>
                {activeMeal && activeDragId ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 border-[#6BC4A0] shadow-[0_12px_40px_rgba(107,196,160,0.3)] min-w-[180px]">
                        <span className="text-xl">{activeMeal.emoji}</span>
                        <div>
                            <p className="text-xs font-semibold text-[#2D2D2D] truncate w-32">{activeMeal.name}</p>
                            <p className="text-[10px] text-[#9C9C9C]">{activeMeal.macros.kcal} kcal</p>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

            {/* Feature: Meal Detail Drawer — reads live from masterMealsList, never stale */}
            <AnimatePresence>
                {selectedMeal && liveMeal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none pb-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMeal(null)} className="absolute inset-0 bg-[#2D2D2D]/40 backdrop-blur-sm pointer-events-auto text-[#F5F0E8]" />
                        
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                            drag="y"
                            dragDirectionLock
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 1 }}
                            onDragEnd={(e, info) => { if (info.offset.y > 60) setSelectedMeal(null); }}
                            className="w-full max-w-2xl bg-white rounded-t-3xl shadow-[0_-12px_48px_rgba(45,45,45,0.1)] relative pointer-events-auto h-[85vh] md:h-auto max-h-[90vh] flex flex-col"
                        >
                            <div className="flex-shrink-0 flex items-center justify-center pt-4 pb-2">
                                <div className="w-10 h-1 rounded-full bg-[#D4C9BE]" />
                            </div>
                            
                            
                            <div className="px-6 pb-10 overflow-y-auto hide-scrollbar flex-1 pr-2">
                                {/* Premium Hero Image Section — now inside scrollable area */}
                                <div className="relative h-64 md:h-72 w-full flex-shrink-0 overflow-hidden bg-[#F5F0E8] mb-6 mt-2">
                                    <div className="w-full h-full rounded-[24px] overflow-hidden relative group">
                                        {liveMeal.image_url ? (
                                            <img 
                                                src={liveMeal.image_url} 
                                                alt={liveMeal.name} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5E6D3] to-[#E8DCC4]">
                                                <span className="text-8xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{liveMeal.emoji}</span>
                                            </div>
                                        )}
                                        {/* Category & Tier Badges overlaying image */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
                                                liveMeal.tier === 'premium' ? 'bg-[#F3EEFA]/90 text-[#B09AE0]' :
                                                liveMeal.tier === 'standard' ? 'bg-[#E1F5EE]/90 text-[#085041]' :
                                                liveMeal.tier === 'kids' ? 'bg-[#FFF0E5]/90 text-[#E07050]' :
                                                'bg-white/90 text-[#6B6B6B]'
                                            }`}>
                                                {liveMeal.tier === 'premium' ? '👑 Premium' : liveMeal.tier === 'standard' ? '⭐ Standard' : liveMeal.tier === 'kids' ? '🧒 Enfants' : '💚 Budget'}
                                            </span>
                                        </div>
                                        
                                        <div className="absolute bottom-4 right-4">
                                            <span className="bg-white/90 backdrop-blur-md text-[#2F8B60] text-sm font-black px-4 py-2 rounded-2xl shadow-sm">
                                                {liveMeal.price_mad} MAD
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="font-serif text-3xl text-[#2D2D2D] pr-4">{liveMeal.name}</h2>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[#9C9C9C] text-sm font-medium">{liveMeal.macros.kcal} calories</p>
                                            <div className="w-1 h-1 rounded-full bg-[#D4C9BE]" />
                                            <p className="text-[#9C9C9C] text-sm font-medium">{liveMeal.prep_time_min} min de prép</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button onClick={() => setSelectedMeal(null)} className="p-2.5 bg-[#F1EFE8] rounded-full text-[#5F5E5A] hover:bg-[#E8E0D8] transition-colors shadow-sm">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Protéines</span>
                                            <span className="text-[10px] font-black text-[#B09AE0]">{liveMeal.macros.protein_g}g</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(liveMeal.macros.protein_g / (profile.targets?.protein_g||150) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#B09AE0]" />
                                        </div>
                                    </div>
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Glucides</span>
                                            <span className="text-[10px] font-black text-[#F59E0B]">{liveMeal.macros.carbs_g}g</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(liveMeal.macros.carbs_g / (profile.targets?.carbs_g||200) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#F59E0B]" />
                                        </div>
                                    </div>
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Lipides</span>
                                            <span className="text-[10px] font-black text-[#FFA07A]">{liveMeal.macros.fats_g}g</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(liveMeal.macros.fats_g / (profile.targets?.fats_g||65) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#FFA07A]" />
                                        </div>
                                    </div>
                                    <div className="bg-[#FFF8F4] p-3 rounded-2xl border border-[#F0E4D8]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6B6B6B]">Calories</span>
                                            <span className="text-[10px] font-black text-[#6BC4A0]">{liveMeal.macros.kcal}</span>
                                        </div>
                                        <div className="w-full h-[3px] bg-[#F0EBE3] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(liveMeal.macros.kcal / (profile.targets?.kcal||2000) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#6BC4A0]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Ingredients & Allergens */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[#2D2D2D] mb-2">Ingrédients</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(liveMeal as any).ingredients?.map((ing: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-[#F5F0EA] text-[#6B6B6B] rounded-full text-[11px] font-medium">{ing}</span>
                                        )) || <span className="text-[11px] text-[#9C9C9C]">Ingrédients parfaitement préparés par nos chefs.</span>}
                                    </div>
                                </div>
                                
                                <div className="mb-8">
                                    <h4 className="text-xs font-bold text-[#2D2D2D] mb-2">Contient</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {liveMeal.allergens.length > 0 ? (
                                            liveMeal.allergens.map((alg, i) => (
                                                <span key={i} className="px-3 py-1 bg-[#FCEBEB] text-[#791F1F] rounded-full text-[11px] font-bold">{alg.replace('_', ' ')}</span>
                                            ))
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[#6BC4A0] text-[11px] font-bold">
                                                <ShieldCheck size={14} /> Sans allergènes
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Feature 2: Per-meal delivery assignment */}
                                {!isReadOnly && (
                                    <div className="mb-6 bg-[#FFF8F4] rounded-2xl p-4 border border-[#F0E4D8]">
                                        <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 flex items-center gap-1.5">
                                            <MapPin size={12} className="text-[#6BC4A0]" /> Livraison pour ce repas
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {/* Time slot selector */}
                                            <div>
                                                <p className="text-[10px] text-[#9C9C9C] mb-1 font-bold capitalize">Heure</p>
                                                <div className="flex flex-col gap-1">
                                                    {(['07:00', '12:30', '18:00', '21:00'] as DeliveryTimeSlot[]).map(slot => {
                                                        const current = deliveryAssignments[selectedMeal.pmId];
                                                        const isActive = current?.timeSlot === slot;
                                                        return (
                                                            <button
                                                                key={slot}
                                                                onClick={() => {
                                                                    const loc = current?.location ?? 'home';
                                                                    setDeliveryAssignment(selectedMeal.pmId, { timeSlot: slot, location: loc });
                                                                }}
                                                                className={`text-xs font-bold px-2 py-1.5 rounded-xl transition-all text-left ${
                                                                    isActive ? 'bg-[#6BC4A0] text-white' : 'bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#6BC4A0]'
                                                                }`}
                                                            >
                                                                <Clock3 size={10} className="inline mr-1" />{slot}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* Location selector */}
                                            <div>
                                                <p className="text-[10px] text-[#9C9C9C] mb-1 font-bold capitalize">Lieu</p>
                                                <div className="flex flex-col gap-1">
                                                    {(['home', 'office', 'campus', 'gym', 'school'] as DeliveryLocation[]).map(loc => {
                                                        const current = deliveryAssignments[selectedMeal.pmId];
                                                        const isActive = current?.location === loc;
                                                        const hasAddress = !!(profile.savedAddresses?.[loc]);
                                                        return (
                                                            <button
                                                                key={loc}
                                                                onClick={() => {
                                                                    if (!hasAddress) {
                                                                        setPendingAddress({ pmId: selectedMeal.pmId, location: loc, value: '' });
                                                                        return;
                                                                    }
                                                                    const slot = current?.timeSlot ?? '12:30';
                                                                    setDeliveryAssignment(selectedMeal.pmId, { timeSlot: slot, location: loc });
                                                                }}
                                                                className={`text-xs font-bold px-2 py-1.5 rounded-xl transition-all text-left capitalize flex items-center justify-between ${
                                                                    isActive ? 'bg-[#2D2D2D] text-white' : 'bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#2D2D2D]'
                                                                }`}
                                                            >
                                                                <span>{loc}</span>
                                                                {!hasAddress && <span className="text-[8px] text-[#FFA07A]">⚠</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Save address prompt */}
                                        {pendingAddress && pendingAddress.pmId === selectedMeal.pmId && (
                                            <div className="mt-2 p-3 bg-[#FFF0E5] rounded-xl border border-[#FFA07A]/30">
                                                <p className="text-[11px] text-[#9A3412] font-bold mb-2">
                                                    Aucune adresse pour <span className="capitalize">{pendingAddress.location}</span>. Ajoutez-en une :
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={pendingAddress.value}
                                                        onChange={e => setPendingAddress(p => p ? { ...p, value: e.target.value } : null)}
                                                        placeholder="ex: 12 Rue Hassan II, Tanger"
                                                        className="flex-1 text-xs px-3 py-2 rounded-2xl border border-[#F0E4D8] bg-white outline-none focus:ring-1 focus:ring-[#6BC4A0]"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (!pendingAddress.value.trim()) return;
                                                            setSavedAddress(pendingAddress.location, pendingAddress.value.trim());
                                                            const current = deliveryAssignments[selectedMeal.pmId];
                                                            setDeliveryAssignment(selectedMeal.pmId, {
                                                                timeSlot: current?.timeSlot ?? '12:30',
                                                                location: pendingAddress.location,
                                                            });
                                                            setPendingAddress(null);
                                                            toast.success(`Address saved for ${pendingAddress.location}`);
                                                        }}
                                                        className="bg-[#6BC4A0] text-white text-xs font-bold px-3 py-2 rounded-2xl transition-colors hover:bg-[#5BB48F]"
                                                    >
                                                        Enregistrer
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {deliveryAssignments[selectedMeal.pmId] && (
                                            <p className="text-[10px] text-[#6BC4A0] font-bold mt-2">
                                                ✓ {deliveryAssignments[selectedMeal.pmId].timeSlot} · {deliveryAssignments[selectedMeal.pmId].location} ({profile.savedAddresses?.[deliveryAssignments[selectedMeal.pmId].location] ?? 'adresse en attente'})
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                {!plan.confirmed && (
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => {
                                                removeMealFromDay(selectedMeal.pmId);
                                                setSelectedMeal(null);
                                                toast.info("Repas retiré");
                                            }} 
                                            className="flex-1 bg-white border-2 border-[#E05252]/20 hover:bg-[#E05252]/5 text-[#E05252] font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={18} /> Retirer du plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delivery Assignment Sheet — opens when clicking "+ Add" in the drawer */}
            <AnimatePresence>
                {showDeliverySheet && pendingMeal && (
                    <div className="fixed inset-0 z-[150] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDeliverySheet(false)}
                            className="absolute inset-0 bg-[#2D2D2D]/40 backdrop-blur-sm text-[#F5F0E8]"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                            className="w-full max-w-lg bg-white rounded-t-3xl shadow-[0_-12px_48px_rgba(45,45,45,0.12)] relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                                <div className="w-10 h-1 rounded-full bg-[#D4C9BE]" />
                            </div>

                            <div className="px-5 pb-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-serif text-xl text-[#2D2D2D]">{pendingMeal.meal.emoji} {pendingMeal.meal.name}</h3>
                                        <p className="text-xs text-[#9C9C9C] mt-0.5">{pendingMeal.meal.price_mad} MAD · {pendingMeal.meal.macros.kcal} kcal</p>
                                    </div>
                                    <button onClick={() => setShowDeliverySheet(false)} className="p-2 bg-[#F1EFE8] rounded-full text-[#5F5E5A] hover:bg-[#E8E0D8]">
                                        <X size={15} />
                                    </button>
                                </div>

                                {/* ── Day selector (at the top) ── */}
                                <p className="text-[10px] text-[#9C9C9C] capitalize font-bold mb-2 tracking-wider">Jour</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {DAY_KEYS.map((key, i) => (
                                        <button
                                            key={key}
                                            onClick={() => setSheetSelectedDay(key)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                sheetSelectedDay === key
                                                    ? 'bg-[#2D2D2D] text-white'
                                                    : 'bg-[#F1EFE8] text-[#6B6B6B] hover:bg-[#E8E0D8]'
                                            }`}
                                        >
                                            {DAY_LABELS[i]}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Time selector ── */}
                                <p className="text-[10px] text-[#9C9C9C] capitalize font-bold mb-2 tracking-wider">Heure de livraison</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {(['07:00', '12:30', '18:00', '21:00'] as DeliveryTimeSlot[]).map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSheetSelectedTime(slot)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                sheetSelectedTime === slot
                                                    ? 'bg-[#6BC4A0] text-white'
                                                    : 'bg-[#F1EFE8] text-[#6B6B6B] hover:bg-[#E8E0D8]'
                                            }`}
                                        >
                                            <Clock3 size={10} /> {slot}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Location selector ── */}
                                <p className="text-[10px] text-[#9C9C9C] capitalize font-bold mb-2 tracking-wider">Lieu de livraison</p>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(['home', 'office', 'campus', 'gym', 'school'] as DeliveryLocation[]).map(loc => {
                                        const hasAddress = !!(profile.savedAddresses?.[loc]);
                                        return (
                                            <button
                                                key={loc}
                                                onClick={() => {
                                                    setSheetSelectedLocation(loc);
                                                    if (!hasAddress) setSheetPendingAddress('');
                                                }}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                                                    sheetSelectedLocation === loc
                                                        ? 'bg-[#2D2D2D] text-white'
                                                        : 'bg-[#F1EFE8] text-[#6B6B6B] hover:bg-[#E8E0D8]'
                                                }`}
                                            >
                                                <MapPin size={9} /> {loc}
                                                {!hasAddress && <span className="text-[8px] text-[#FFA07A] ml-0.5">⚠</span>}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Address prompt for unsaved location */}
                                {!profile.savedAddresses?.[sheetSelectedLocation] && (
                                    <div className="bg-[#FFF0E5] border border-[#FFA07A]/30 rounded-xl p-3 mb-3">
                                        <p className="text-[11px] text-[#9A3412] font-bold mb-2">
                                            Pas d'adresse pour <span className="capitalize">{sheetSelectedLocation}</span>. Ajoutez-en une :
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={sheetPendingAddress}
                                                onChange={e => setSheetPendingAddress(e.target.value)}
                                                placeholder="ex: 12 Rue Hassan II, Tanger"
                                                className="flex-1 text-xs px-3 py-2 rounded-2xl border border-[#F0E4D8] bg-white outline-none focus:ring-1 focus:ring-[#6BC4A0]"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (sheetPendingAddress.trim()) {
                                                        setSavedAddress(sheetSelectedLocation, sheetPendingAddress.trim());
                                                        toast.success(`Adresse sauvegardée pour ${sheetSelectedLocation}`);
                                                    }
                                                }}
                                                className="bg-[#6BC4A0] text-white text-xs font-bold px-3 py-2 rounded-2xl hover:bg-[#5BB48F] transition-colors"
                                            >
                                                Enregistrer
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CTA — reads from sheet state, NOT the original drawer day */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        // Assign meal to the selected day (not the original drawer day)
                                        assignMeal(sheetSelectedDay, pendingMeal.meal.id, activeMemberId);
                                        // Get the new plannedMeal id from the latest store state
                                        const newPm = usePlannerStore.getState().plan.planned_meals.find(
                                            pm => pm.meal_id === pendingMeal.meal.id && DAY_KEYS.indexOf(sheetSelectedDay) === pm.day_index
                                        );
                                        if (newPm) {
                                            setDeliveryAssignment(newPm.id, {
                                                timeSlot: sheetSelectedTime,
                                                location: sheetSelectedLocation,
                                            });
                                        }
                                        setShowDeliverySheet(false);
                                        toast.success(`✅ Ajouté le ${capitalize(sheetSelectedDay)} à ${sheetSelectedTime}`);
                                    }}
                                    className="w-full bg-[#6BC4A0] hover:bg-[#5BB48F] text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(107,196,160,0.25)] transition-colors mt-1"
                                >
                                    Ajouter le {capitalize(sheetSelectedDay)} à {sheetSelectedTime} →
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Feature 5: Confirm & Pay Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmModal(false)} className="absolute inset-0 bg-[#2D2D2D]/50 backdrop-blur-sm text-[#F5F0E8]" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 24 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 24 }}
                            className="bg-white rounded-[20px] w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10 shadow-[0_32px_64px_rgba(45,45,45,0.2)]"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-serif text-2xl text-[#2D2D2D]">Réviser et Confirmer</h2>
                                    <button onClick={() => setShowConfirmModal(false)} className="p-2 bg-[#F1EFE8] rounded-full text-[#5F5E5A] hover:bg-[#E8E0D8]"><X size={16} /></button>
                                </div>

                                {/* Meals grouped by day */}
                                <div className="space-y-2 mb-6">
                                    {plan.planned_meals.map((pm, idx) => {
                                        const m = meals.find(x => x.id === pm.meal_id);
                                        if (!m) return null;
                                        const assign = deliveryAssignments[pm.id];
                                        return (
                                            <div key={pm.id} className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${
                                                idx % 2 === 0 ? 'bg-[#FAFAF8]' : 'bg-white'
                                            }`}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-base flex-shrink-0">{m.emoji}</span>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-[#2D2D2D] truncate">{m.name}</p>
                                                        <p className="text-[10px] text-[#9C9C9C]">
                                                            {DAY_LABELS[pm.day_index]}
                                                            {assign && ` · ${assign.timeSlot} · ${assign.location}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0 ml-2">
                                                    <span className="text-xs font-black text-[#2F8B60]">{m.price_mad} MAD</span>
                                                    {!assign && <span className="text-[9px] text-[#FFA07A] font-bold">⚠ Pas de livraison définie</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <hr className="border-[#F0EBE3] mb-4" />

                                {/* Pricing breakdown */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm text-[#6B6B6B]">
                                        <span>Sous-total ({totalMeals} repas)</span>
                                        <span>{subtotal} MAD</span>
                                    </div>
                                    {discountPct > 0 && (
                                        <div className="flex justify-between text-sm text-[#6BC4A0] font-semibold">
                                            <span>Remise de volume (-{discountPct}%)</span>
                                            <span>-{subtotal - discountedTotal} MAD</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-black text-[#2D2D2D] text-base pt-1 border-t border-[#F0EBE3]">
                                        <span>Total</span>
                                        <span className="text-[#2F8B60]">{discountedTotal} MAD</span>
                                    </div>
                                    <p className="text-[10px] text-[#9C9C9C] text-right">Facturé ce samedi</p>
                                </div>

                                {/* Missing delivery warning */}
                                {plan.planned_meals.some(pm => !deliveryAssignments[pm.id]) && (
                                    <div className="bg-[#FFF0E5] border border-[#FFA07A]/30 rounded-xl p-3 mb-4">
                                        <p className="text-[11px] text-[#9A3412] font-semibold">
                                            ⚠️ Certains repas n'ont pas d'heure/lieu de livraison. Ouvrez chaque repas pour le définir, ou confirmez quand même.
                                        </p>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setConfirmed(true);
                                        addPoints(25);
                                        setShowConfirmModal(false);
                                        toast.success('🎉 Semaine confirmée ! Livraisons planifiées.', { duration: 4000 });
                                    }}
                                    className="w-full bg-[#6BC4A0] hover:bg-[#5BB48F] text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(107,196,160,0.3)] transition-colors"
                                >
                                    Confirmer et planifier →
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DndContext>
    );
}
