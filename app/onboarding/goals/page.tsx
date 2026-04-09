"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/store";
import { ActivityPills } from "../components/ActivityPills";
import { GoalPills } from "../components/GoalPills";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ActivityLevel, Goal } from "@/lib/types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};

const GOAL_MODIFIERS: Record<Goal, number> = {
    weight_loss: -500,
    maintenance: 0,
    muscle_gain: 300,
    balance: 0,
};

export default function GoalsPage() {
    const router = useRouter();
    const { profile, updateProfile, setTargets } = useProfileStore();

    const [activity, setActivity] = useState<ActivityLevel>(profile.activity_level as ActivityLevel || "moderate");
    const [goal, setGoal] = useState<Goal>(profile.goal as Goal || "maintenance");
    const [targets, setLocalTargets] = useState({ kcal: 0, protein: 0, carbs: 0, fats: 0 });

    useEffect(() => {
        const { weight_kg, height_cm, age, gender } = profile;
        if (!weight_kg || !height_cm || !age || !gender) return;

        let bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age;
        bmr += gender === "male" ? 5 : -161;

        const multiplier = ACTIVITY_MULTIPLIERS[activity] || 1.2;
        let tdee = bmr * multiplier;

        let targetKcal = Math.round(tdee + GOAL_MODIFIERS[goal]);
        
        if (gender === "female" && targetKcal < 1200) targetKcal = 1200;
        if (gender === "male" && targetKcal < 1500) targetKcal = 1500;

        const protein_g = Math.round((targetKcal * 0.3) / 4);
        const carbs_g = Math.round((targetKcal * 0.45) / 4);
        const fats_g = Math.round((targetKcal * 0.25) / 9);

        setLocalTargets({ kcal: targetKcal, protein: protein_g, carbs: carbs_g, fats: fats_g });
    }, [activity, goal, profile]);

    const handleNext = () => {
        updateProfile({ activity_level: activity, goal });
        setTargets({
            kcal: targets.kcal,
            protein_g: targets.protein,
            carbs_g: targets.carbs,
            fats_g: targets.fats
        });
        
        const mode = new URLSearchParams(window.location.search).get("mode");
        if (mode === "family") {
            router.push("/onboarding/family-setup?mode=family");
        } else {
            router.push("/onboarding/locations");
        }
    };

    return (
        <div className="w-full pb-32 text-center lg:text-left">
            <div className="text-center mb-12">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Étape 03
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4"
                >
                    Activité & Objectifs
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    Ajustez vos cibles personnalisées.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
                <div className="space-y-10">
                    <section>
                        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 px-1 lg:text-left">Quel est votre niveau d'activité ?</h2>
                        <ActivityPills selected={activity} onChange={setActivity} />
                    </section>

                    <section>
                        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 px-1 lg:text-left">Quel est votre objectif ?</h2>
                        <GoalPills selected={goal} onChange={setGoal} />
                    </section>
                </div>

                <div className="lg:sticky lg:top-32 h-fit">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-10 lg:p-12 rounded-[32px] border-[1.5px] border-border shadow-[0_20px_50px_-10px_rgba(44,62,45,0.06)] relative overflow-hidden text-center"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        
                        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-8">Vos Cibles Personnalisées</h2>
                        
                        <div className="flex flex-col items-center mb-10">
                            <span className="text-7xl lg:text-8xl font-serif text-text-primary leading-none mb-2">{targets.kcal}</span>
                            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-4 py-1.5 rounded-full">Calories Quotidiennes</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-border pt-10">
                            <div className="text-center">
                                <span className="block text-2xl lg:text-3xl font-serif text-text-primary mb-1">{targets.protein}g</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Protéines</span>
                            </div>
                            <div className="text-center border-x border-border">
                                <span className="block text-2xl lg:text-3xl font-serif text-text-primary mb-1">{targets.carbs}g</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Glucides</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl lg:text-3xl font-serif text-text-primary mb-1">{targets.fats}g</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Lipides</span>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-text-muted/60 text-center mt-10 leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest font-bold">
                            Construit avec précision pour votre corps.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="w-full h-16 rounded-full bg-primary text-background font-sans font-bold flex items-center justify-center gap-3 text-lg shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                        Continuer <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
