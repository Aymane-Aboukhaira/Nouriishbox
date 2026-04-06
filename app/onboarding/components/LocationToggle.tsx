"use client";
import type { DeliveryLocation } from "@/lib/types";
import { Home, Briefcase, Dumbbell, GraduationCap, School, MapPin, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    location: DeliveryLocation;
    address: string;
    onChange: (address: string) => void;
}

const LOC_INFO: Record<DeliveryLocation, { title: string; icon: React.ElementType; color: string }> = {
    home: { title: "Home", icon: Home, color: "#2C3E2D" },
    office: { title: "Office", icon: Briefcase, color: "#C4602A" },
    gym: { title: "Gym", icon: Dumbbell, color: "#2C3E2D" },
    campus: { title: "Campus", icon: GraduationCap, color: "#C4602A" },
    school: { title: "School", icon: School, color: "#2C3E2D" },
    other: { title: "Other", icon: MapPin, color: "#6B6B6B" },
};

export function LocationToggle({ location, address, onChange }: Props) {
    const info = LOC_INFO[location];
    const Icon = info.icon;
    const isActive = !!address;
    const [isExpanded, setIsExpanded] = useState(isActive);
    
    return (
        <motion.div 
            whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(44, 62, 45, 0.05)" }}
            className={`bg-white border-[1.5px] rounded-[20px] overflow-hidden transition-all duration-300 mb-4 group ${
                isExpanded ? "border-primary shadow-[0_10px_30px_-10px_rgba(44,62,45,0.08)]" : "border-border hover:border-primary/30"
            }`}
        >
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between bg-white focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isExpanded ? "bg-primary/10 text-primary" : "bg-background text-text-muted group-hover:text-primary/70"
                    }`}>
                        <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <span className={`font-serif text-lg lg:text-xl ${isExpanded ? "text-primary" : "text-text-primary"}`}>
                        {info.title}
                    </span>
                </div>
                
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                    isActive 
                        ? "bg-primary border-primary text-background" 
                        : "border-border group-hover:border-primary/30"
                }`}>
                    {isActive && <Check size={14} className="lg:w-4 lg:h-4" />}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2">
                            <div className="relative">
                                <div className="absolute top-4 left-4 text-text-muted/40">
                                    <MapPin size={20} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => onChange(e.target.value)}
                                    placeholder={`Enter your ${info.title.toLowerCase()} address`}
                                    className="w-full pl-12 pr-6 py-4 bg-background/50 rounded-2xl border-[1.5px] border-border focus:outline-none focus:border-primary focus:bg-white text-text-primary font-sans text-sm lg:text-base transition-all placeholder:text-text-muted/30"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
