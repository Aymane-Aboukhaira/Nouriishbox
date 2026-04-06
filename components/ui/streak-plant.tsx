"use client";
import { motion } from "framer-motion";
import type { PlantStage } from "@/lib/types";

const STAGE_CONFIG: Record<PlantStage, { emoji: string; label: string; color: string; nextAt: number }> = {
    seed: { emoji: "🌰", label: "Graine", color: "#92620A", nextAt: 3 },
    sprout: { emoji: "🌱", label: "Pousse", color: "#166534", nextAt: 7 },
    sapling: { emoji: "🪴", label: "Plantule", color: "#2F8B60", nextAt: 14 },
    tree: { emoji: "🌳", label: "Arbre", color: "#2F8B60", nextAt: 21 },
    forest: { emoji: "🌲", label: "Forêt", color: "#166534", nextAt: Infinity },
};

interface StreakPlantProps {
    streak: number;
    stage: PlantStage;
    compact?: boolean;
}

export function StreakPlant({ streak, stage, compact = false }: StreakPlantProps) {
    const config = STAGE_CONFIG[stage];
    const nextStage = Object.values(STAGE_CONFIG);
    const currentIdx = Object.keys(STAGE_CONFIG).indexOf(stage);
    const nextConfig = nextStage[currentIdx + 1];
    const progress = nextConfig
        ? Math.round(((streak - (currentIdx > 0 ? nextStage[currentIdx - 1]?.nextAt ?? 0 : 0)) /
            (config.nextAt - (currentIdx > 0 ? nextStage[currentIdx - 1]?.nextAt ?? 0 : 0))) *
            100)
        : 100;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="text-2xl"
                >
                    {config.emoji}
                </motion.span>
                <div>
                    <p className="text-xs font-bold text-[#2D2D2D]">{streak} jours</p>
                    <p className="text-[10px] text-[#9C9C9C]">{config.label}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 p-6 rounded-[20px]"
            style={{
                background: "linear-gradient(135deg, #F1FAF4, #A8E6CF22)",
                border: "1px solid #A8E6CF",
            }}>
            {/* Plant emoji with pulse */}
            <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                className="text-5xl"
            >
                {config.emoji}
            </motion.div>

            <div className="text-center">
                <p className="font-serif text-lg text-[#2F8B60]">{config.label}</p>
                <p className="text-3xl font-bold text-[#2D2D2D]">
                    {streak}
                    <span className="text-sm font-medium text-[#9C9C9C] ml-1">jours</span>
                </p>
            </div>

            {/* Progress to next stage */}
            {nextConfig && (
                <div className="w-full">
                    <div className="flex justify-between text-[10px] text-[#9C9C9C] mb-1.5">
                        <span>Prochain: {nextStage[currentIdx + 1]?.label}</span>
                        <span>{Math.min(progress, 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(90deg, #6BC4A0, #2F8B60)" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
