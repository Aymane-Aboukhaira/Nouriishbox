"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/store";
import { Minus, Plus, ArrowRight, Utensils } from "lucide-react";
import { motion } from "framer-motion";

export default function FamilySetupPage() {
    const router = useRouter();
    const { setupFamily } = useFamilyStore();
    
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const handleNext = () => {
        setupFamily(adults, children);
        router.push("/onboarding/family-preferences?mode=family");
    };

    return (
        <div className="w-full pb-32 flex flex-col items-center">
            <div className="text-center mb-12 w-full">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Step 04
                </motion.span>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Utensils size={32} strokeWidth={1.5} />
                </div>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4"
                >
                    Who is at the table?
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    We'll help you plan meals for every seat in the house.
                </motion.p>
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Adults Stepper */}
                <motion.div 
                    whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(44, 62, 45, 0.05)" }}
                    className="bg-white p-10 rounded-[32px] border-[1.5px] border-border shadow-[0_10px_30px_-10px_rgba(44,62,45,0.05)] transition-all hover:border-primary/30"
                >
                    <div className="flex flex-col items-center gap-8">
                        <span className="font-bold text-text-muted uppercase tracking-[0.2em] text-[10px]">Adults</span>
                        <div className="flex items-center gap-10">
                            <button
                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                className="w-14 h-14 rounded-full border-[1.5px] border-border flex items-center justify-center text-text-primary hover:bg-background hover:border-primary/30 transition-all active:scale-90"
                            >
                                <Minus size={24} strokeWidth={1.5} />
                            </button>
                            <span className="font-serif text-6xl text-text-primary w-16 text-center">{adults}</span>
                            <button
                                onClick={() => setAdults(adults + 1)}
                                className="w-14 h-14 rounded-full border-[1.5px] border-border flex items-center justify-center text-text-primary hover:bg-background hover:border-primary/30 transition-all active:scale-90"
                            >
                                <Plus size={24} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Children Stepper */}
                <motion.div 
                    whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(196, 96, 42, 0.05)" }}
                    className="bg-white p-10 rounded-[32px] border-[1.5px] border-border shadow-[0_10px_30px_-10px_rgba(44,62,45,0.05)] transition-all hover:border-accent/30"
                >
                    <div className="flex flex-col items-center gap-8">
                        <span className="font-bold text-text-muted uppercase tracking-[0.2em] text-[10px]">Children</span>
                        <div className="flex items-center gap-10">
                            <button
                                onClick={() => setChildren(Math.max(0, children - 1))}
                                className="w-14 h-14 rounded-full border-[1.5px] border-border flex items-center justify-center text-text-primary hover:bg-background hover:border-accent/30 transition-all active:scale-90"
                            >
                                <Minus size={24} strokeWidth={1.5} />
                            </button>
                            <span className="font-serif text-6xl text-text-primary w-16 text-center">{children}</span>
                            <button
                                onClick={() => setChildren(children + 1)}
                                className="w-14 h-14 rounded-full border-[1.5px] border-border flex items-center justify-center text-text-primary hover:bg-background hover:border-accent/30 transition-all active:scale-90"
                            >
                                <Plus size={24} strokeWidth={1.5} />
                            </button>
                        </div>
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
                        <span>Next Step</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
