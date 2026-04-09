"use client";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/lib/store";
import { ArrowRight, Check, Users, Calendar, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PricingSetupPage() {
    const router = useRouter();
    const { selections, updateSelections } = useOnboardingStore();

    const [people, setPeople] = useState(selections.peopleCount);
    const [days, setDays] = useState(selections.daysPerWeek);
    const [meals, setMeals] = useState(selections.mealsPerDay);

    const handleNext = () => {
        updateSelections({ peopleCount: people, daysPerWeek: days, mealsPerDay: meals });
        router.push("/onboarding/menu-selection");
    };

    const getDiscount = (p: number) => {
        if (p === 2) return "-8%";
        if (p === 3) return "-12%";
        if (p >= 4) return "-15%";
        return null;
    };

    return (
        <div className="w-full pb-32">
            <div className="text-center mb-16">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Étape 05
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-6xl text-text-primary mb-6"
                >
                    Construisez votre semaine
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-lg mx-auto"
                >
                    Personnalisez votre fréquence de livraison et la taille de votre foyer. 
                    Les réductions s'appliquent automatiquement pour les commandes plus importantes.
                </motion.p>
            </div>

            <div className="max-w-2xl mx-auto space-y-16">
                {/* Q1: People */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                            <Users size={20} />
                        </div>
                        <h2 className="font-serif text-2xl text-text-primary italic">Combien de personnes nourrissons-nous ?</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeople(p)}
                                className={`group relative h-24 rounded-[24px] border-[1.5px] transition-all flex flex-col items-center justify-center gap-1 overflow-hidden ${
                                    people === p 
                                        ? "bg-primary/[0.03] border-primary text-primary" 
                                        : "bg-white border-border text-text-muted hover:border-primary/20"
                                }`}
                            >
                                <span className="font-serif text-2xl">{p === 5 ? "5+" : p}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest">{p === 1 ? "Personne" : "Personnes"}</span>
                                {getDiscount(p) && (
                                    <div className="absolute top-0 right-0 p-1 bg-accent text-white text-[7px] font-bold uppercase rounded-bl-lg">
                                        {getDiscount(p)}
                                    </div>
                                )}
                                {people === p && <Check size={14} className="absolute bottom-3 right-3 text-primary" />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Q2: Days */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                            <Calendar size={20} />
                        </div>
                        <h2 className="font-serif text-2xl text-text-primary italic">Combien de jours par semaine ?</h2>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {[3, 4, 5, 6, 7].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`group h-20 rounded-[20px] border-[1.5px] transition-all flex flex-col items-center justify-center relative ${
                                    days === d 
                                        ? "bg-primary/[0.03] border-primary text-primary" 
                                        : "bg-white border-border text-text-muted hover:border-primary/20"
                                }`}
                            >
                                <span className="font-serif text-xl">{d}</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest">Jours</span>
                                {days === d && <Check size={12} className="absolute bottom-2 right-2 text-primary" />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Q3: Meals */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                            <Utensils size={20} />
                        </div>
                        <h2 className="font-serif text-2xl text-text-primary italic">Repas par jour, par personne ?</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMeals(m)}
                                className={`group h-24 rounded-[24px] border-[1.5px] transition-all flex flex-col items-center justify-center relative ${
                                    meals === m 
                                        ? "bg-primary/[0.03] border-primary text-primary" 
                                        : "bg-white border-border text-text-muted hover:border-primary/20"
                                }`}
                            >
                                <span className="font-serif text-2xl">{m}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest">Repas</span>
                                <span className="text-[9px] font-sans italic text-text-muted opacity-60">
                                    {m === 1 ? "Déjeuner" : m === 2 ? "Déjeuner + Dîner" : "Tous les repas"}
                                </span>
                                {meals === m && <Check size={14} className="absolute bottom-3 right-3 text-primary" />}
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="w-full h-16 rounded-full bg-primary text-background font-sans font-bold flex items-center justify-center gap-3 text-lg shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90 transition-all uppercase tracking-widest group"
                    >
                        <span>Choisir vos repas</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
