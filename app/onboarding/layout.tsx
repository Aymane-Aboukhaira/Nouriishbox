"use client";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { PublicFooter } from "@/components/layout/public-footer";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const isRevealPage = pathname.includes("reveal");

    const stepInfo = useMemo(() => {
        if (pathname === "/onboarding") return { step: 1, max: 5 };
        if (pathname.includes("body")) return { step: 2, max: 5 };
        if (pathname.includes("goals")) return { step: 3, max: 5 };
        if (pathname.includes("family") || pathname.includes("locations")) return { step: 4, max: 5 };
        if (pathname.includes("review")) return { step: 5, max: 5 };
        return { step: 0, max: 5 };
    }, [pathname]);

    const progress = stepInfo.step > 0 ? (stepInfo.step / stepInfo.max) * 100 : 0;

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isRevealPage ? "bg-primary" : "bg-background"}`}>
            <PublicNavbar />
            
            {stepInfo.step > 0 && !isRevealPage && (
                <div className="pt-[80px] sm:pt-[100px] lg:pt-[120px]">
                    {/* Thin Terracotta Progress Line */}
                    <div className="w-full h-[1.5px] bg-border relative">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                    
                    <div className="px-4 sm:px-6 py-6 sm:py-10 flex items-center justify-between max-w-4xl mx-auto w-full">
                        <button
                            onClick={() => router.back()}
                            className={`group flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors ${stepInfo.step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back</span>
                        </button>
                        
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Étape {stepInfo.step}</span>
                            <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-[0.1em]">sur {stepInfo.max}</span>
                        </div>
                        
                        <div className="w-12 h-12 lg:hidden md:block hidden" /> {/* Spacer for balance */}
                        <div className="hidden lg:block w-20" />
                    </div>
                </div>
            )}

            <main className={`flex-1 flex flex-col items-center justify-start ${isRevealPage ? "pt-0" : "pt-4"} px-6 pb-32 max-w-5xl mx-auto w-full relative z-10`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {!isRevealPage && <PublicFooter />}
        </div>
    );
}
