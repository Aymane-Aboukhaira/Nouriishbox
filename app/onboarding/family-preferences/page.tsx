"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/store";
import { ArrowRight, Sparkles, User, Baby, ChevronDown, MapPin, Clock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Goal, DeliveryLocation, DeliveryTimeSlot, SavedLocation } from "@/lib/types";

const GOAL_OPTIONS: { id: Goal; label: string; desc: string }[] = [
    { id: "maintenance", label: "Maintain", desc: "Keep healthy" },
    { id: "weight_loss", label: "Lose Weight", desc: "Lean down" },
    { id: "muscle_gain", label: "Build Muscle", desc: "Gain energy" },
    { id: "balance", label: "Eat Cleaner", desc: "Pure health" }
];

const ADULT_TAGS: DeliveryLocation[] = ['home', 'office', 'gym', 'campus'];
const CHILD_TAGS: DeliveryLocation[] = ['home', 'school'];
const TIME_SLOTS: DeliveryTimeSlot[] = ['07:00', '12:30', '18:00', '21:00'];

export function FamilyPreferencesPage() {
    const router = useRouter();
    const { members, updateMember } = useFamilyStore();
    
    // Track which accordion is open
    const [openId, setOpenId] = useState<string | null>(members[0]?.id || null);

    const handleNext = () => {
        router.push("/onboarding/review?mode=family");
    };

    const toggleTag = (memberId: string, tag: DeliveryLocation, currentLocations: SavedLocation[] = []) => {
        const exists = currentLocations.some(loc => loc.tag === tag);
        let newLocations;
        if (exists) {
            newLocations = currentLocations.filter(loc => loc.tag !== tag);
        } else {
            newLocations = [...currentLocations, { tag, address: "", timeSlot: "12:30" as DeliveryTimeSlot }];
        }
        updateMember(memberId, { savedLocations: newLocations });
    };

    const updateLocationField = (memberId: string, tag: DeliveryLocation, field: 'address' | 'timeSlot', value: string) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;
        const newLocations = (member.savedLocations || []).map(loc => 
            loc.tag === tag ? { ...loc, [field]: value } : loc
        );
        updateMember(memberId, { savedLocations: newLocations });
    };

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
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} strokeWidth={1.5} />
                </div>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-4"
                >
                    What are their goals?
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    Personalize logistics and taste for everyone at the table.
                </motion.p>
            </div>

            <div className="w-full max-w-2xl mx-auto space-y-6">
                {members.map((member) => {
                    const isOpen = openId === member.id;
                    const availableTags = member.relation === 'child' ? CHILD_TAGS : ADULT_TAGS;
                    const savedLocs = member.savedLocations || [];

                    return (
                        <div 
                            key={member.id} 
                            className={`bg-white rounded-[24px] border-[1.5px] transition-all duration-300 overflow-hidden group ${
                                isOpen ? "border-primary shadow-[0_20px_50px_-10px_rgba(44,62,45,0.08)]" : "border-border hover:border-primary/20"
                            }`}
                        >
                            {/* Accordion Header */}
                            <button 
                                onClick={() => setOpenId(isOpen ? null : member.id)}
                                className="w-full p-6 lg:p-8 flex items-center gap-6 text-left focus:outline-none"
                            >
                                <div 
                                    className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-background shadow-lg transition-transform group-hover:scale-105" 
                                    style={{ backgroundColor: member.avatar_color }}
                                >
                                    {member.relation === 'child' ? <Baby size={28} strokeWidth={1.5} /> : <User size={28} strokeWidth={1.5} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-serif text-xl lg:text-2xl mb-1 ${isOpen ? "text-primary" : "text-text-primary"}`}>
                                        {member.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{member.relation}</span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{savedLocs.length} Location(s)</span>
                                    </div>
                                </div>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={`p-2 rounded-full transition-colors ${isOpen ? "bg-primary/10 text-primary" : "bg-background text-text-muted"}`}>
                                    <ChevronDown size={20} strokeWidth={2.5} />
                                </motion.div>
                            </button>

                            {/* Accordion Body */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        className="border-t border-border bg-background/30"
                                    >
                                        <div className="p-6 lg:p-8 space-y-10">
                                            
                                            {/* General Info */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Name</label>
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => updateMember(member.id, { name: e.target.value })}
                                                        className="w-full bg-white border-[1.5px] border-border focus:border-primary rounded-2xl px-5 py-4 font-serif text-lg text-text-primary transition-all outline-none shadow-sm"
                                                        placeholder="Enter name..."
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Dietary Taste</label>
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full bg-white border-[1.5px] border-border rounded-2xl px-5 py-4 font-serif text-lg text-text-primary focus:border-primary outline-none cursor-pointer appearance-none shadow-sm"
                                                            value={member.taste_leaning || 'none'}
                                                            onChange={(e) => updateMember(member.id, { taste_leaning: e.target.value as any })}
                                                        >
                                                            <option value="none">Standard Balanced</option>
                                                            <option value="pescatarian">Pescatarian</option>
                                                            <option value="plant_based">Plant-Based</option>
                                                            <option value="meat_heavy">Meat Heavy</option>
                                                        </select>
                                                        <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Goal Section */}
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Primary Goal</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {member.relation === 'child' ? (
                                                        <div className="px-6 py-3 rounded-full border-[1.5px] border-accent/20 bg-accent/5 text-accent font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                                            <Sparkles size={14} />
                                                            Kids Balanced Nutrition
                                                        </div>
                                                    ) : (
                                                        GOAL_OPTIONS.map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => updateMember(member.id, { goal: opt.id })}
                                                                className={`px-6 py-3 rounded-full border-[1.5px] text-xs font-bold uppercase tracking-widest transition-all ${
                                                                    member.goal === opt.id
                                                                        ? "bg-primary border-primary text-background shadow-md"
                                                                        : "bg-white border-border text-text-muted hover:border-primary/30"
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Logistics Section */}
                                            <div className="pt-10 border-t border-border space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Delivery Locations</label>
                                                    <p className="text-xs text-text-muted px-1">Select drop-off locations for {member.name.split(' ')[0]}</p>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    {availableTags.map(tag => {
                                                        const isSelected = savedLocs.some(loc => loc.tag === tag);
                                                        return (
                                                            <button
                                                                key={tag}
                                                                onClick={() => toggleTag(member.id, tag, savedLocs)}
                                                                className={`px-6 py-3 rounded-full border-[1.5px] text-xs font-bold uppercase tracking-widest transition-all ${
                                                                    isSelected
                                                                        ? "bg-accent border-accent text-background shadow-md"
                                                                        : "bg-white border-border text-text-muted hover:border-accent/30"
                                                                }`}
                                                            >
                                                                {tag}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Selected Tag Subforms */}
                                                <div className="grid grid-cols-1 gap-4">
                                                    <AnimatePresence initial={false}>
                                                        {savedLocs.map(loc => (
                                                            <motion.div
                                                                key={loc.tag}
                                                                initial={{ scale: 0.95, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.95, opacity: 0 }}
                                                                className="bg-white rounded-2xl p-6 border-[1.5px] border-border shadow-sm"
                                                            >
                                                                <div className="flex items-center justify-between mb-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                                                                            <MapPin size={20} strokeWidth={1.5} />
                                                                        </div>
                                                                        <h4 className="font-serif text-lg text-text-primary capitalize">{loc.tag} Logistics</h4>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-6">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Exact Address</label>
                                                                        <input
                                                                            type="text"
                                                                            value={loc.address}
                                                                            onChange={(e) => updateLocationField(member.id, loc.tag, 'address', e.target.value)}
                                                                            placeholder={`e.g., Suite 400 or Door Code...`}
                                                                            className="w-full bg-background/50 border-[1.5px] border-border focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm text-text-primary outline-none transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                                            <Clock size={12} strokeWidth={2}/> Target Delivery Time
                                                                        </label>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {TIME_SLOTS.map(slot => (
                                                                                <button
                                                                                    key={slot}
                                                                                    onClick={() => updateLocationField(member.id, loc.tag, 'timeSlot', slot)}
                                                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all border ${
                                                                                        loc.timeSlot === slot
                                                                                            ? "bg-primary border-primary text-background shadow-md"
                                                                                            : "bg-white border-border text-text-muted hover:border-primary/20"
                                                                                    }`}
                                                                                >
                                                                                    {slot}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    
                                                    {savedLocs.length === 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-xs text-accent font-bold uppercase tracking-widest text-center py-4 px-6 bg-accent/5 rounded-2xl border border-dashed border-accent/30"
                                                        >
                                                            Please select at least one delivery location
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-6 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="w-full h-16 rounded-full bg-primary text-background font-sans font-bold flex items-center justify-center gap-3 text-lg shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90 transition-all uppercase tracking-widest"
                    >
                        <span>Review Family Profile</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

export default FamilyPreferencesPage;
