"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BodySlider } from "../components/BodySlider";
import { useProfileStore } from "@/lib/store";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function BodyMetricsPage() {
    const router = useRouter();
    const { profile, updateProfile } = useProfileStore();

    const [gender, setGender] = useState<"male" | "female">(profile.gender || "female");
    const [age, setAge] = useState(profile.age || 30);
    const [height, setHeight] = useState(profile.height_cm || 165);
    const [weight, setWeight] = useState(profile.weight_kg || 65);
    const [tdee, setTdee] = useState(0);

    // Calculate TDEE in real time
    useEffect(() => {
        let bmr = 10 * weight + 6.25 * height - 5 * age;
        bmr += gender === "male" ? 5 : -161;
        
        // Base sedentary multiplier to show them a baseline
        const baseMultiplier = 1.2;
        setTdee(Math.round(bmr * baseMultiplier));
    }, [gender, age, height, weight]);

    const handleNext = () => {
        updateProfile({ gender, age, height_cm: height, weight_kg: weight });
        router.push("/onboarding/goals");
    };

    return (
        <div className="w-full pb-32">
            <div className="text-center mb-12">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Étape 02
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4"
                >
                    Construisons votre profil
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    Nous utilisons ceci pour calculer vos besoins caloriques exacts.
                </motion.p>
            </div>

            <div className="space-y-8 max-w-lg mx-auto">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setGender("female")}
                        className={`h-20 rounded-[20px] font-serif text-xl transition-all border-[1.5px] flex items-center justify-center gap-3 relative overflow-hidden ${
                            gender === "female" 
                                ? "bg-primary/[0.03] border-primary text-primary" 
                                : "bg-white border-border text-text-muted hover:border-primary/30"
                        }`}
                    >
                        <span>Femme</span>
                        {gender === "female" && <Check size={18} />}
                    </button>
                    <button
                        onClick={() => setGender("male")}
                        className={`h-20 rounded-[20px] font-serif text-xl transition-all border-[1.5px] flex items-center justify-center gap-3 relative overflow-hidden ${
                            gender === "male" 
                                ? "bg-primary/[0.03] border-primary text-primary" 
                                : "bg-white border-border text-text-muted hover:border-primary/30"
                        }`}
                    >
                        <span>Homme</span>
                        {gender === "male" && <Check size={18} />}
                    </button>
                </div>

                <div className="space-y-6">
                    <BodySlider label="Âge" unit="ans" min={16} max={99} value={age} onChange={setAge} />
                    <BodySlider label="Taille" unit="cm" min={140} max={220} value={height} onChange={setHeight} />
                    <BodySlider label="Poids" unit="kg" min={40} max={150} value={weight} onChange={setWeight} />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-8 rounded-[24px] border-[1.5px] border-border text-center mt-12 shadow-[0_10px_40px_-10px_rgba(44,62,45,0.05)]"
                >
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3">TDEE de base</p>
                    <div className="flex flex-col items-center">
                        <div className="text-6xl font-serif text-text-primary leading-none mb-2">
                            {tdee}
                        </div>
                        <span className="text-xs font-bold text-accent uppercase tracking-widest">kcal par jour</span>
                    </div>
                </motion.div>
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="w-full h-16 rounded-full bg-primary text-background font-sans font-bold flex items-center justify-center gap-3 text-lg shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                        Continuer vers objectifs <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
