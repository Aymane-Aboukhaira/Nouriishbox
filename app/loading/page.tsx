"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";
import { usePlannerStore, useProfileStore, useMealsStore, useFamilyStore } from "@/lib/store";
import { buildAutoWeek } from "@/lib/algo";

// import algo to generate week when it mounts... wait, the algo generation should happen here or inside planner.
// We'll call the algo from here to seed the store.

export default function LoadingPage() {
    const router = useRouter();
    const [stepIndex, setStepIndex] = useState(0);

    const STEPS = [
        "Analyzing your macro profile...",
        "Sourcing fresh local ingredients...",
        "Optimizing your delivery routes...",
        "Your custom Nourishbox is ready."
    ];

    const { profile } = useProfileStore();
    const { meals } = useMealsStore();
    const { members } = useFamilyStore();
    const { setupAutoWeek } = usePlannerStore();

    useEffect(() => {
        // Generate MVP auto week on mount
        const generatedDays = buildAutoWeek(profile, meals, members);
        setupAutoWeek(generatedDays);
        
        // Cycle text every 750ms -> 3000ms total logic (4 steps)
        const interval = setInterval(() => {
            setStepIndex(prev => {
                if (prev < STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 750);

        // Redirect precisely after 3000ms
        const timeout = setTimeout(() => {
            router.push("/client/planner");
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-[#FFF8F4] flex flex-col items-center justify-center p-6">
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 360] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#6BC4A0] opacity-30"
                />
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [360, 180, 0] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-2 rounded-full border-b-2 border-l-2 border-[#B09AE0] opacity-30"
                />
                <motion.div 
                    animate={{ scale: [1, 1.15, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-16 h-16 bg-[#6BC4A0] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(107,196,160,0.5)] z-10"
                >
                    <Leaf size={32} />
                </motion.div>
            </div>

            <div className="h-10 text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="font-serif text-2xl text-[#2D2D2D]"
                    >
                        {STEPS[stepIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
            
            <div className="mt-8 w-48 h-1.5 bg-[#F0E4D8] rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-[#6BC4A0]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                />
            </div>
        </div>
    );
}
