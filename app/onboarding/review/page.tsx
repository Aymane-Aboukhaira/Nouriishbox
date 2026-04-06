"use client";
import { useRouter } from "next/navigation";
import { useProfileStore, useFamilyStore } from "@/lib/store";
import { ArrowRight, Target, Activity, MapPin, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewPage() {
    const router = useRouter();
    const { profile } = useProfileStore();
    const { members } = useFamilyStore();

    const savedLocs = Object.entries(profile.savedAddresses || {})
        .filter(([_, val]) => !!(val as string).trim())
        .map(([key, val]) => ({ key, address: val as string }));

    const secondaryMembers = members.filter(m => m.relation !== "self" && m.id !== "f1" && m.id !== "u1");
    const mode = secondaryMembers.length > 0 ? "family" : "solo";

    return (
        <div className="w-full pb-32">
            <div className="text-center mb-12">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Step 05
                </motion.span>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={32} strokeWidth={1.5} />
                    </div>
                </div>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4"
                >
                    Profile Complete
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    Review your targets before we build your week.
                </motion.p>
            </div>

            <div className="space-y-6 max-w-lg mx-auto">
                {/* Main Macro Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-8 lg:p-10 rounded-[32px] border-[1.5px] border-border shadow-[0_20px_50px_-10px_rgba(44,62,45,0.06)] overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-border pb-3">Your Daily Targets</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-6xl font-serif text-text-primary leading-none">{profile.targets?.kcal || 0}</span>
                            <span className="text-xs font-bold text-accent uppercase tracking-widest ml-2">kcal</span>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <span className="block text-xl font-serif text-primary">{profile.targets?.protein_g || 0}g</span>
                                <span className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Protein</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-serif text-primary">{profile.targets?.carbs_g || 0}g</span>
                                <span className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Carbs</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-serif text-primary">{profile.targets?.fats_g || 0}g</span>
                                <span className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Fats</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[24px] border-[1.5px] border-border flex flex-col gap-2 shadow-sm">
                        <Activity size={20} strokeWidth={1.5} className="text-primary" />
                        <div>
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Activity</span>
                            <p className="font-serif text-lg text-text-primary capitalize">{profile.activity_level?.replace("_", " ")}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border-[1.5px] border-border flex flex-col gap-2 shadow-sm">
                        <Target size={20} strokeWidth={1.5} className="text-primary" />
                        <div>
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Goal</span>
                            <p className="font-serif text-lg text-text-primary capitalize">{profile.goal?.replace("_", " ")}</p>
                        </div>
                    </div>
                </div>

                {/* Family Details */}
                {mode === "family" && (
                    <div className="bg-white p-6 rounded-[24px] border-[1.5px] border-border flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                                <Users size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-serif text-lg text-text-primary leading-tight">Family Mode</h4>
                                <p className="text-xs text-text-muted">{secondaryMembers.length} additional members</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest rounded-full">Active</div>
                    </div>
                )}

                {/* Location Details */}
                {savedLocs.length > 0 && (
                    <div className="bg-white p-8 rounded-[32px] border-[1.5px] border-border shadow-sm">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-border pb-3">Delivery Locations</h3>
                        <div className="space-y-5">
                            {savedLocs.map((loc, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={16} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="font-serif text-base text-text-primary capitalize leading-tight mb-1">{loc.key}</p>
                                        <p className="text-xs text-text-muted truncate max-w-[200px] font-sans">{loc.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/onboarding/pricing-setup")}
                        className="w-full h-16 rounded-full bg-primary text-background font-sans font-bold flex items-center justify-center gap-3 text-lg shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                        <span>Build my week</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
