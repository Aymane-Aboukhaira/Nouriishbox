"use client";
import type { Goal } from "@/lib/types";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    selected: Goal | "";
    onChange: (val: Goal) => void;
}

const OPTIONS: { id: Goal; title: string, desc: string }[] = [
    { id: "weight_loss", title: "Lose Weight", desc: "Caloric deficit to burn fat" },
    { id: "maintenance", title: "Maintain", desc: "Keep current healthy weight" },
    { id: "muscle_gain", title: "Build Muscle", desc: "Caloric surplus for muscle growth" },
    { id: "balance", title: "Eat Cleaner", desc: "Better overall nutrition, no strict macro focus" }
];

export function GoalPills({ selected, onChange }: Props) {
    return (
        <div className="space-y-4 w-full max-w-lg mx-auto">
            {OPTIONS.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                    <motion.button
                        key={opt.id}
                        whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(44, 62, 45, 0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(opt.id)}
                        className={`w-full p-6 lg:p-8 rounded-[20px] flex items-center justify-between text-left transition-all border-[1.5px] group ${
                            isSelected 
                                ? "bg-primary/[0.03] border-primary shadow-[0_10px_30px_-10px_rgba(44,62,45,0.1)]" 
                                : "bg-white border-border hover:border-primary/30"
                        }`}
                    >
                        <div className="pr-4">
                            <h3 className={`font-serif text-lg lg:text-xl mb-1 ${isSelected ? "text-primary" : "text-text-primary"}`}>
                                {opt.title}
                            </h3>
                            <p className="font-sans text-xs lg:text-sm text-text-muted leading-relaxed">
                                {opt.desc}
                            </p>
                        </div>
                        
                        <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected 
                                ? "border-primary bg-primary text-background" 
                                : "border-border group-hover:border-primary/30"
                        }`}>
                            {isSelected && <Check size={14} className="lg:w-4 lg:h-4" />}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
