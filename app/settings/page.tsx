"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
    Pencil, AlertCircle, Check, Zap, SkipForward, PauseCircle, 
    ArrowLeftRight, Download, Shield, LogOut, HeartHandshake, X, Flame
} from "lucide-react";
import { 
    useAuthStore, useProfileStore, useSubscriptionStore, usePointsStore 
} from "@/lib/store";
import type { SubscriptionPlan } from "@/lib/types";

// ============================================================================
// SCHEMAS & UTILS
// ============================================================================

const profileSchema = z.object({
    name: z.string().min(2, "Nom trop court"),
    email: z.string().email("Format d'email invalide"),
    phone: z.string().min(8, "Numéro de téléphone trop court"),
    address: z.string().min(10, "Veuillez fournir une adresse complète"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const ALLERGEN_OPTIONS = ["Gluten", "Produits laitiers", "Noix", "Œufs", "Crustacés", "Soja", "Poisson", "Sésame"];

const HUMAN_ACTIVITY: Record<string, string> = {
    sedentary: "Sédentaire",
    light: "Léger",
    moderate: "Modéré",
    active: "Très actif",
    very_active: "Extrêmement actif",
};

const HUMAN_GOAL: Record<string, string> = {
    weight_loss: "Perdre du poids",
    maintenance: "Maintenir",
    muscle_gain: "Prendre du muscle",
    eat_cleaner: "Manger plus sainement"
};

function calculateMacros(weight: number, height: number, age: number, gender: string, activity: string, goal: string) {
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === "male" ? 5 : -161;
    const actMap: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * (actMap[activity] || 1.2);
    let target = tdee;
    if (goal === "weight_loss") target -= 500;
    else if (goal === "muscle_gain") target += 300;
    return {
        kcal: Math.round(target),
        protein_g: Math.round((target * 0.3) / 4),
        carbs_g: Math.round((target * 0.45) / 4),
        fats_g: Math.round((target * 0.25) / 9),
    };
}

// ============================================================================
// MAIN SETTINGS COMPONENT
// ============================================================================

export default function SettingsPage() {
    const [hasMounted, setHasMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "subscription" | "preferences" | "taste">("profile");

    useEffect(() => setHasMounted(true), []);

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen pb-32">
            <div className="max-w-3xl mx-auto w-full pt-8 px-6 md:px-8">
                <h1 className="font-serif text-4xl text-[#2D2D2D] mb-8">Paramètres</h1>

                {/* Tabs */}
                <LayoutGroup>
                    <div className="flex gap-6 border-b border-[#F0E4D8] mb-8 relative hide-scrollbar overflow-x-auto">
                        {(["profile", "subscription", "preferences", "taste"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold capitalize transition-colors relative whitespace-nowrap ${
                                    activeTab === tab ? "text-[#2D2D2D]" : "text-[#9C9C9C] hover:text-[#6B6B6B]"
                                }`}
                            >
                                {tab === 'taste' ? 'Profil gustatif' : tab === 'profile' ? 'Profil' : tab === 'subscription' ? 'Abonnement' : 'Préférences'}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="settings-tab-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6BC4A0]"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </LayoutGroup>

                {/* Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {activeTab === "profile" && <ProfileTab key="profile" />}
                        {activeTab === "subscription" && <SubscriptionTab key="subscription" />}
                        {activeTab === "preferences" && <PreferencesTab key="preferences" />}
                        {activeTab === "taste" && <TasteProfileTab key="taste" />}
                    </AnimatePresence>
                </div>
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}

// ============================================================================
// TAB 1: PROFILE
// ============================================================================
function ProfileTab() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            className="flex flex-col gap-8"
        >
            <PersonalInfoCard />
            <NutritionProfileCard />
            <AllergensCard />
        </motion.div>
    );
}

function PersonalInfoCard() {
    const { user, updateUser } = useAuthStore();
    const { profile } = useProfileStore();
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || profile.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: user?.address || "",
        }
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateUser(data);
        setIsEditing(false);
        toast.success("Profil mis à jour ✓");
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl text-[#2D2D2D]">Informations personnelles</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F1EFE8] text-[#5F5E5A] hover:bg-[#E8E0D8] transition-colors">
                        <Pencil size={18} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Nom complet" field="name" register={register} isEditing={isEditing} error={errors.name} />
                    <Field label="Numéro de téléphone" field="phone" placeholder="+212 6XX XXX XXX" register={register} isEditing={isEditing} error={errors.phone} />
                    <div className="md:col-span-2">
                        <Field label="Email" field="email" register={register} isEditing={isEditing} error={errors.email} note="Utilisé pour les confirmations de livraison" />
                    </div>
                    <div className="md:col-span-2">
                        <Field label="Adresse de livraison" field="address" placeholder="Rue, quartier, Casablanca" register={register} isEditing={isEditing} error={errors.address} />
                    </div>
                </div>

                {isEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-3 pt-4 border-t border-[#F0E4D8]">
                        <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-full border border-[#D4C9BE] text-[#6B6B6B] font-bold text-sm hover:bg-[#F9F6F0]">Annuler</button>
                        <button type="submit" className="px-6 py-2.5 rounded-full bg-[#6BC4A0] text-white font-bold text-sm hover:bg-[#5BB48F] flex items-center gap-2">
                            <Check size={16} /> Enregistrer les modifications
                        </button>
                    </motion.div>
                )}
            </form>
        </div>
    );
}

function Field({ label, field, placeholder, register, isEditing, error, note }: any) {
    const value = register(field).value;
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#9C9C9C]">{label}</label>
            {isEditing ? (
                <input 
                    {...register(field)} 
                    placeholder={placeholder}
                    className={`w-full bg-[#FFF8F4] px-4 py-3 rounded-xl border outline-none text-sm font-semibold text-[#2D2D2D] transition-colors ${error ? 'border-[#FFA07A] focus:border-[#FFA07A]' : 'border-[#F0E4D8] focus:border-[#6BC4A0]'}`} 
                />
            ) : (
                <p className="text-base text-[#2D2D2D] font-semibold h-11 flex items-center border-b border-transparent">{value || "—"}</p>
            )}
            {note && !error && <p className="text-[10px] text-[#9C9C9C] mt-1">{note}</p>}
            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs text-[#FFA07A] font-bold flex items-center gap-1 mt-1">
                        <AlertCircle size={12} /> {error.message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

function NutritionProfileCard() {
    const { profile, updateMacros, setTargets } = useProfileStore();
    const [isRecalculating, setIsRecalculating] = useState(false);

    // Temp form state
    const [weight, setWeight] = useState(profile.weight_kg || 70);
    const [goal, setGoal] = useState(profile.goal || "maintenance");
    const [activity, setActivity] = useState(profile.activity_level || "moderate");

    const t = profile.targets || { kcal: 2000, protein_g: 150, carbs_g: 200, fats_g: 65 };
    const [displayMacros, setDisplayMacros] = useState(t);

    const handleRecalculate = () => {
        const newTargets = calculateMacros(weight, profile.height_cm || 170, profile.age || 30, profile.gender || "male", activity, goal);
        
        updateMacros({ weight_kg: weight, goal: goal, activity_level: activity });
        setTargets(newTargets);
        
        // Count up animation
        const steps = 20;
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            setDisplayMacros({
                kcal: Math.round(t.kcal + ((newTargets.kcal - t.kcal) * (currentStep/steps))),
                protein_g: Math.round(t.protein_g + ((newTargets.protein_g - t.protein_g) * (currentStep/steps))),
                carbs_g: Math.round(t.carbs_g + ((newTargets.carbs_g - t.carbs_g) * (currentStep/steps))),
                fats_g: Math.round(t.fats_g + ((newTargets.fats_g - t.fats_g) * (currentStep/steps))),
            });
            if (currentStep >= steps) {
                clearInterval(interval);
                setDisplayMacros(newTargets);
            }
        }, 30);

        toast.success("Macros recalculées ✓ — votre plan reflétera les nouveaux objectifs");
        setIsRecalculating(false);
    };

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
            <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Votre profil nutritionnel</h2>
            <p className="text-sm text-[#9C9C9C] mb-8">Recalculé à partir de vos données d'intégration. Mettez à jour vos statistiques pour garder des macros précis.</p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                <StatPill label="Âge" val={`${profile.age || 30} ans`} />
                <StatPill label="Genre" val={profile.gender === "male" ? "Homme" : "Femme"} />
                <StatPill label="Poids" val={`${profile.weight_kg || 70} kg`} />
                <StatPill label="Taille" val={`${profile.height_cm || 170} cm`} />
                <StatPill label="Activité" val={HUMAN_ACTIVITY[profile.activity_level] || "Modéré"} />
                <StatPill label="Objectif" val={HUMAN_GOAL[profile.goal] || "Maintenir"} />
            </div>

            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
                <MacroPill color="#F59E0B" bg="#FAEEDA" label="Calories" val={displayMacros.kcal} />
                <MacroPill color="#B09AE0" bg="#F3EEFA" label="Protéines" val={`${displayMacros.protein_g}g`} />
                <MacroPill color="#6BC4A0" bg="#E1F5EE" label="Glucides" val={`${displayMacros.carbs_g}g`} />
                <MacroPill color="#FFA07A" bg="#FFF0EA" label="Lipides" val={`${displayMacros.fats_g}g`} />
            </div>

            {!isRecalculating ? (
                <button onClick={() => setIsRecalculating(true)} className="px-6 py-2.5 rounded-full border-2 border-[#6BC4A0] text-[#6BC4A0] font-bold text-sm hover:bg-[#F1FAF4] transition-colors">
                    Mettre à jour mes stats
                </button>
            ) : (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden border-t border-[#F0E4D8] pt-6 mt-2 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-[#9C9C9C] block mb-2">Poids (kg)</label>
                        <input type="number" min="30" max="300" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-24 bg-[#FFF8F4] px-4 py-3 rounded-xl border border-[#F0E4D8] outline-none text-base font-bold text-[#2D2D2D] focus:border-[#6BC4A0]" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#9C9C9C] block mb-2">Objectif</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(HUMAN_GOAL).map(([k, v]) => (
                                <button key={k} onClick={() => setGoal(k as "weight_loss" | "maintenance" | "muscle_gain" | "balance")} className={`py-3 rounded-xl text-sm font-bold transition-all ${goal === k ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#D4C9BE]'}`}>{v}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#9C9C9C] block mb-2">Niveau d'activité</label>
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                            {["sedentary", "light", "moderate", "active"].map((k) => (
                                <button key={k} onClick={() => setActivity(k as "sedentary" | "light" | "moderate" | "active" | "very_active")} className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${activity === k ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#D4C9BE]'}`}>{HUMAN_ACTIVITY[k]}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[#F0E4D8]">
                        <button onClick={() => setIsRecalculating(false)} className="px-6 py-2.5 rounded-full border border-[#D4C9BE] text-[#6B6B6B] font-bold text-sm hover:bg-[#F9F6F0]">Annuler</button>
                        <button onClick={handleRecalculate} className="px-6 py-2.5 rounded-full bg-[#6BC4A0] text-white font-bold text-sm hover:bg-[#5BB48F] flex items-center gap-2 shadow-[0_4px_16px_rgba(107,196,160,0.3)]">
                            <Zap size={16} fill="white" /> Recalculer mes macros
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function StatPill({ label, val }: { label: string, val: string }) {
    return (
        <div className="bg-[#FFF8F4] p-3 rounded-2xl">
            <p className="text-[10px] font-bold text-[#9C9C9C] capitalize tracking-wider mb-1">{label}</p>
            <p className="text-sm font-bold text-[#2D2D2D]">{val}</p>
        </div>
    );
}

function MacroPill({ color, bg, label, val }: any) {
    return (
        <div className="flex-1 min-w-[100px] rounded-2xl p-4 flex flex-col items-center justify-center border border-white" style={{ background: bg }}>
            <span className="text-xl font-bold mb-1" style={{ color }}>{val}</span>
            <span className="text-[11px] font-black capitalize tracking-wider" style={{ color }}>{label}</span>
        </div>
    );
}

function AllergensCard() {
    const { profile, setAllergens } = useProfileStore();
    const [localAllergens, setLocalAllergens] = useState<string[]>(profile.allergens || []);
    const mutated = useRef(false);

    const toggle = (a: string) => {
        const next = localAllergens.includes(a) ? localAllergens.filter(x => x !== a) : [...localAllergens, a];
        setLocalAllergens(next);
        setAllergens(next);
        if (!mutated.current) {
            toast.success("Préférences d'allergènes enregistrées");
            mutated.current = true;
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
            <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Alertes d'allergènes</h2>
            <p className="text-sm text-[#9C9C9C] mb-6">Nous signalerons les repas contenant ces allergènes dans le menu.</p>
            <div className="flex flex-wrap gap-3">
                {ALLERGEN_OPTIONS.map(a => {
                    const active = localAllergens.includes(a.toLowerCase());
                    return (
                        <button 
                            key={a}
                            onClick={() => toggle(a.toLowerCase())}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 flex items-center gap-1.5 ${active ? 'bg-[#FFF0EA] text-[#C44B00] border-[#FFA07A] shadow-[0_4px_12px_rgba(255,160,122,0.15)]' : 'bg-[#FFF8F4] text-[#9C9C9C] border-transparent hover:border-[#F0E4D8]'}`}
                        >
                            {active && <Check size={12} strokeWidth={3} />} {a}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}

// ============================================================================
// TAB 2: SUBSCRIPTION
// ============================================================================

function SubscriptionTab() {
    const { subscription } = useSubscriptionStore();
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
            <CurrentPlanCard />
            <SubscriptionActions />
            {((subscription as any).status === 'active' || (subscription as any).status === 'paused') && (
                <>
                    <hr className="my-6 border-[#F0E4D8]" />
                    <CancelFlow />
                </>
            )}
        </motion.div>
    );
}

function CurrentPlanCard() {
    const { subscription } = useSubscriptionStore();
    const { points } = usePointsStore();
    const sub: any = subscription;

    let badge = "";
    if (sub.status === 'active') badge = "bg-[#E1F5EE] text-[#085041] border-[#6BC4A0]";
    else if (sub.status === 'paused') badge = "bg-[#FAEEDA] text-[#633806] border-[#F59E0B]";
    else badge = "bg-[#F1EFE8] text-[#5F5E5A] border-[#D4C9BE]";

    const startFormatted = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(sub.starts_at));

    // Next delivery
    const nextD = new Date();
    nextD.setDate(nextD.getDate() + 7 - nextD.getDay() + 1); // rough next Monday
    const isTomorrow = false; // Add real logic if needed

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#6BC4A0]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(107,196,160,0.1),transparent)] pointer-events-none" />
            
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="font-serif text-4xl text-[#2D2D2D] mb-3 capitalize">Boîte {sub.plan}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge} capitalize`}>{sub.status === 'active' ? 'Actif' : sub.status === 'paused' ? 'En pause' : 'Annulé'}</span>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-[#2D2D2D]">{sub.price_mad} <span className="text-xs text-[#9C9C9C] font-semibold">MAD / sem</span></p>
                    <p className="font-mono text-[10px] text-[#9C9C9C] mt-1">ID: #NB-49281</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                <div className="px-4 py-2 bg-[#FFF8F4] rounded-xl flex items-center gap-2">
                    <HeartHandshake size={16} className="text-[#B09AE0]" />
                    <span className="text-xs font-bold text-[#6B6B6B]">Membre depuis {startFormatted}</span>
                </div>
                <div className="px-4 py-2 bg-[#FFF8F4] rounded-xl flex items-center gap-2">
                    <span className="text-gold">⭐</span>
                    <span className="text-xs font-bold text-[#6B6B6B]">{points.balance} NourishPoints</span>
                </div>
            </div>

            {sub.status === 'active' && (
                <div className={`p-4 rounded-2xl flex items-center justify-between ${isTomorrow ? 'bg-[#FAEEDA] border border-[#F59E0B]/30' : 'bg-[#F1FAF4] border border-[#A8E6CF]'}`}>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#2F8B60]">Prochaine livraison</span>
                        <span className="text-sm font-semibold text-[#166534]">Lundi {nextD.getDate()} {nextD.toLocaleString('fr-FR', { month: 'short' })} · 7h–12h</span>
                    </div>
                    {isTomorrow && <span className="px-2 py-1 bg-[#F59E0B] text-white text-[10px] font-bold rounded-2xl rounded-br-none">Demain</span>}
                </div>
            )}
        </div>
    );
}

function SubscriptionActions() {
    const { skipWeek, pauseSubscription, setSubscription } = useSubscriptionStore();
    const [openAction, setOpenAction] = useState<string | null>(null);

    const toggle = (id: string) => setOpenAction(prev => prev === id ? null : id);

    return (
        <div className="space-y-4">
            {/* Skip Week */}
            <ActionRow 
                icon={<SkipForward className="text-[#6BC4A0]" size={20} />}
                title="Sauter la semaine prochaine" desc="Votre prochaine boîte ne sera pas préparée. Aucun frais. Limite: Jeu minuit."
                btnLabel="Sauter →" color="#6BC4A0"
                isOpen={openAction === "skip"} onToggle={() => toggle("skip")}
            >
                <div className="flex items-center justify-between p-4 bg-[#F1FAF4] rounded-2xl border border-[#A8E6CF]">
                    <span className="text-sm font-semibold text-[#166534]">Êtes-vous sûr de vouloir sauter ?</span>
                    <div className="flex gap-2">
                        <button onClick={() => toggle("skip")} className="px-4 py-2 rounded-full border border-[#6BC4A0] text-[#2F8B60] text-xs font-bold">Garder ma boîte</button>
                        <button onClick={() => { skipWeek(); toast.success("Semaine prochaine sautée — aucun frais. À dans deux semaines."); toggle("skip"); }} className="px-4 py-2 rounded-full bg-[#6BC4A0] text-white text-xs font-bold">Confirmer</button>
                    </div>
                </div>
            </ActionRow>

            {/* Pause */}
            <ActionRow 
                icon={<PauseCircle className="text-[#F59E0B]" size={20} />}
                title="Mettre en pause" desc="Pause pour 1, 2, ou 3 semaines. Se réactive automatiquement."
                btnLabel="Pause →" color="#F59E0B"
                isOpen={openAction === "pause"} onToggle={() => toggle("pause")}
            >
                <PauseSelector onConfirm={(w) => { pauseSubscription(w); toast.success(`En pause pour ${w} semaines.`); toggle("pause"); }} onCancel={() => toggle("pause")} />
            </ActionRow>

            {/* Change Plan */}
            <ActionRow 
                icon={<ArrowLeftRight className="text-[#B09AE0]" size={20} />}
                title="Changer de forfait" desc="Passez entre Solo, Couple, et Famille. Effectif la semaine prochaine."
                btnLabel="Changer →" color="#B09AE0"
                isOpen={openAction === "plan"} onToggle={() => toggle("plan")}
            >
                <PlanSelector onConfirm={(p) => { (setSubscription as any)({ plan: p }); toast.success(`Forfait mis à jour en ${p}.`); toggle("plan"); }} onCancel={() => toggle("plan")} />
            </ActionRow>
        </div>
    );
}

function ActionRow({ icon, title, desc, btnLabel, color, isOpen, onToggle, children }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0E4D8] overflow-hidden">
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF8F4]">{icon}</div>
                    <div>
                        <h4 className="font-bold text-[#2D2D2D]">{title}</h4>
                        <p className="text-xs text-[#9C9C9C]">{desc}</p>
                    </div>
                </div>
                {!isOpen && (
                    <button onClick={onToggle} className="px-5 py-2 rounded-full border-2 text-sm font-bold transition-all hover:bg-opacity-10" style={{ borderColor: color, color: color }}>
                        {btnLabel}
                    </button>
                )}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 pt-0 overflow-hidden">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PauseSelector({ onConfirm, onCancel }: { onConfirm: (w: number) => void, onCancel: () => void }) {
    const [weeks, setWeeks] = useState(1);
    return (
        <div className="bg-[#FFF8F4] p-4 rounded-2xl border border-[#F0E4D8]">
            <p className="text-sm font-semibold text-[#6B6B6B] mb-3">Combien de semaines voulez-vous mettre en pause ?</p>
            <div className="flex gap-2 mb-4">
                {[1, 2, 3].map(w => (
                    <button key={w} onClick={() => setWeeks(w)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${weeks === w ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]' : 'bg-white text-[#6B6B6B] border-[#D4C9BE]'}`}>{w} semaine{w>1&&'s'}</button>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3">
                <button onClick={onCancel} className="text-xs font-bold text-[#9C9C9C] hover:text-[#6B6B6B] rounded-full">Annuler</button>
                <button onClick={() => onConfirm(weeks)} className="px-5 py-2.5 rounded-full bg-[#6BC4A0] text-white font-bold text-xs">Confirmer la pause</button>
            </div>
        </div>
    );
}

function PlanSelector({ onConfirm, onCancel }: { onConfirm: (p: string) => void, onCancel: () => void }) {
    const [plan, setP] = useState("solo");
    return (
        <div className="bg-[#FFF8F4] p-4 rounded-2xl border border-[#F0E4D8]">
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                    { id: 'solo', name: 'Solo', price: 320 },
                    { id: 'couple', name: 'Couple', price: 590 },
                    { id: 'family', name: 'Famille', price: 890 },
                ].map(p => (
                    <button key={p.id} onClick={() => setP(p.id)} className={`p-3 rounded-2xl border-2 flex flex-col items-center bg-white transition-all ${plan === p.id ? 'border-[#6BC4A0] shadow-md' : 'border-[#F0E4D8]'}`}>
                        <span className="font-serif text-lg text-[#2D2D2D]">{p.name}</span>
                        <span className="text-xs text-[#9C9C9C] font-semibold">{p.price} MAD</span>
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3">
                <button onClick={onCancel} className="text-xs font-bold text-[#9C9C9C] hover:text-[#6B6B6B] rounded-full">Annuler</button>
                <button onClick={() => onConfirm(plan)} className="px-5 py-2.5 rounded-full bg-[#B09AE0] text-white font-bold text-xs">Confirmer</button>
            </div>
        </div>
    );
}

// ============================================================================
// CANCEL RETENTION FLOW
// ============================================================================

const CANCEL_REASONS = [
    { id: "expensive", label: "Trop cher" },
    { id: "not_eating", label: "Je ne mange pas les repas" },
    { id: "holiday", label: "Je pars en vacances" },
    { id: "health", label: "Raisons de santé" },
    { id: "cooking", label: "Je préfère cuisiner à la maison" },
    { id: "other", label: "Autre" },
];

function CancelFlow() {
    const { pauseSubscription, cancelSubscription } = useSubscriptionStore();
    const { points } = usePointsStore();
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [reason, setReason] = useState("");

    // Reset when unmounted/tab changes occurs intrinsically if state lives here inside AnimatePresence context above.

    const handleOfferAccept = () => {
        if (reason === "expensive") toast.success("Remise appliquée — vous économisez 48 MAD/sem");
        else if (reason === "not_eating") toast.success("Demande envoyée — nous vous contacterons sous 24h");
        else if (reason === "holiday") { pauseSubscription(3); toast.success("En pause pour 3 semaines"); }
        else if (reason === "health") { pauseSubscription(4); toast.success("En pause. Notre équipe vous contactera."); }
        else if (reason === "cooking") toast.success("Votre plan PDF vous sera envoyé par email");
        else toast.success("Merci pour vos retours");
        setStep(0);
    };

    const handleFinalCancel = () => {
        cancelSubscription();
        toast.success("Abonnement annulé. Nous espérons vous revoir bientôt.");
        setStep(0);
    }

    if (step === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[#D4C9BE] p-6 text-center">
                <h3 className="font-serif text-lg text-[#9C9C9C] mb-1">Vous pensez nous quitter ?</h3>
                <p className="text-sm text-[#9C9C9C] mb-4">Nous aimerions comprendre pourquoi. La plupart des membres qui font une pause reviennent dans les 3 semaines.</p>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-[#9C9C9C] underline hover:text-[#FFA07A] transition-colors">Annuler l'abonnement</button>
            </div>
        );
    }

    const slide = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

    return (
        <div className="rounded-2xl border border-[#F0E4D8] shadow-sm bg-white overflow-hidden p-6 relative min-h-[300px]">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="1" {...slide} className="flex flex-col h-full">
                        <h2 className="font-serif text-3xl text-[#2D2D2D] mb-1">Nous sommes tristes de vous voir partir</h2>
                        <p className="text-sm text-[#9C9C9C] mb-6">Avant de partir, dites-nous pourquoi — cela prend 5 secondes et nous aide à nous améliorer.</p>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {CANCEL_REASONS.map(r => (
                                <button key={r.id} onClick={() => setReason(r.id)} className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${reason === r.id ? 'bg-[#F1FAF4] border-[#6BC4A0] text-[#166534]' : 'bg-[#FFF8F4] border-transparent text-[#6B6B6B] hover:border-[#D4C9BE]'}`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                            <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-full border border-[#D4C9BE] text-[#6B6B6B] text-sm font-bold">Garder mon abonnement</button>
                            <button disabled={!reason} onClick={() => setStep(reason === "other" ? 3 : 2)} className="px-6 py-2.5 rounded-full bg-[#6BC4A0] text-white text-sm font-bold disabled:opacity-50 transition-all shadow-md">Suivant →</button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="2" {...slide} className="flex flex-col h-full items-center justify-center text-center">
                        {reason === "expensive" && <Offer heading="Et si on trouvait une solution ?" color="#F59E0B" body="Passez à la facturation hebdomadaire et économisez 15% — soit 272 MAD/sem au lieu de 320." cta="Changer et économiser" onAccept={handleOfferAccept} />}
                        {reason === "not_eating" && <Offer heading="Laissez-nous corriger ça" color="#B09AE0" body="Réservez un appel gratuit de 10 min avec notre nutritionniste pour réaménager votre plan autour de repas que vous aimez." cta="Réserver un appel" onAccept={handleOfferAccept} />}
                        {reason === "holiday" && <Offer heading="Mettez en pause plutôt que d'annuler" color="#6BC4A0" body="Mettez en pause jusqu'à 3 semaines — votre plan reprend automatiquement à votre retour. Aucune action requise." cta="Pause de 3 semaines" onAccept={handleOfferAccept} />}
                        {reason === "health" && <Offer heading="Votre santé avant tout" color="#FFA07A" body="Nous pouvons suspendre votre plan et vous mettre en contact avec notre équipe de nutrition pour le rebâtir quand vous serez prêt." cta="Soutien et pause" onAccept={handleOfferAccept} />}
                        {reason === "cooking" && <Offer heading="Emmenez-nous avec vous" color="#F59E0B" body="Téléchargez vos objectifs macros personnalisés et vos modèles de repas — gratuits, pour vous." cta="Télécharger mon plan" onAccept={handleOfferAccept} />}
                        
                        <button onClick={() => setStep(3)} className="mt-8 text-xs font-bold text-[#9C9C9C] hover:text-[#6B6B6B]">Non merci, continuer l'annulation →</button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="3" {...slide} className="flex flex-col h-full">
                        <h2 className="font-serif text-3xl text-[#2D2D2D] mb-1">Annuler l'abonnement</h2>
                        <p className="text-sm text-[#9C9C9C] mb-8">Votre abonnement restera actif jusqu'à la fin de la semaine en cours. Ensuite, aucun frais supplémentaire.</p>
                        
                        <div className="space-y-4 mb-8">
                            <LossRow text="Votre plan macro personnalisé" />
                            <LossRow text={`Suivi macro hebdomadaire et série de victoires (${points.streak || 0} jours)`} />
                            <LossRow text={`${points.balance} NourishPoints — non transférables`} />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
                            <button onClick={() => setStep(0)} className="w-full md:w-auto px-6 py-3 rounded-full bg-[#6BC4A0] text-white text-sm font-bold shadow-md">Garder mon abonnement</button>
                            <button onClick={handleFinalCancel} className="w-full md:w-auto px-6 py-3 rounded-full bg-[#FFA07A] text-white text-sm font-bold">Oui, annuler mon abonnement</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Offer({ heading, color, body, cta, onAccept }: any) {
    return (
        <div className="w-full max-w-sm">
            <h3 className="font-serif text-3xl text-[#2D2D2D] mb-6">{heading}</h3>
            <div className="p-6 rounded-[20px] bg-white border-2 mb-6 shadow-[0_12px_40px_rgba(45,45,45,0.06)]" style={{ borderColor: color }}>
                <p className="text-[#2D2D2D] font-semibold text-sm leading-relaxed">{body}</p>
            </div>
            <button onClick={onAccept} className="w-full py-3 rounded-full text-white font-bold text-sm shadow-md" style={{ backgroundColor: color }}>{cta}</button>
        </div>
    )
}

function LossRow({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#FFF0EA] flex items-center justify-center flex-shrink-0"><X size={12} className="text-[#FFA07A]" strokeWidth={3} /></div>
            <span className="text-sm font-semibold text-[#6B6B6B]">{text}</span>
        </div>
    )
}

// ============================================================================
// TAB 3: PREFERENCES
// ============================================================================

function PreferencesTab() {
    const { profile, setNotificationPref, setDisplayPref } = useProfileStore();
    const { signOut } = useAuthStore();
    const router = useRouter();

    const handleLogOut = () => {
        signOut();
        router.push('/');
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex flex-col gap-8">
            {/* Notifications */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Notifications</h2>
                <div className="space-y-0 divide-y divide-[#F0E4D8]">
                    <ToggleRow label="Rappel de plan hebdomadaire" desc="Rappelez-moi jeudi de confirmer mon plan" active={profile.notifications?.plan_reminder} onToggle={() => setNotificationPref('plan_reminder', !profile.notifications?.plan_reminder)} />
                    <ToggleRow label="Mises à jour de livraison" desc="Suivez ma boîte de la cuisine à la porte" active={profile.notifications?.delivery_updates} onToggle={() => setNotificationPref('delivery_updates', !profile.notifications?.delivery_updates)} />
                    <ToggleRow label="Vérifications des macros" desc="Rappel si je n'ai rien noté à 14h" active={profile.notifications?.macro_checkin} onToggle={() => setNotificationPref('macro_checkin', !profile.notifications?.macro_checkin)} />
                    <ToggleRow label="Alertes de constance" desc="M'avertir si ma série est en danger" active={profile.notifications?.streak_alerts} onToggle={() => setNotificationPref('streak_alerts', !profile.notifications?.streak_alerts)} />
                    <ToggleRow label="Nouveaux repas" desc="M'informer des repas saisonniers ajoutés" active={profile.notifications?.new_meals} onToggle={() => setNotificationPref('new_meals', !profile.notifications?.new_meals)} />
                </div>
            </div>

            {/* Display */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Affichage</h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2D2D2D]">Unités macros</span>
                        <div className="flex bg-[#FFF8F4] p-1 rounded-xl border border-[#F0E4D8]">
                            <button onClick={() => setDisplayPref('macroDisplayUnit', 'grams')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.macroDisplayUnit === 'grams' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Grammes</button>
                            <button onClick={() => setDisplayPref('macroDisplayUnit', 'percent')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.macroDisplayUnit === 'percent' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Pourcentages</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2D2D2D]">Début de semaine</span>
                        <div className="flex bg-[#FFF8F4] p-1 rounded-xl border border-[#F0E4D8]">
                            <button onClick={() => setDisplayPref('weekStartDay', 'monday')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.weekStartDay === 'monday' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Lundi</button>
                            <button onClick={() => setDisplayPref('weekStartDay', 'sunday')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.weekStartDay === 'sunday' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Dimanche</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Compte</h2>
                <div className="space-y-0 divide-y divide-[#F0E4D8]">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Download size={18} className="text-[#2D2D2D]" />
                            <span className="text-sm font-bold text-[#2D2D2D]">Exporter mes données</span>
                        </div>
                        <button onClick={() => toast.success("L'export de vos données vous sera envoyé par email d'ici 24h.")} className="px-4 py-1.5 rounded-full border border-[#D4C9BE] text-xs font-bold text-[#6B6B6B] hover:bg-[#FFF8F4]">Exporter →</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Shield size={18} className="text-[#2D2D2D]" />
                            <span className="text-sm font-bold text-[#2D2D2D]">Paramètres de confidentialité</span>
                        </div>
                        <button onClick={() => toast.info("Les paramètres de confidentialité seront bientôt disponibles.")} className="px-4 py-1.5 rounded-full border border-[#D4C9BE] text-xs font-bold text-[#6B6B6B] hover:bg-[#FFF8F4]">Gérer →</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <LogOut size={18} className="text-[#FFA07A]" />
                            <span className="text-sm font-bold text-[#FFA07A]">Se déconnecter</span>
                        </div>
                        <button onClick={handleLogOut} className="px-4 py-1.5 rounded-full border border-[#FFA07A] text-xs font-bold text-[#FFA07A] hover:bg-[#FFF0EA]">Se déconnecter</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ToggleRow({ label, desc, active, onToggle }: any) {
    const isFirstToast = useRef(false);
    
    const click = () => {
        onToggle();
        if (!isFirstToast.current) {
            toast('Préférence enregistrée');
            isFirstToast.current = true;
        }
    }

    return (
        <div className="flex items-center justify-between py-4">
            <div>
                <p className="text-sm font-bold text-[#2D2D2D]">{label}</p>
                <p className="text-[11px] text-[#9C9C9C]">{desc}</p>
            </div>
            <button 
                onClick={click}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative flex items-center ${active ? 'bg-[#6BC4A0]' : 'bg-[#D4C9BE]'}`}
            >
                <motion.div 
                    animate={{ x: active ? 20 : 0 }} 
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm" 
                />
            </button>
        </div>
    )
}

// ============================================================================
// TAB 4: TASTE PROFILE
// ============================================================================

const DISLIKE_OPTIONS = [
    { id: "cilantro", label: "Coriandre", emoji: "🌿" },
    { id: "eggplant", label: "Aubergine", emoji: "🍆" },
    { id: "mushrooms", label: "Champignons", emoji: "🍄" },
    { id: "olives", label: "Olives", emoji: "🫒" },
    { id: "seafood", label: "Fruits de mer", emoji: "🦐" },
    { id: "bell peppers", label: "Poivrons", emoji: "🫑" },
    { id: "dairy", label: "Produits laitiers", emoji: "🧀" },
];

const SPICE_OPTIONS: { value: 'none' | 'medium' | 'high'; label: string }[] = [
    { value: 'none', label: 'Aucune' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Forte' },
];

const DIET_OPTIONS: { value: 'none' | 'pescatarian' | 'plant_based' | 'meat_heavy'; label: string; emoji: string; desc: string }[] = [
    { value: 'none', label: 'Aucune préférence', emoji: '🍽️', desc: 'Tout me convient' },
    { value: 'pescatarian', label: 'Pescétarien', emoji: '🐟', desc: 'Prioriser poissons et fruits de mer' },
    { value: 'plant_based', label: 'Végétarien', emoji: '🌱', desc: 'Favoriser repas vegans et végés' },
    { value: 'meat_heavy', label: 'Carnivore', emoji: '🥩', desc: 'Favoriser le bœuf et le poulet' },
];

function TasteProfileTab() {
    const { profile, setTastePreferences } = useProfileStore();
    const prefs = profile.tastePreferences || { dislikes: [], spiceTolerance: 'medium' as const, dietLeaning: 'none' as const };
    const toasted = useRef(false);

    const update = (partial: Partial<typeof prefs>) => {
        const next = { ...prefs, ...partial };
        setTastePreferences(next);
        if (!toasted.current) {
            toast.success("Profil gustatif mis à jour. Votre menu a été ajusté.");
            toasted.current = true;
            setTimeout(() => { toasted.current = false; }, 3000);
        }
    };

    const toggleDislike = (id: string) => {
        const next = prefs.dislikes.includes(id)
            ? prefs.dislikes.filter(d => d !== id)
            : [...prefs.dislikes, id];
        update({ dislikes: next });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
            className="flex flex-col gap-8"
        >
            {/* Section A: Never Show Me */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Ne jamais me montrer</h2>
                <p className="text-sm text-[#9C9C9C] mb-6">Les repas contenant ces ingrédients seront masqués de votre menu et de vos suggestions.</p>
                <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                        {DISLIKE_OPTIONS.map(opt => {
                            const active = prefs.dislikes.includes(opt.id);
                            return (
                                <motion.button
                                    key={opt.id}
                                    layout
                                    onClick={() => toggleDislike(opt.id)}
                                    className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border-2 flex items-center gap-2 ${
                                        active
                                            ? 'bg-[#FFA07A]/15 text-[#C44B00] border-[#FFA07A] shadow-[0_4px_12px_rgba(255,160,122,0.15)]'
                                            : 'bg-[#FFF8F4] text-[#9C9C9C] border-transparent hover:border-[#F0E4D8]'
                                    }`}
                                >
                                    <span>{opt.emoji}</span>
                                    {opt.label}
                                    {active && <X size={12} strokeWidth={3} className="ml-1" />}
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
                {prefs.dislikes.length > 0 && (
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-[#9C9C9C] mt-4"
                    >
                        {prefs.dislikes.length} ingrédient{prefs.dislikes.length > 1 ? 's' : ''} exclu{prefs.dislikes.length > 1 ? 's' : ''}
                    </motion.p>
                )}
            </div>

            {/* Section B: Spice Tolerance */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Tolérance aux épices</h2>
                <p className="text-sm text-[#9C9C9C] mb-6">Définissez sur "Aucune" pour masquer tous les repas épicés.</p>
                <div className="flex bg-[#FFF8F4] p-1.5 rounded-2xl border border-[#F0E4D8] w-fit">
                    {SPICE_OPTIONS.map(opt => {
                        const active = prefs.spiceTolerance === opt.value;
                        const color = opt.value === 'high' ? '#F59E0B' : '#6BC4A0';
                        return (
                            <button
                                key={opt.value}
                                onClick={() => update({ spiceTolerance: opt.value })}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                                    active
                                        ? 'bg-white shadow-sm text-[#2D2D2D]'
                                        : 'text-[#9C9C9C] hover:text-[#6B6B6B]'
                                }`}
                            >
                                {active && <Flame size={14} style={{ color }} />}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
                {prefs.spiceTolerance === 'none' && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-[#FFA07A] font-semibold mt-3 flex items-center gap-1.5">
                        <AlertCircle size={12} /> Tous les repas épicés seront masqués
                    </motion.p>
                )}
            </div>

            {/* Section C: Dietary Leaning */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Préférence alimentaire</h2>
                <p className="text-sm text-[#9C9C9C] mb-6">Les repas correspondants à vos préférences seront mis en avant dans vos recommandations.</p>
                <div className="grid grid-cols-2 gap-3">
                    {DIET_OPTIONS.map(opt => {
                        const active = prefs.dietLeaning === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => update({ dietLeaning: opt.value })}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                    active
                                        ? 'border-[#6BC4A0] bg-[#F1FAF4] shadow-[0_4px_16px_rgba(107,196,160,0.12)]'
                                        : 'border-[#F0E4D8] bg-white hover:border-[#D4C9BE]'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xl">{opt.emoji}</span>
                                    {active && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-[#6BC4A0] flex items-center justify-center">
                                            <Check size={12} className="text-white" strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-[#2D2D2D] mb-0.5">{opt.label}</p>
                                <p className="text-[11px] text-[#9C9C9C]">{opt.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
