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
    name: z.string().min(2, "Name too short"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(8, "Phone number too short"),
    address: z.string().min(10, "Please provide a complete address"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const ALLERGEN_OPTIONS = ["Gluten", "Dairy", "Nuts", "Eggs", "Shellfish", "Soy", "Fish", "Sesame"];

const HUMAN_ACTIVITY: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Very active",
    very_active: "Extremely active",
};

const HUMAN_GOAL: Record<string, string> = {
    weight_loss: "Lose weight",
    maintenance: "Maintain",
    muscle_gain: "Build muscle",
    eat_cleaner: "Eat cleaner"
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
                {/* Header */}
                <h1 className="font-serif text-4xl text-[#2D2D2D] mb-8">Settings</h1>

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
                                {tab === 'taste' ? 'Taste Profile' : tab}
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
        toast.success("Profile updated ✓");
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl text-[#2D2D2D]">Personal information</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F1EFE8] text-[#5F5E5A] hover:bg-[#E8E0D8] transition-colors">
                        <Pencil size={18} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Full name" field="name" register={register} isEditing={isEditing} error={errors.name} />
                    <Field label="Phone number" field="phone" placeholder="+212 6XX XXX XXX" register={register} isEditing={isEditing} error={errors.phone} />
                    <div className="md:col-span-2">
                        <Field label="Email" field="email" register={register} isEditing={isEditing} error={errors.email} note="Used for delivery confirmations" />
                    </div>
                    <div className="md:col-span-2">
                        <Field label="Delivery address" field="address" placeholder="Street, neighbourhood, Casablanca" register={register} isEditing={isEditing} error={errors.address} />
                    </div>
                </div>

                {isEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-3 pt-4 border-t border-[#F0E4D8]">
                        <button type="button" onClick={handleCancel} className="px-6 py-2.5 rounded-full border border-[#D4C9BE] text-[#6B6B6B] font-bold text-sm hover:bg-[#F9F6F0]">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-full bg-[#6BC4A0] text-white font-bold text-sm hover:bg-[#5BB48F] flex items-center gap-2">
                            <Check size={16} /> Save changes
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

        toast.success("Macros recalculated ✓ — your plan will reflect the new targets");
        setIsRecalculating(false);
    };

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
            <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Your nutrition profile</h2>
            <p className="text-sm text-[#9C9C9C] mb-8">Recalculated from your onboarding data. Update your stats to keep macros accurate.</p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                <StatPill label="Age" val={`${profile.age || 30} years`} />
                <StatPill label="Gender" val={profile.gender === "male" ? "Male" : "Female"} />
                <StatPill label="Weight" val={`${profile.weight_kg || 70} kg`} />
                <StatPill label="Height" val={`${profile.height_cm || 170} cm`} />
                <StatPill label="Activity" val={HUMAN_ACTIVITY[profile.activity_level] || "Moderate"} />
                <StatPill label="Goal" val={HUMAN_GOAL[profile.goal] || "Maintain"} />
            </div>

            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
                <MacroPill color="#F59E0B" bg="#FAEEDA" label="Calories" val={displayMacros.kcal} />
                <MacroPill color="#B09AE0" bg="#F3EEFA" label="Protein" val={`${displayMacros.protein_g}g`} />
                <MacroPill color="#6BC4A0" bg="#E1F5EE" label="Carbs" val={`${displayMacros.carbs_g}g`} />
                <MacroPill color="#FFA07A" bg="#FFF0EA" label="Fats" val={`${displayMacros.fats_g}g`} />
            </div>

            {!isRecalculating ? (
                <button onClick={() => setIsRecalculating(true)} className="px-6 py-2.5 rounded-full border-2 border-[#6BC4A0] text-[#6BC4A0] font-bold text-sm hover:bg-[#F1FAF4] transition-colors">
                    Update my stats
                </button>
            ) : (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden border-t border-[#F0E4D8] pt-6 mt-2 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-[#9C9C9C] block mb-2">Weight (kg)</label>
                        <input type="number" min="30" max="300" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-24 bg-[#FFF8F4] px-4 py-3 rounded-xl border border-[#F0E4D8] outline-none text-base font-bold text-[#2D2D2D] focus:border-[#6BC4A0]" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#9C9C9C] block mb-2">Goal</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(HUMAN_GOAL).map(([k, v]) => (
                                <button key={k} onClick={() => setGoal(k as "weight_loss" | "maintenance" | "muscle_gain" | "balance")} className={`py-3 rounded-xl text-sm font-bold transition-all ${goal === k ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#D4C9BE]'}`}>{v}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#9C9C9C] block mb-2">Activity level</label>
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                            {["sedentary", "light", "moderate", "active"].map((k) => (
                                <button key={k} onClick={() => setActivity(k as "sedentary" | "light" | "moderate" | "active" | "very_active")} className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${activity === k ? 'bg-[#2D2D2D] text-white shadow-md' : 'bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#D4C9BE]'}`}>{HUMAN_ACTIVITY[k]}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[#F0E4D8]">
                        <button onClick={() => setIsRecalculating(false)} className="px-6 py-2.5 rounded-full border border-[#D4C9BE] text-[#6B6B6B] font-bold text-sm hover:bg-[#F9F6F0]">Cancel</button>
                        <button onClick={handleRecalculate} className="px-6 py-2.5 rounded-full bg-[#6BC4A0] text-white font-bold text-sm hover:bg-[#5BB48F] flex items-center gap-2 shadow-[0_4px_16px_rgba(107,196,160,0.3)]">
                            <Zap size={16} fill="white" /> Recalculate my macros
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
            toast.success("Allergen preferences saved");
            mutated.current = true;
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
            <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Allergen alerts</h2>
            <p className="text-sm text-[#9C9C9C] mb-6">We'll flag meals containing these when you browse the menu.</p>
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
            {(subscription.status === 'active' || subscription.status === 'paused') && (
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

    let badge = "";
    if (subscription.status === 'active') badge = "bg-[#E1F5EE] text-[#085041] border-[#6BC4A0]";
    else if (subscription.status === 'paused') badge = "bg-[#FAEEDA] text-[#633806] border-[#F59E0B]";
    else badge = "bg-[#F1EFE8] text-[#5F5E5A] border-[#D4C9BE]";

    const startFormatted = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(subscription.starts_at));

    // Next delivery
    const nextD = new Date();
    nextD.setDate(nextD.getDate() + 7 - nextD.getDay() + 1); // rough next Monday
    const isTomorrow = false; // Add real logic if needed

    return (
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#6BC4A0]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(107,196,160,0.1),transparent)] pointer-events-none" />
            
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="font-serif text-4xl text-[#2D2D2D] mb-3 capitalize">{subscription.plan} box</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge} capitalize`}>{subscription.status}</span>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-[#2D2D2D]">{subscription.price_mad} <span className="text-xs text-[#9C9C9C] font-semibold">MAD / week</span></p>
                    <p className="font-mono text-[10px] text-[#9C9C9C] mt-1">ID: #NB-49281</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                <div className="px-4 py-2 bg-[#FFF8F4] rounded-xl flex items-center gap-2">
                    <HeartHandshake size={16} className="text-[#B09AE0]" />
                    <span className="text-xs font-bold text-[#6B6B6B]">Member since {startFormatted}</span>
                </div>
                <div className="px-4 py-2 bg-[#FFF8F4] rounded-xl flex items-center gap-2">
                    <span className="text-gold">⭐</span>
                    <span className="text-xs font-bold text-[#6B6B6B]">{points.balance} NourishPoints</span>
                </div>
            </div>

            {subscription.status === 'active' && (
                <div className={`p-4 rounded-2xl flex items-center justify-between ${isTomorrow ? 'bg-[#FAEEDA] border border-[#F59E0B]/30' : 'bg-[#F1FAF4] border border-[#A8E6CF]'}`}>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#2F8B60]">Next delivery</span>
                        <span className="text-sm font-semibold text-[#166534]">Monday, {nextD.getDate()} {nextD.toLocaleString('default', { month: 'short' })} · 7am–12pm</span>
                    </div>
                    {isTomorrow && <span className="px-2 py-1 bg-[#F59E0B] text-white text-[10px] font-bold rounded-2xl rounded-br-none">Tomorrow</span>}
                </div>
            )}
        </div>
    );
}

function SubscriptionActions() {
    const { skipWeek, pauseSubscription, setPlan } = useSubscriptionStore();
    const [openAction, setOpenAction] = useState<string | null>(null);

    const toggle = (id: string) => setOpenAction(prev => prev === id ? null : id);

    return (
        <div className="space-y-4">
            {/* Skip Week */}
            <ActionRow 
                icon={<SkipForward className="text-[#6BC4A0]" size={20} />}
                title="Skip next week" desc="Your next box won't be prepared. No charge. Cutoff: Thu midnight."
                btnLabel="Skip week →" color="#6BC4A0"
                isOpen={openAction === "skip"} onToggle={() => toggle("skip")}
            >
                <div className="flex items-center justify-between p-4 bg-[#F1FAF4] rounded-2xl border border-[#A8E6CF]">
                    <span className="text-sm font-semibold text-[#166534]">Are you sure you want to skip?</span>
                    <div className="flex gap-2">
                        <button onClick={() => toggle("skip")} className="px-4 py-2 rounded-full border border-[#6BC4A0] text-[#2F8B60] text-xs font-bold">Keep my box</button>
                        <button onClick={() => { skipWeek(); toast.success("Next week skipped — no charge. See you the week after."); toggle("skip"); }} className="px-4 py-2 rounded-full bg-[#6BC4A0] text-white text-xs font-bold">Confirm skip</button>
                    </div>
                </div>
            </ActionRow>

            {/* Pause */}
            <ActionRow 
                icon={<PauseCircle className="text-[#F59E0B]" size={20} />}
                title="Pause delivery" desc="Pause for 1, 2, or 3 weeks. Reactivates automatically."
                btnLabel="Pause →" color="#F59E0B"
                isOpen={openAction === "pause"} onToggle={() => toggle("pause")}
            >
                <PauseSelector onConfirm={(w) => { pauseSubscription(w); toast.success(`Paused for ${w} weeks.`); toggle("pause"); }} onCancel={() => toggle("pause")} />
            </ActionRow>

            {/* Change Plan */}
            <ActionRow 
                icon={<ArrowLeftRight className="text-[#B09AE0]" size={20} />}
                title="Change plan" desc="Switch between Solo, Couple, and Family. Takes effect next week."
                btnLabel="Change →" color="#B09AE0"
                isOpen={openAction === "plan"} onToggle={() => toggle("plan")}
            >
                <PlanSelector onConfirm={(p) => { setPlan(p as any); toast.success(`Plan updated to ${p}.`); toggle("plan"); }} onCancel={() => toggle("plan")} />
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
            <p className="text-sm font-semibold text-[#6B6B6B] mb-3">How many weeks do you want to pause?</p>
            <div className="flex gap-2 mb-4">
                {[1, 2, 3].map(w => (
                    <button key={w} onClick={() => setWeeks(w)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${weeks === w ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]' : 'bg-white text-[#6B6B6B] border-[#D4C9BE]'}`}>{w} week{w>1&&'s'}</button>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3">
                <button onClick={onCancel} className="text-xs font-bold text-[#9C9C9C] hover:text-[#6B6B6B] rounded-full">Cancel</button>
                <button onClick={() => onConfirm(weeks)} className="px-5 py-2.5 rounded-full bg-[#6BC4A0] text-white font-bold text-xs">Confirm pause</button>
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
                    { id: 'family', name: 'Family', price: 890 },
                ].map(p => (
                    <button key={p.id} onClick={() => setP(p.id)} className={`p-3 rounded-2xl border-2 flex flex-col items-center bg-white transition-all ${plan === p.id ? 'border-[#6BC4A0] shadow-md' : 'border-[#F0E4D8]'}`}>
                        <span className="font-serif text-lg text-[#2D2D2D]">{p.name}</span>
                        <span className="text-xs text-[#9C9C9C] font-semibold">{p.price} MAD</span>
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3">
                <button onClick={onCancel} className="text-xs font-bold text-[#9C9C9C] hover:text-[#6B6B6B] rounded-full">Cancel</button>
                <button onClick={() => onConfirm(plan)} className="px-5 py-2.5 rounded-full bg-[#B09AE0] text-white font-bold text-xs">Confirm change</button>
            </div>
        </div>
    );
}

// ============================================================================
// CANCEL RETENTION FLOW
// ============================================================================

const CANCEL_REASONS = [
    { id: "expensive", label: "Too expensive" },
    { id: "not_eating", label: "Not eating the meals" },
    { id: "holiday", label: "Going on holiday" },
    { id: "health", label: "Health reasons" },
    { id: "cooking", label: "Switching to cooking at home" },
    { id: "other", label: "Other" },
];

function CancelFlow() {
    const { pauseSubscription, cancelSubscription } = useSubscriptionStore();
    const { points } = usePointsStore();
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [reason, setReason] = useState("");

    // Reset when unmounted/tab changes occurs intrinsically if state lives here inside AnimatePresence context above.

    const handleOfferAccept = () => {
        if (reason === "expensive") toast.success("Discount applied — you're saving 48 MAD/week");
        else if (reason === "not_eating") toast.success("Request sent — we'll contact you within 24h");
        else if (reason === "holiday") { pauseSubscription(3); toast.success("Paused for 3 weeks"); }
        else if (reason === "health") { pauseSubscription(4); toast.success("Paused. Support team will reach out."); }
        else if (reason === "cooking") toast.success("Your plan PDF will be emailed to you");
        else toast.success("Thanks for the feedback");
        setStep(0);
    };

    const handleFinalCancel = () => {
        cancelSubscription();
        toast.success("Subscription cancelled. We hope to see you again soon.");
        setStep(0);
    }

    if (step === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[#D4C9BE] p-6 text-center">
                <h3 className="font-serif text-lg text-[#9C9C9C] mb-1">Thinking of leaving?</h3>
                <p className="text-sm text-[#9C9C9C] mb-4">We'd love to understand why. Most members who pause come back within 3 weeks.</p>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-[#9C9C9C] underline hover:text-[#FFA07A] transition-colors">Cancel subscription</button>
            </div>
        );
    }

    const slide = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

    return (
        <div className="rounded-2xl border border-[#F0E4D8] shadow-sm bg-white overflow-hidden p-6 relative min-h-[300px]">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="1" {...slide} className="flex flex-col h-full">
                        <h2 className="font-serif text-3xl text-[#2D2D2D] mb-1">We're sorry to see you go</h2>
                        <p className="text-sm text-[#9C9C9C] mb-6">Before you go, tell us why — it takes 5 seconds and helps us improve.</p>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {CANCEL_REASONS.map(r => (
                                <button key={r.id} onClick={() => setReason(r.id)} className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${reason === r.id ? 'bg-[#F1FAF4] border-[#6BC4A0] text-[#166534]' : 'bg-[#FFF8F4] border-transparent text-[#6B6B6B] hover:border-[#D4C9BE]'}`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                            <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-full border border-[#D4C9BE] text-[#6B6B6B] text-sm font-bold">Keep my subscription</button>
                            <button disabled={!reason} onClick={() => setStep(reason === "other" ? 3 : 2)} className="px-6 py-2.5 rounded-full bg-[#6BC4A0] text-white text-sm font-bold disabled:opacity-50 transition-all shadow-md">Next →</button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="2" {...slide} className="flex flex-col h-full items-center justify-center text-center">
                        {reason === "expensive" && <Offer heading="What if we made it work?" color="#F59E0B" body="Switch to weekly billing and save 15% — that's 272 MAD/week instead of 320." cta="Switch and save" onAccept={handleOfferAccept} />}
                        {reason === "not_eating" && <Offer heading="Let us fix that" color="#B09AE0" body="Book a free 10-minute call with our nutritionist to redesign your plan around meals you actually love." cta="Book a call" onAccept={handleOfferAccept} />}
                        {reason === "holiday" && <Offer heading="Pause instead of cancel" color="#6BC4A0" body="Pause for up to 3 weeks — your plan resumes automatically when you're back. No action needed." cta="Pause for 3 weeks" onAccept={handleOfferAccept} />}
                        {reason === "health" && <Offer heading="Your health comes first" color="#FFA07A" body="We can pause your plan and connect you with our nutrition team to rebuild when you're ready." cta="Pause and get support" onAccept={handleOfferAccept} />}
                        {reason === "cooking" && <Offer heading="Take us with you" color="#F59E0B" body="Download your personalised macro targets and meal templates — free, yours to keep." cta="Download my plan" onAccept={handleOfferAccept} />}
                        
                        <button onClick={() => setStep(3)} className="mt-8 text-xs font-bold text-[#9C9C9C] hover:text-[#6B6B6B]">No thanks, continue cancelling →</button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="3" {...slide} className="flex flex-col h-full">
                        <h2 className="font-serif text-3xl text-[#2D2D2D] mb-1">Cancel subscription</h2>
                        <p className="text-sm text-[#9C9C9C] mb-8">Your subscription will remain active until end of current week. After that, no further charges.</p>
                        
                        <div className="space-y-4 mb-8">
                            <LossRow text="Your personalised macro plan" />
                            <LossRow text={`Weekly macro tracking and streak (${points.streak || 0}-day streak)`} />
                            <LossRow text={`${points.balance} NourishPoints — not transferable`} />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
                            <button onClick={() => setStep(0)} className="w-full md:w-auto px-6 py-3 rounded-full bg-[#6BC4A0] text-white text-sm font-bold shadow-md">Keep my subscription</button>
                            <button onClick={handleFinalCancel} className="w-full md:w-auto px-6 py-3 rounded-full bg-[#FFA07A] text-white text-sm font-bold">Yes, cancel my subscription</button>
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
                    <ToggleRow label="Weekly plan reminder" desc="Remind me Thu to confirm my plan" active={profile.notifications?.plan_reminder} onToggle={() => setNotificationPref('plan_reminder', !profile.notifications?.plan_reminder)} />
                    <ToggleRow label="Delivery updates" desc="Track my box from kitchen to door" active={profile.notifications?.delivery_updates} onToggle={() => setNotificationPref('delivery_updates', !profile.notifications?.delivery_updates)} />
                    <ToggleRow label="Macro check-ins" desc="Daily nudge if I haven't logged by 2pm" active={profile.notifications?.macro_checkin} onToggle={() => setNotificationPref('macro_checkin', !profile.notifications?.macro_checkin)} />
                    <ToggleRow label="Streak alerts" desc="Warn me if my streak is at risk" active={profile.notifications?.streak_alerts} onToggle={() => setNotificationPref('streak_alerts', !profile.notifications?.streak_alerts)} />
                    <ToggleRow label="New meals" desc="Tell me when seasonal meals are added" active={profile.notifications?.new_meals} onToggle={() => setNotificationPref('new_meals', !profile.notifications?.new_meals)} />
                </div>
            </div>

            {/* Display */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Display</h2>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2D2D2D]">Macro units</span>
                        <div className="flex bg-[#FFF8F4] p-1 rounded-xl border border-[#F0E4D8]">
                            <button onClick={() => setDisplayPref('macroDisplayUnit', 'grams')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.macroDisplayUnit === 'grams' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Grams</button>
                            <button onClick={() => setDisplayPref('macroDisplayUnit', 'percent')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.macroDisplayUnit === 'percent' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Percent</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#2D2D2D]">Week start</span>
                        <div className="flex bg-[#FFF8F4] p-1 rounded-xl border border-[#F0E4D8]">
                            <button onClick={() => setDisplayPref('weekStartDay', 'monday')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.weekStartDay === 'monday' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Monday</button>
                            <button onClick={() => setDisplayPref('weekStartDay', 'sunday')} className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${profile.weekStartDay === 'sunday' ? 'bg-white shadow-sm text-[#2D2D2D]' : 'text-[#9C9C9C]'}`}>Sunday</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">Account</h2>
                <div className="space-y-0 divide-y divide-[#F0E4D8]">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Download size={18} className="text-[#2D2D2D]" />
                            <span className="text-sm font-bold text-[#2D2D2D]">Export my data</span>
                        </div>
                        <button onClick={() => toast.success("Your data export will be emailed to you within 24h.")} className="px-4 py-1.5 rounded-full border border-[#D4C9BE] text-xs font-bold text-[#6B6B6B] hover:bg-[#FFF8F4]">Export →</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Shield size={18} className="text-[#2D2D2D]" />
                            <span className="text-sm font-bold text-[#2D2D2D]">Privacy settings</span>
                        </div>
                        <button onClick={() => toast.info("Privacy settings coming soon.")} className="px-4 py-1.5 rounded-full border border-[#D4C9BE] text-xs font-bold text-[#6B6B6B] hover:bg-[#FFF8F4]">Manage →</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <LogOut size={18} className="text-[#FFA07A]" />
                            <span className="text-sm font-bold text-[#FFA07A]">Sign out</span>
                        </div>
                        <button onClick={handleLogOut} className="px-4 py-1.5 rounded-full border border-[#FFA07A] text-xs font-bold text-[#FFA07A] hover:bg-[#FFF0EA]">Sign out</button>
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
            toast('Preference saved');
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
    { id: "cilantro", label: "Cilantro", emoji: "🌿" },
    { id: "eggplant", label: "Eggplant", emoji: "🍆" },
    { id: "mushrooms", label: "Mushrooms", emoji: "🍄" },
    { id: "olives", label: "Olives", emoji: "🫒" },
    { id: "seafood", label: "Seafood", emoji: "🦐" },
    { id: "bell peppers", label: "Bell Peppers", emoji: "🫑" },
    { id: "dairy", label: "Dairy", emoji: "🧀" },
];

const SPICE_OPTIONS: { value: 'none' | 'medium' | 'high'; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const DIET_OPTIONS: { value: 'none' | 'pescatarian' | 'plant_based' | 'meat_heavy'; label: string; emoji: string; desc: string }[] = [
    { value: 'none', label: 'No preference', emoji: '🍽️', desc: 'Show me everything' },
    { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟', desc: 'Prioritize fish & seafood' },
    { value: 'plant_based', label: 'Plant-based', emoji: '🌱', desc: 'Boost vegan & veggie meals' },
    { value: 'meat_heavy', label: 'Meat heavy', emoji: '🥩', desc: 'Boost beef & chicken meals' },
];

function TasteProfileTab() {
    const { profile, setTastePreferences } = useProfileStore();
    const prefs = profile.tastePreferences || { dislikes: [], spiceTolerance: 'medium' as const, dietLeaning: 'none' as const };
    const toasted = useRef(false);

    const update = (partial: Partial<typeof prefs>) => {
        const next = { ...prefs, ...partial };
        setTastePreferences(next);
        if (!toasted.current) {
            toast.success("Taste profile updated. Your menu has been adjusted.");
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
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Never show me</h2>
                <p className="text-sm text-[#9C9C9C] mb-6">Meals with these ingredients will be hidden from your menu and planner suggestions.</p>
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
                        {prefs.dislikes.length} ingredient{prefs.dislikes.length > 1 ? 's' : ''} excluded
                    </motion.p>
                )}
            </div>

            {/* Section B: Spice Tolerance */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Spice tolerance</h2>
                <p className="text-sm text-[#9C9C9C] mb-6">Set to "None" to hide all spicy meals from your feed.</p>
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
                        <AlertCircle size={12} /> All spicy meals will be hidden
                    </motion.p>
                )}
            </div>

            {/* Section C: Dietary Leaning */}
            <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_12px_40px_rgba(45,45,45,0.06)] border border-[#F0E4D8]">
                <h2 className="font-serif text-2xl text-[#2D2D2D] mb-1">Dietary leaning</h2>
                <p className="text-sm text-[#9C9C9C] mb-6">Meals that match your leaning get a boost in recommendations and sorting.</p>
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
