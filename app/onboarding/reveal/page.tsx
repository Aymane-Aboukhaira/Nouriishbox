"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    UtensilsCrossed, Drumstick, Target, Check, ShieldCheck,
    PauseCircle, Truck, X, ArrowRight, CheckCircle2,
    Sparkles, Zap, Flame, Droplets, ShoppingBag
} from "lucide-react";
import { useProfileStore, useMealsStore, usePlannerStore } from "@/lib/store";
import { toast } from "sonner";

const PLANS = [
    { id: "solo", name: "Solo", price: 320, meals: "5 meals", desc: "Perfect for building a solo habit" },
    { id: "couple", name: "Couple", price: 590, meals: "10 meals", desc: "Save 50 MAD vs two Solo plans" },
    { id: "family", name: "Family", price: 890, meals: "20 meals", desc: "Everyone eats right, together" },
];

export default function RevealPage() {
    const router = useRouter();
    const { profile } = useProfileStore();
    const { meals } = useMealsStore();
    const { plan: plannerStoreData, addMealToDay } = usePlannerStore();

    const [hasMounted, setHasMounted] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [addedMeals, setAddedMeals] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    if (!profile.targets || profile.targets.kcal === 0) {
        router.push("/onboarding");
        return null;
    }

    const { kcal, protein_g, carbs_g, fats_g } = profile.targets;
    const mealCount = Math.round(kcal / 500);
    const goalLabel = profile.goal === "weight_loss" ? "Lose weight" :
        profile.goal === "muscle_gain" ? "Build muscle" : "Maintain health";

    const targetMealMacros = {
        protein: protein_g / 3,
        carbs: carbs_g / 3,
        fats: fats_g / 3,
    };

    const scoredMeals = meals.map((m) => {
        const score =
            Math.abs(m.macros.protein_g - targetMealMacros.protein) +
            Math.abs(m.macros.carbs_g - targetMealMacros.carbs) +
            Math.abs(m.macros.fats_g - targetMealMacros.fats);
        return { ...m, score };
    }).sort((a, b) => a.score - b.score).slice(0, 3);

    const handleAddMeal = (mealId: string) => {
        const usedDays = plannerStoreData.planned_meals.map((pm) => pm.day_index);
        const freeDay = [0, 1, 2, 3, 4, 5, 6].find(
            (d) => !plannerStoreData.paused_days.includes(d) && usedDays.filter((ud) => ud === d).length === 0
        );

        if (freeDay !== undefined) {
            addMealToDay(freeDay, mealId, "f1");
            setAddedMeals({ ...addedMeals, [mealId]: true });
            setTimeout(() => {
                setAddedMeals((prev) => ({ ...prev, [mealId]: false }));
            }, 1500);
        } else {
            toast.error("Your planner is full — visit the planner to make space");
        }
    };

    const handleCheckout = () => {
        if (selectedPlan) {
            router.push(`/checkout?plan=${selectedPlan}`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
        }
    };

    return (
        <div className="min-h-screen bg-primary text-background selection:bg-accent selection:text-white pb-32">
            <main className="w-full max-w-6xl mx-auto px-6 py-20">

                {/* header */}
                <motion.section 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-24"
                >
                    <motion.div variants={itemVariants} className="flex justify-center mb-8">
                        <div className="bg-background/10 backdrop-blur-md border border-background/20 px-6 py-2 rounded-full flex items-center gap-2">
                            <Sparkles size={16} className="text-accent" />
                            <span className="text-[10px] font-bold text-background uppercase tracking-[0.2em]">Precision Plan Generated</span>
                        </div>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="font-serif text-5xl lg:text-8xl text-background mb-8 leading-[0.9] tracking-tight"
                    >
                        Your journey <br /> to <span className="italic text-accent">precision</span> starts here.
                    </motion.h1>

                    <motion.p 
                        variants={itemVariants}
                        className="text-xl lg:text-2xl text-background/60 max-w-2xl mx-auto font-sans font-light leading-relaxed"
                    >
                        We've analyzed your morphology, activity, and goals to build a scientifically matched week of nutrition.
                    </motion.p>
                </motion.section>

                {/* Macro Metric Blocks */}
                <motion.section 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-32"
                >
                    {[
                        { label: "Daily Calories", value: kcal, unit: "kcal", icon: Flame, color: "text-accent" },
                        { label: "Target Protein", value: protein_g, unit: "g", icon: Zap, color: "text-primary" },
                        { label: "Healthy Carbs", value: carbs_g, unit: "g", icon: Flame, color: "text-primary" },
                        { label: "Planned Fats", value: fats_g, unit: "g", icon: Droplets, color: "text-primary" },
                    ].map((m, i) => (
                        <motion.div 
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="bg-background/5 backdrop-blur-xl border border-background/10 rounded-[32px] p-10 flex flex-col justify-between group h-full"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="p-3 bg-background/10 rounded-2xl">
                                    <m.icon size={24} strokeWidth={1.5} className="text-background" />
                                </div>
                                <span className="text-[10px] font-bold text-background/40 uppercase tracking-[0.2em]">{m.label}</span>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-serif text-background leading-none">{m.value}</span>
                                    <span className="text-lg font-serif text-background/40 italic">{m.unit}</span>
                                </div>
                                <div className="w-full bg-background/10 h-[2px] mt-6 relative overflow-hidden">
                                    <motion.div 
                                        initial={{ x: "-100%" }}
                                        animate={{ x: 0 }}
                                        transition={{ delay: 1 + i * 0.2, duration: 1.5, ease: "easeOut" }}
                                        className="absolute inset-0 bg-accent"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.section>

                {/* insight strip with glass effect */}
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32 py-10 border-y border-background/10 grid grid-cols-1 md:grid-cols-3 gap-12"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-background shrink-0 shadow-lg shadow-accent/20">
                            <UtensilsCrossed size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-serif text-2xl text-background mb-1">{mealCount} Meals / Day</h4>
                            <p className="text-sm text-background/60 uppercase tracking-widest font-bold">Scientific Portions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-background/10 rounded-2xl flex items-center justify-center text-background shrink-0 border border-background/20">
                            <Target size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-serif text-2xl text-background mb-1">{goalLabel}</h4>
                            <p className="text-sm text-background/60 uppercase tracking-widest font-bold">Primary KPI</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-background/10 rounded-2xl flex items-center justify-center text-background shrink-0 border border-background/20">
                            <Truck size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="font-serif text-2xl text-background mb-1">Free Delivery</h4>
                            <p className="text-sm text-background/60 uppercase tracking-widest font-bold">Casablanca & Rabat</p>
                        </div>
                    </div>
                </motion.section>

                {/* Meal Preview Section */}
                <section className="mb-40">
                    <div className="text-center mb-20">
                        <h2 className="font-serif text-4xl lg:text-6xl text-background mb-6">Matched to your profile</h2>
                        <p className="text-background/60 text-lg lg:text-xl font-sans max-w-xl mx-auto leading-relaxed">
                            These meals were precisely curated to hit your custom macro targets for the week.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {scoredMeals.map((meal, i) => {
                            const added = addedMeals[meal.id];
                            return (
                                <motion.div 
                                    key={meal.id} 
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-background rounded-[40px] p-4 flex flex-col group h-full shadow-2xl shadow-black/40"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] mb-8">
                                        {meal.image_url ? (
                                            <img 
                                                src={meal.image_url} 
                                                alt={meal.name} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/5 flex items-center justify-center text-8xl">{meal.emoji}</div>
                                        )}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <div className="bg-background/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest shadow-xl">
                                                Perfect Match
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 pb-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-primary/5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">{meal.macros.kcal} Kcal</span>
                                            <span className="px-3 py-1 bg-accent/10 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">{meal.macros.protein_g}g Protein</span>
                                        </div>
                                        <h3 className="font-serif text-2xl text-primary leading-tight mb-8 group-hover:text-accent transition-colors">{meal.name}</h3>
                                        <button
                                            onClick={() => handleAddMeal(meal.id)}
                                            className={`mt-auto w-full py-5 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                                                added ? "bg-primary text-background shadow-lg" : "border-2 border-primary/10 text-primary hover:border-primary"
                                            }`}
                                        >
                                            {added ? <><CheckCircle2 size={16} /> Added to Plan</> : "Add to plan"}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Plan Selection with Premium Cards */}
                <section className="mb-40">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-4 block">Finalize Fulfillment</span>
                        <h2 className="font-serif text-4xl lg:text-7xl text-background mb-8">Choose your box size</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto mb-20">
                        {PLANS.map((plan, i) => {
                            const isSelected = selectedPlan === plan.id;
                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`flex-1 rounded-[40px] p-12 text-center transition-all cursor-pointer relative overflow-hidden group border-2 ${
                                        isSelected
                                            ? "bg-accent border-accent shadow-[0_30px_60px_-15px_rgba(196,96,42,0.4)] translate-y-[-10px]"
                                            : "bg-background/5 border-background/10 hover:border-background/30 hover:bg-background/10"
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-6 right-6 text-background">
                                            <Check size={32} />
                                        </div>
                                    )}
                                    <h3 className={`font-serif text-3xl mb-2 transition-colors ${isSelected ? "text-background" : "text-background"}`}>{plan.name}</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-10 transition-colors ${isSelected ? "text-background/80" : "text-background/40"}`}>{plan.meals}</p>
                                    <div className="mb-10">
                                        <div className="flex items-start justify-center">
                                            <span className={`text-6xl font-serif leading-none ${isSelected ? "text-background" : "text-background"}`}>{plan.price}</span>
                                            <span className={`text-xs font-bold uppercase tracking-widest ml-2 mt-1 ${isSelected ? "text-background/80" : "text-background/40"}`}>MAD</span>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 block ${isSelected ? "text-background/60" : "text-background/30"}`}>per week</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed max-w-[200px] mx-auto ${isSelected ? "text-background/90" : "text-background/60"}`}>{plan.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <motion.button
                            whileHover={selectedPlan ? { scale: 1.02, y: -4 } : {}}
                            whileTap={selectedPlan ? { scale: 0.98 } : {}}
                            onClick={handleCheckout}
                            disabled={!selectedPlan}
                            className={`w-full max-w-xl mx-auto h-20 rounded-full font-sans font-bold text-xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] shadow-2xl ${
                                selectedPlan 
                                    ? "bg-background text-primary shadow-white/10" 
                                    : "bg-background/10 text-background/30 cursor-not-allowed border border-background/10"
                            }`}
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight size={24} />
                        </motion.button>
                    </div>
                </section>

                {/* trust signals footer */}
                <section className="flex flex-wrap items-center justify-center gap-12 pt-16 border-t border-background/10">
                    {[
                        { icon: ShieldCheck, text: "SSL Secured Payments" },
                        { icon: PauseCircle, text: "No Commitment, Pause Anytime" },
                        { icon: Truck, text: "Temperature Controlled Delivery" },
                        { icon: ShoppingBag, text: "Curated Box Options" },
                    ].map((t, i) => (
                        <div key={i} className="flex items-center gap-3 text-background/40 hover:text-background/80 transition-colors">
                            <t.icon size={20} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t.text}</span>
                        </div>
                    ))}
                </section>

            </main>
        </div>
    );
}
