"use client";
import { useRouter } from "next/navigation";
import { useProfileStore, useFamilyStore } from "@/lib/store";
import { ArrowRight, Target, Activity, MapPin, Users, CheckCircle2, Baby, User } from "lucide-react";
import { motion } from "framer-motion";

// ── Used only for family members (we don't collect individual activity levels for them) ──
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};

function calcFamilyMemberKcal(member: {
    age?: number; gender?: string; height_cm?: number; weight_kg?: number;
    goal?: string; relation?: string;
}): number {
    const { age = 25, gender = "male", height_cm = 170, weight_kg = 70, goal, relation } = member;
    if (relation === "child") return 1600;
    let bmr = gender === "female"
        ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    const tdee = bmr * 1.45; // moderate default for family members
    switch (goal) {
        case "weight_loss": return Math.round(tdee - 500);
        case "muscle_gain": return Math.round(tdee + 300);
        default:            return Math.round(tdee);
    }
}

function calcMacros(kcal: number, goal?: string) {
    let proteinPct = 0.25, carbsPct = 0.45, fatsPct = 0.30;
    if (goal === "muscle_gain") { proteinPct = 0.35; carbsPct = 0.40; fatsPct = 0.25; }
    if (goal === "weight_loss") { proteinPct = 0.35; carbsPct = 0.35; fatsPct = 0.30; }
    return {
        kcal,
        protein_g: Math.round((kcal * proteinPct) / 4),
        carbs_g:   Math.round((kcal * carbsPct)   / 4),
        fats_g:    Math.round((kcal * fatsPct)     / 9),
    };
}

const GOAL_LABELS: Record<string, string> = {
    weight_loss: "Perte de poids",
    muscle_gain: "Prise de muscle",
    maintenance: "Maintien",
    balance:     "Équilibre",
};

const ACTIVITY_LABELS: Record<string, string> = {
    sedentary:   "Sédentaire",
    light:       "Légère",
    moderate:    "Modérée",
    active:      "Active",
    very_active: "Très active",
};

export default function ReviewPage() {
    const router = useRouter();
    const { profile } = useProfileStore();
    const { members } = useFamilyStore();

    const savedLocs = Object.entries(profile.savedAddresses || {})
        .filter(([_, val]) => !!(val as string).trim())
        .map(([key, val]) => ({ key, address: val as string }));

    const isFamilyMode = members.length > 1;

    // ── SOLO mode: trust the targets already computed & saved by the goals page ──
    const soloKcal    = profile.targets?.kcal      ?? 0;
    const soloProtein = profile.targets?.protein_g ?? 0;
    const soloCarbs   = profile.targets?.carbs_g   ?? 0;
    const soloFats    = profile.targets?.fats_g    ?? 0;
    const soloGoal    = profile.goal               ?? "maintenance";
    const soloActivity = profile.activity_level    ?? "moderate";

    // ── FAMILY mode: calculate per-member using family store data ──
    const membersWithMacros = members.map((m) => {
        const kcal = calcFamilyMemberKcal({
            age: m.age, gender: m.gender, height_cm: m.height_cm,
            weight_kg: m.weight_kg, goal: m.goal, relation: m.relation,
        });
        const macros = calcMacros(kcal, m.goal);
        return { ...m, calculatedKcal: kcal, macros };
    });

    const familyTotals = membersWithMacros.reduce(
        (acc, m) => ({
            kcal:      acc.kcal      + m.calculatedKcal,
            protein_g: acc.protein_g + m.macros.protein_g,
            carbs_g:   acc.carbs_g   + m.macros.carbs_g,
            fats_g:    acc.fats_g    + m.macros.fats_g,
        }),
        { kcal: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
    );

    return (
        <div className="w-full pb-16">
            <div className="text-center mb-12">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                >
                    {isFamilyMode ? "Étape 06" : "Étape 05"}
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
                    Profil {isFamilyMode ? "Familial" : ""} Complet
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-text-muted text-lg font-sans max-w-md mx-auto"
                >
                    {isFamilyMode
                        ? `Objectifs calculés pour ${members.length} membres. Vérifiez avant de préparer votre semaine.`
                        : "Vérifiez vos cibles avant que nous préparions votre semaine."}
                </motion.p>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">

                {isFamilyMode ? (
                    <>
                        {/* Total family banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-primary p-8 rounded-[32px] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-5">
                                Total Famille / Jour
                            </h3>
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-6xl font-serif text-white leading-none">{familyTotals.kcal.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-accent uppercase tracking-widest ml-2">kcal</span>
                                </div>
                                <div className="flex gap-6">
                                    {[
                                        { label: "Protéines", val: familyTotals.protein_g },
                                        { label: "Glucides",  val: familyTotals.carbs_g },
                                        { label: "Lipides",   val: familyTotals.fats_g },
                                    ].map(({ label, val }) => (
                                        <div key={label} className="text-center">
                                            <span className="block text-xl font-serif text-white">{val}g</span>
                                            <span className="text-[9px] text-white/60 uppercase font-bold tracking-tighter">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Per-member cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {membersWithMacros.map((m, i) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.07 }}
                                    className="bg-white p-6 rounded-[24px] border-[1.5px] border-border shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                                            style={{ backgroundColor: m.avatar_color }}
                                        >
                                            {m.relation === "child"
                                                ? <Baby size={20} strokeWidth={1.5} />
                                                : <User size={20} strokeWidth={1.5} />}
                                        </div>
                                        <div>
                                            <h4 className="font-serif text-base text-text-primary leading-tight">{m.name}</h4>
                                            <p className="text-[10px] text-accent font-bold uppercase tracking-wider">
                                                {GOAL_LABELS[m.goal] ?? m.goal}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-3xl font-serif text-text-primary">{m.calculatedKcal}</span>
                                            <span className="text-[10px] text-text-muted ml-1 font-bold uppercase">kcal/j</span>
                                        </div>
                                        <div className="flex gap-3 text-right">
                                            {[
                                                { label: "P", val: m.macros.protein_g, color: "text-primary" },
                                                { label: "G", val: m.macros.carbs_g,   color: "text-accent" },
                                                { label: "L", val: m.macros.fats_g,    color: "text-text-muted" },
                                            ].map(({ label, val, color }) => (
                                                <div key={label} className="text-center">
                                                    <span className={`block text-sm font-bold font-serif ${color}`}>{val}g</span>
                                                    <span className="text-[9px] text-text-muted uppercase font-bold">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {(m.allergies ?? []).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-1">
                                            {(m.allergies ?? []).map(a => (
                                                <span key={a} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-accent/10 text-accent rounded-full">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* ── Solo mode: read from profile.targets — exactly what the user chose ── */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-8 lg:p-10 rounded-[32px] border-[1.5px] border-border shadow-[0_20px_50px_-10px_rgba(44,62,45,0.06)] overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-border pb-3">Vos Cibles Quotidiennes</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-6xl font-serif text-text-primary leading-none">{soloKcal}</span>
                                <span className="text-xs font-bold text-accent uppercase tracking-widest ml-2">kcal</span>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-center">
                                    <span className="block text-xl font-serif text-primary">{soloProtein}g</span>
                                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Protéines</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-serif text-primary">{soloCarbs}g</span>
                                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Glucides</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-serif text-primary">{soloFats}g</span>
                                    <span className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Lipides</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Info grid: activity + goal — always from profile store */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[24px] border-[1.5px] border-border flex flex-col gap-2 shadow-sm">
                        <Activity size={20} strokeWidth={1.5} className="text-primary" />
                        <div>
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Activité</span>
                            <p className="font-serif text-lg text-text-primary">
                                {ACTIVITY_LABELS[soloActivity] ?? soloActivity}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border-[1.5px] border-border flex flex-col gap-2 shadow-sm">
                        <Target size={20} strokeWidth={1.5} className="text-primary" />
                        <div>
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Objectif</span>
                            <p className="font-serif text-lg text-text-primary">
                                {GOAL_LABELS[soloGoal] ?? soloGoal}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Family mode indicator */}
                {isFamilyMode && (
                    <div className="bg-white p-6 rounded-[24px] border-[1.5px] border-border flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                                <Users size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-serif text-lg text-text-primary leading-tight">Mode Famille</h4>
                                <p className="text-xs text-text-muted">{members.length} membres · objectifs individualisés</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-widest rounded-full">Actif</div>
                    </div>
                )}

                {/* Location Details */}
                {savedLocs.length > 0 && (
                    <div className="bg-white p-8 rounded-[32px] border-[1.5px] border-border shadow-sm">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-border pb-3">Lieux de Livraison</h3>
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

            {/* CTA */}
            <div className="mt-12 w-full max-w-xl mx-auto px-5 sm:px-0">
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/client/planner")}
                    className="w-full h-16 rounded-full bg-primary text-background font-sans font-bold flex items-center justify-center gap-3 text-base shadow-[0_15px_30px_-10px_rgba(44,62,45,0.4)] hover:bg-primary/90 transition-all uppercase tracking-widest"
                >
                    <span>Préparer ma semaine</span>
                    <ArrowRight size={20} />
                </motion.button>
            </div>
        </div>
    );
}
