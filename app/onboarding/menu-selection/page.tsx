"use client";
import { useRouter } from "next/navigation";
import { useOnboardingStore, useMealsStore } from "@/lib/store";
import { ArrowRight, Check, Plus, Minus, CookingPot, Info, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

export default function MenuSelectionPage() {
    const router = useRouter();
    const { selections, toggleMeal, updateSelections } = useOnboardingStore();
    const { meals } = useMealsStore();

    const maxNeeded = selections.peopleCount * selections.daysPerWeek * selections.mealsPerDay;
    const currentCount = selections.selectedMealIds.length;

    // Filter active meals
    const activeMeals = useMemo(() => meals.filter(m => m.is_active), [meals]);

    // Calculate dynamic discount
    const discountPercent = useMemo(() => {
        const p = selections.peopleCount;
        if (p === 2) return 8;
        if (p === 3) return 12;
        if (p >= 4) return 15;
        return 0;
    }, [selections.peopleCount]);

    // Calculate totals
    const subtotal = useMemo(() => {
        return selections.selectedMealIds.reduce((acc, id) => {
            const meal = meals.find(m => m.id === id);
            return acc + (meal?.price_mad || 0);
        }, 0);
    }, [selections.selectedMealIds, meals]);

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal - discountAmount;

    const handleNext = () => {
        router.push("/checkout");
    };

    const isSelected = (id: string) => selections.selectedMealIds.includes(id);

    return (
        <div className="w-full pb-64">
            <div className="text-center mb-16">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Step 06
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-6 italic"
                >
                    Pick your week's menu
                </motion.h1>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm font-sans"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm">
                        <CookingPot size={16} className="text-primary" />
                        <span>Select <span className="font-bold text-primary">{maxNeeded}</span> meals for your group</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm">
                        <Wallet size={16} className="text-primary" />
                        <span>Pricing starting at <span className="font-bold text-primary">55 MAD</span> / meal</span>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                {activeMeals.map((meal) => (
                    <motion.div
                        key={meal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group relative bg-white rounded-[32px] border-[1.5px] p-4 transition-all duration-300 hover:shadow-xl ${
                            isSelected(meal.id) ? "border-primary" : "border-border hover:border-primary/20"
                        }`}
                    >
                        <div className="relative aspect-square rounded-[24px] overflow-hidden mb-5 bg-background border border-border shadow-inner">
                            <img 
                                src={meal.image_url} 
                                alt={meal.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-xl shadow-sm">
                                {meal.emoji}
                            </div>
                            <div className="absolute top-4 right-4 p-2 px-3 bg-primary text-background rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                                {meal.price_mad} MAD
                            </div>
                        </div>

                        <div className="px-2">
                            <h3 className="font-serif text-xl text-text-primary mb-2 truncate">{meal.name}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6">
                                <span>{meal.macros?.kcal} kcal</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span>{meal.macros?.protein_g}g Protein</span>
                            </div>

                            <button
                                onClick={() => toggleMeal(meal.id)}
                                disabled={!isSelected(meal.id) && currentCount >= maxNeeded}
                                className={`w-full h-12 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                                    isSelected(meal.id)
                                        ? "bg-primary text-background"
                                        : currentCount >= maxNeeded
                                        ? "bg-border text-text-muted cursor-not-allowed"
                                        : "bg-background border border-border text-text-primary hover:bg-primary hover:border-primary hover:text-background"
                                }`}
                            >
                                {isSelected(meal.id) ? (
                                    <>
                                        <Check size={14} />
                                        <span>Added to box</span>
                                    </>
                                ) : currentCount >= maxNeeded ? (
                                    <span>Box Full</span>
                                ) : (
                                    <>
                                        <Plus size={14} />
                                        <span>Add to Plan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Sticky Pricing Summary Footer */}
            <div className="fixed bottom-0 inset-x-0 p-6 z-40 bg-gradient-to-t from-background via-background to-transparent pt-12">
                <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(44,62,45,0.2)] border-[1.5px] border-border overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center divide-y md:divide-y-0 md:divide-x divide-border">
                        
                        {/* Summary Column */}
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Selection Progress</span>
                                <span className="text-[10px] font-bold text-primary uppercase ml-auto">
                                    {currentCount} / {maxNeeded}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-1">
                                <motion.div 
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentCount / maxNeeded) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Totals Column */}
                        <div className="p-8 bg-primary/[0.02]">
                            <div className="flex flex-col gap-1 items-center md:items-end">
                                <div className="flex items-center gap-2">
                                    {discountPercent > 0 && (
                                        <span className="bg-accent text-white py-1 px-2 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                            -{discountPercent}% Total Discount
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Total Estimate</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-serif text-5xl text-text-primary">{total}</span>
                                    <span className="text-xl text-primary font-serif">MAD</span>
                                </div>
                                <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">/ week</span>
                            </div>
                        </div>

                        {/* CTA Column */}
                        <div className="p-8 flex items-center justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNext}
                                disabled={currentCount < maxNeeded}
                                className={`px-12 h-16 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl ${
                                    currentCount >= maxNeeded
                                        ? "bg-primary text-background shadow-primary/20 hover:bg-primary/90"
                                        : "bg-border text-text-muted cursor-not-allowed"
                                }`}
                            >
                                <span>Complete Order</span>
                                <ArrowRight size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
