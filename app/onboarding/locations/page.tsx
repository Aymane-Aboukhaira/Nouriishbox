"use client";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/store";
import { LocationToggle } from "../components/LocationToggle";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { DeliveryLocation } from "@/lib/types";

const ALL_LOCATIONS: DeliveryLocation[] = ["home", "office", "gym", "campus", "school"];

export default function LocationsPage() {
    const router = useRouter();
    const { profile, setSavedAddress } = useProfileStore();

    const savedAddresses = profile.savedAddresses || {};

    const handleNext = () => {
        router.push("/onboarding/review");
    };

    const hasAtLeastOne = Object.values(savedAddresses).some(addr => (addr as string).trim() !== "");

    return (
        <div className="w-full pb-32">
            <div className="text-center mb-12">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Step 04
                </motion.span>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MapPin size={32} strokeWidth={1.5} />
                </div>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4"
                >
                    Where do we deliver?
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    Add the places you spend the most time so we can drop your meals precisely.
                </motion.p>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
                {ALL_LOCATIONS.map((loc) => (
                    <LocationToggle
                        key={loc}
                        location={loc}
                        address={(savedAddresses[loc] as string) || ""}
                        onChange={(addr) => setSavedAddress(loc, addr)}
                    />
                ))}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={hasAtLeastOne ? { scale: 1.02, y: -2 } : {}}
                        whileTap={hasAtLeastOne ? { scale: 0.98 } : {}}
                        onClick={handleNext}
                        disabled={!hasAtLeastOne}
                        className={`w-full h-16 rounded-full font-sans font-bold flex items-center justify-center gap-3 text-lg transition-all uppercase tracking-widest ${
                            hasAtLeastOne 
                                ? "bg-primary text-background shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90" 
                                : "bg-border text-text-muted cursor-not-allowed opacity-50"
                        }`}
                    >
                        <span>Review Profile</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
