"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/store";
import { ArrowRight, Sparkles, User, Baby, ChevronDown, MapPin, Clock, Check, Loader2, Leaf, Fish, Beef, Scale, Sunrise, Sun, Sunset, Moon, Wheat, Milk, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BodySlider } from "../components/BodySlider";
import type { Goal, DeliveryLocation, DeliveryTimeSlot, SavedLocation } from "@/lib/types";

const GOAL_OPTIONS: { id: Goal; label: string; desc: string }[] = [
    { id: "maintenance", label: "Maintien", desc: "Santé durable" },
    { id: "weight_loss", label: "Perte de Poids", desc: "S'affiner" },
    { id: "muscle_gain", label: "Prise de Muscle", desc: "Énergie & Force" },
    { id: "balance", label: "Manger Sain", desc: "Santé pure" }
];

const ADULT_TAGS: DeliveryLocation[] = ['home', 'office', 'gym', 'campus'];
const CHILD_TAGS: DeliveryLocation[] = ['home', 'school'];
const LOCATION_LABELS: Record<string, string> = {
    home: "Domicile",
    office: "Bureau",
    gym: "Salle de sport",
    campus: "Campus",
    school: "École",
    other: "Autre"
};
const TIME_SLOTS: DeliveryTimeSlot[] = ['07:00', '12:30', '18:00', '21:00'];

const DIET_PREFS = [
    { id: 'none', label: 'Standard', icon: Scale },
    { id: 'pescatarian', label: 'Pescétarien', icon: Fish },
    { id: 'plant_based', label: 'Végétalien', icon: Leaf },
    { id: 'meat_heavy', label: 'Riche en Viande', icon: Beef },
];

const ALLERGIES_LIST = [
    { id: 'gluten', label: 'Gluten', icon: Wheat },
    { id: 'dairy', label: 'Lactose', icon: Milk },
    { id: 'nuts', label: 'Fruits à coque', icon: ShieldAlert },
    { id: 'seafood', label: 'Fruits de mer', icon: Fish },
];

const TIME_SLOT_INFO: Record<string, { label: string, icon: any, desc: string }> = {
    "07:00": { label: "Matin", icon: Sunrise, desc: "07:00 - 09:00" },
    "12:30": { label: "Midi", icon: Sun, desc: "12:00 - 14:00" },
    "18:00": { label: "Soir", icon: Sunset, desc: "17:30 - 19:30" },
    "21:00": { label: "Nuit", icon: Moon, desc: "20:30 - 22:30" },
};

export function FamilyPreferencesPage() {
    const router = useRouter();
    const { members, updateMember } = useFamilyStore();
    
    // Track which accordion is open
    const [openId, setOpenId] = useState<string | null>(members[0]?.id || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = () => {
        setIsLoading(true);
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
        <div className="w-full pb-16">
            <div className="text-center mb-12">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    Étape 05
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
                    Quels sont leurs objectifs ?
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    Personnalisez les besoins nutritionnels et la logistique pour chaque membre.
                </motion.p>
            </div>

            <div className="w-full max-w-2xl mx-auto space-y-6">
                {members.map((member) => {
                    const isOpen = openId === member.id;
                    const availableTags = member.relation === 'child' ? CHILD_TAGS : ADULT_TAGS;
                    const savedLocs = member.savedLocations || [];
                    const isSelf = member.relation === 'self';

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
                                        {member.name} {isSelf ? "(Vous)" : ""}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                                            {member.relation === 'child' ? 'Enfant' : member.relation === 'partner' ? 'Partenaire' : member.relation === 'self' ? 'Moi' : 'Autre'}
                                        </span>
                                        <span className="w-1 h-1 bg-border rounded-full" />
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{savedLocs.length} Lieu(x)</span>
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
                                            
                                            {/* Name and Gender */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Prénom</label>
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => updateMember(member.id, { name: e.target.value })}
                                                        className="w-full bg-white border-[1.5px] border-border focus:border-primary rounded-2xl px-5 py-4 font-serif text-lg text-text-primary transition-all outline-none shadow-sm"
                                                        placeholder="Entrez le nom..."
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Genre</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button 
                                                            onClick={() => updateMember(member.id, { gender: 'female' })}
                                                            className={`py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all border ${member.gender === 'female' ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border"}`}
                                                        >
                                                            {member.relation === 'child' ? "Fille" : "Femme"}
                                                        </button>
                                                        <button 
                                                            onClick={() => updateMember(member.id, { gender: 'male' })}
                                                            className={`py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all border ${member.gender === 'male' ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border"}`}
                                                        >
                                                            {member.relation === 'child' ? "Garçon" : "Homme"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body Metrics */}
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-8">
                                                    <BodySlider 
                                                        label="Âge" 
                                                        unit="ans" 
                                                        min={4} 
                                                        max={member.relation === 'child' ? 15 : 100} 
                                                        value={member.age || 25} 
                                                        onChange={(v) => updateMember(member.id, { age: v })} 
                                                    />
                                                    <BodySlider 
                                                        label="Taille" 
                                                        unit="cm" 
                                                        min={member.relation === 'child' ? 70 : 120} 
                                                        max={member.relation === 'child' ? 190 : 220} 
                                                        value={member.height_cm || (member.relation === 'child' ? 120 : 170)} 
                                                        onChange={(v) => updateMember(member.id, { height_cm: v })} 
                                                    />
                                                    <BodySlider 
                                                        label="Poids" 
                                                        unit="kg" 
                                                        min={15} 
                                                        max={150} 
                                                        value={member.weight_kg || 70} 
                                                        onChange={(v) => updateMember(member.id, { weight_kg: v })} 
                                                    />
                                                </div>
                                            </div>

                                            {/* Dietary Taste & Goal */}
                                            <div className="space-y-8">
                                                {/* Diet Prefs */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Préférence Alimentaire</label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {DIET_PREFS.map(pref => {
                                                            const isSelected = (member.taste_leaning || 'none') === pref.id;
                                                            return (
                                                                <button
                                                                    key={pref.id}
                                                                    onClick={() => updateMember(member.id, { taste_leaning: pref.id as any })}
                                                                    className={`p-4 rounded-2xl border-[1.5px] flex flex-col items-center justify-center gap-3 transition-all ${
                                                                        isSelected 
                                                                            ? "bg-primary/5 border-primary text-primary shadow-[0_4px_12px_rgba(44,62,45,0.08)]" 
                                                                            : "bg-white border-border text-text-muted hover:border-primary/30 hover:bg-background/50"
                                                                    }`}
                                                                >
                                                                    <pref.icon size={24} strokeWidth={1.5} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">{pref.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Allergies */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Allergies & Intolérances</label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {ALLERGIES_LIST.map(allergy => {
                                                            const isSelected = (member.allergies || []).includes(allergy.id);
                                                            return (
                                                                <button
                                                                    key={allergy.id}
                                                                    onClick={() => {
                                                                        const current = member.allergies || [];
                                                                        const next = isSelected 
                                                                            ? current.filter(a => a !== allergy.id)
                                                                            : [...current, allergy.id];
                                                                        updateMember(member.id, { allergies: next });
                                                                    }}
                                                                    className={`px-4 py-3 rounded-xl border-[1.5px] flex items-center gap-2 transition-all ${
                                                                        isSelected 
                                                                            ? "bg-accent/10 border-accent text-accent shadow-sm" 
                                                                            : "bg-white border-border text-text-muted hover:border-accent/30"
                                                                    }`}
                                                                >
                                                                    <allergy.icon size={16} strokeWidth={2} />
                                                                    <span className="text-xs font-bold">{allergy.label}</span>
                                                                    {isSelected && <Check size={14} strokeWidth={3} className="ml-1" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Goal */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Objectif Principal</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {member.relation === 'child' ? (
                                                            <div className="w-full px-6 py-4 rounded-xl border-[1.5px] border-accent/20 bg-accent/5 text-accent font-bold text-xs uppercase tracking-widest flex items-center gap-3">
                                                                <Sparkles size={16} />
                                                                Nutrition Équilibrée (Enfant)
                                                            </div>
                                                        ) : (
                                                            GOAL_OPTIONS.map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => updateMember(member.id, { goal: opt.id })}
                                                                    className={`px-4 py-3 rounded-xl border-[1.5px] text-[10px] font-bold uppercase tracking-widest transition-all ${
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
                                            </div>

                                            {/* Logistics Section */}
                                            <div className="pt-10 border-t border-border space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Lieux de Livraison</label>
                                                    <p className="text-xs text-text-muted px-1">Sélectionnez les points de dépôt pour {member.name.split(' ')[0]}</p>
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
                                                                {LOCATION_LABELS[tag] || tag}
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
                                                                        <h4 className="font-serif text-lg text-text-primary capitalize">Logistique: {LOCATION_LABELS[loc.tag] || loc.tag}</h4>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-6">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Adresse Exacte</label>
                                                                        <input
                                                                            type="text"
                                                                            value={loc.address}
                                                                            onChange={(e) => updateLocationField(member.id, loc.tag, 'address', e.target.value)}
                                                                            placeholder={`ex: Appt 400, Code porte...`}
                                                                            className="w-full bg-background/50 border-[1.5px] border-border focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm text-text-primary outline-none transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                                            <Clock size={14} strokeWidth={2}/> Créneau de Livraison
                                                                        </label>
                                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                            {TIME_SLOTS.map(slot => {
                                                                                const info = TIME_SLOT_INFO[slot];
                                                                                const isSelected = loc.timeSlot === slot;
                                                                                return (
                                                                                    <button
                                                                                        key={slot}
                                                                                        onClick={() => updateLocationField(member.id, loc.tag, 'timeSlot', slot)}
                                                                                        className={`p-3 rounded-xl border-[1.5px] flex flex-col items-center justify-center gap-2 transition-all ${
                                                                                            isSelected
                                                                                                ? "bg-primary border-primary text-white shadow-md"
                                                                                                : "bg-white border-border text-text-muted hover:border-primary/30"
                                                                                        }`}
                                                                                    >
                                                                                        {info && <info.icon size={20} strokeWidth={1.5} className={isSelected ? "text-accent" : ""} />}
                                                                                        <div className="text-center">
                                                                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-white" : "text-text-primary"}`}>{info?.label || slot}</div>
                                                                                            <div className={`text-[9px] ${isSelected ? "text-white/80" : "text-text-muted"}`}>{info?.desc || ""}</div>
                                                                                        </div>
                                                                                    </button>
                                                                                );
                                                                            })}
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
                                                            Veuillez sélectionner au moins un lieu de livraison
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

            <div className="mt-12 w-full max-w-xl mx-auto px-5 sm:px-0 flex flex-col gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isLoading}
                    className="w-full h-14 sm:h-16 rounded-full bg-primary text-white font-sans font-bold flex items-center justify-center gap-3 text-sm sm:text-base shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary/95 transition-all uppercase tracking-[0.15em] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin text-white/70" />
                    ) : (
                        <>
                            <span>Vérifier le profil familial</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>
                <button 
                    onClick={() => router.push("/onboarding/express")}
                    className="w-full py-3 text-text-muted hover:text-primary transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <span>Trop fatigué ? Envoyez une note vocale</span>
                </button>
            </div>
        </div>
    );
}

export default FamilyPreferencesPage;
