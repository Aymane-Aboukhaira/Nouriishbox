"use client";
import { useRouter } from "next/navigation";
import { User, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingForkPage() {
    const router = useRouter();

    return (
        <div className="w-full space-y-12 flex flex-col items-center justify-center min-h-[50vh] py-12">
            <div className="text-center max-w-xl mx-auto">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Getting Started
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4 leading-tight"
                >
                    Who are we cooking for?
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans"
                >
                    Select the profile type that best fits your needs.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(44, 62, 45, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/onboarding/body?mode=solo")}
                    className="group bg-white border-[1.5px] border-border hover:border-primary/30 p-10 lg:p-12 rounded-[32px] text-left transition-all relative overflow-hidden"
                >
                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-background transition-colors">
                        <User size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl lg:text-3xl text-text-primary mb-3">Just for me</h2>
                    <p className="text-text-muted text-sm lg:text-base leading-relaxed mb-8">
                        I want meals prepared exclusively for my own goals, macros, and dietary preferences.
                    </p>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                        <span>Get Started</span>
                        <ArrowRight size={16} />
                    </div>
                </motion.button>

                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(196, 96, 42, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/onboarding/family-setup?mode=family")}
                    className="group bg-white border-[1.5px] border-border hover:border-accent/30 p-10 lg:p-12 rounded-[32px] text-left transition-all relative overflow-hidden"
                >
                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:bg-accent group-hover:text-background transition-colors">
                        <Users size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl lg:text-3xl text-text-primary mb-3">For my family</h2>
                    <p className="text-text-muted text-sm lg:text-base leading-relaxed mb-8">
                        I want to feed a partner or kids, each with their own nutritional needs and delivery logistics.
                    </p>
                    <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                        <span>Plan Together</span>
                        <ArrowRight size={16} />
                    </div>
                </motion.button>
            </div>
        </div>
    );
}
