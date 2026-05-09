"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useFamilyStore, usePlannerStore, useMealsStore } from "@/lib/store";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    AreaChart, Area, ResponsiveContainer, ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Target, Flame, Award, Baby, User } from "lucide-react";

const GOAL_LABELS: Record<string, string> = {
    weight_loss: "Perte de poids",
    muscle_gain: "Prise de muscle",
    maintenance: "Maintien",
    balance: "Équilibre",
};

// Mifflin-St Jeor
function calcTargets(member: any) {
    const { age = 25, gender = "male", height_cm = 170, weight_kg = 70, goal, relation } = member;
    if (relation === "child") {
        return { kcal: 1600, protein_g: 55, carbs_g: 200, fats_g: 53 };
    }
    let bmr = gender === "female"
        ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    const tdee = bmr * 1.45;
    let kcal = Math.round(tdee);
    if (goal === "weight_loss") kcal = Math.round(tdee - 400);
    if (goal === "muscle_gain") kcal = Math.round(tdee + 300);
    let proteinPct = 0.25, carbsPct = 0.45, fatsPct = 0.30;
    if (goal === "muscle_gain") { proteinPct = 0.35; carbsPct = 0.40; fatsPct = 0.25; }
    if (goal === "weight_loss") { proteinPct = 0.35; carbsPct = 0.35; fatsPct = 0.30; }
    return {
        kcal,
        protein_g: Math.round((kcal * proteinPct) / 4),
        carbs_g: Math.round((kcal * carbsPct) / 4),
        fats_g: Math.round((kcal * fatsPct) / 9),
    };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-2xl p-3 border border-[#F0E4D8]" style={{ boxShadow: "0 8px 32px rgba(45,45,45,0.12)" }}>
                <p className="text-xs font-bold text-[#2D2D2D] mb-2">{label}</p>
                {payload.map((item: any) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-[#6B6B6B]">{item.name}:</span>
                        <span className="font-semibold text-[#2D2D2D]">{item.value}{item.name === "kcal" ? " kcal" : "g"}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AnalyticsPage() {
    const { members, activeMemberId, setActiveMember } = useFamilyStore();
    const { plan } = usePlannerStore();
    const { meals } = useMealsStore();

    const activeMember = members.find(m => m.id === activeMemberId) ?? members[0];
    const targets = activeMember ? calcTargets(activeMember) : { kcal: 2000, protein_g: 130, carbs_g: 200, fats_g: 65 };

    // Derive per-day nutritional data from the planner for this member
    const memberPlanned = plan.planned_meals.filter(pm =>
        pm.family_member_id === activeMemberId ||
        (activeMemberId === "f1" && (pm.family_member_id === "u1" || !pm.family_member_id))
    );

    const chartData = DAY_LABELS.map((dayLabel, dayIndex) => {
        const dayMeals = memberPlanned.filter(pm => pm.day_index === dayIndex && !plan.paused_days.includes(dayIndex));
        const totals = dayMeals.reduce((acc, pm) => {
            const meal = meals.find(m => m.id === pm.meal_id);
            if (!meal) return acc;
            return {
                kcal: acc.kcal + meal.macros.kcal,
                Protéines: acc.Protéines + meal.macros.protein_g,
                Glucides: acc.Glucides + meal.macros.carbs_g,
                Lipides: acc.Lipides + meal.macros.fats_g,
            };
        }, { kcal: 0, Protéines: 0, Glucides: 0, Lipides: 0 });

        const isPaused = plan.paused_days.includes(dayIndex);
        return {
            date: dayLabel,
            ...totals,
            adherence: isPaused ? null : dayMeals.length > 0
                ? Math.min(100, Math.round((totals.kcal / targets.kcal) * 100))
                : 0,
            target_kcal: targets.kcal,
        };
    });

    const activeDays = chartData.filter(d => d.kcal > 0);
    const avgKcal = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.kcal, 0) / activeDays.length) : 0;
    const avgProtein = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.Protéines, 0) / activeDays.length) : 0;
    const plannedDays = activeDays.length;
    const avgAdherence = activeDays.length
        ? Math.round(activeDays.reduce((s, d) => s + (d.adherence ?? 0), 0) / activeDays.length)
        : 0;

    const statCards = [
        { label: "Calories moy./j", value: avgKcal ? `${avgKcal} kcal` : "—", target: `Cible: ${targets.kcal}`, icon: Flame, color: "#FFA07A", bg: "#FFF0E8" },
        { label: "Protéines moy./j", value: avgProtein ? `${avgProtein}g` : "—", target: `Cible: ${targets.protein_g}g`, icon: Target, color: "#B09AE0", bg: "#F3EEFA" },
        { label: "Jours planifiés", value: `${plannedDays}/7`, target: "cette semaine", icon: Award, color: "#6BC4A0", bg: "#F1FAF4" },
        { label: "Adhérence moy.", value: avgAdherence ? `${avgAdherence}%` : "—", target: "objectif calorique", icon: TrendingUp, color: "#F59E0B", bg: "#FFFBEA" },
    ];

    return (
        <div className="min-h-screen">
            <Header title="Analytics & Nutrition" subtitle="Statistiques hebdomadaires par membre" />
            <div className="p-4 sm:p-8 space-y-6">

                {/* Member tabs */}
                <div className="flex flex-wrap gap-2">
                    {members.map(member => (
                        <motion.button
                            key={member.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveMember(member.id)}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                            style={
                                member.id === activeMemberId
                                    ? { background: member.avatar_color + "22", border: `2px solid ${member.avatar_color}`, color: "#2D2D2D" }
                                    : { background: "white", border: "1px solid #F0E4D8", color: "#9C9C9C" }
                            }
                        >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: member.avatar_color }}>
                                {member.relation === "child" ? <Baby size={12} /> : <User size={12} />}
                            </div>
                            {member.name}
                        </motion.button>
                    ))}
                </div>

                {/* Active member header */}
                {activeMember && (
                    <motion.div key={activeMember.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white" style={{ border: "1px solid #F0E4D8" }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: activeMember.avatar_color }}>
                            {activeMember.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-serif text-lg text-[#2D2D2D]">{activeMember.name}</h2>
                            <p className="text-xs text-[#9C9C9C]">{GOAL_LABELS[activeMember.goal] ?? activeMember.goal} · Cible {targets.kcal} kcal/j</p>
                        </div>
                        <div className="ml-auto flex gap-4 text-center">
                            {[
                                { label: "Prot.", val: `${targets.protein_g}g`, color: "#B09AE0" },
                                { label: "Gluc.", val: `${targets.carbs_g}g`, color: "#6BC4A0" },
                                { label: "Lipi.", val: `${targets.fats_g}g`, color: "#FFA07A" },
                            ].map(({ label, val, color }) => (
                                <div key={label} className="hidden sm:block">
                                    <p className="text-xs font-bold" style={{ color }}>{val}</p>
                                    <p className="text-[10px] text-[#9C9C9C]">{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="p-5 rounded-[20px]"
                                style={{ background: card.bg, border: `1px solid ${card.color}33` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-[#9C9C9C] capitalize tracking-wide">{card.label}</p>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: card.color + "22" }}>
                                        <Icon size={16} style={{ color: card.color }} />
                                    </div>
                                </div>
                                <p className="font-serif text-2xl" style={{ color: card.color }}>{card.value}</p>
                                <p className="text-[10px] text-[#9C9C9C] mt-1">{card.target}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calorie vs target */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="p-6 rounded-[20px] bg-white" style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}>
                        <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">Calories — Cette Semaine</h2>
                        <p className="text-xs text-[#9C9C9C] mb-5">Comparé à la cible de {targets.kcal} kcal</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="kcalGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFA07A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FFA07A" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} domain={[0, Math.max(targets.kcal * 1.3, 500)]} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={targets.kcal} stroke="#6BC4A0" strokeDasharray="4 4" label={{ value: "Cible", fontSize: 10, fill: "#6BC4A0" }} />
                                <Area type="monotone" dataKey="kcal" name="kcal" stroke="#FFA07A" strokeWidth={2.5} fill="url(#kcalGrad)" dot={{ r: 4, fill: "#FFA07A" }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Macro trend */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="p-6 rounded-[20px] bg-white" style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}>
                        <h2 className="font-serif text-lg text-[#2D2D2D] mb-1">Macros — Cette Semaine</h2>
                        <p className="text-xs text-[#9C9C9C] mb-5">En grammes par jour planifié</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#9C9C9C" }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="Protéines" stroke="#B09AE0" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#B09AE0" }} />
                                <Line type="monotone" dataKey="Glucides" stroke="#6BC4A0" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#6BC4A0" }} />
                                <Line type="monotone" dataKey="Lipides" stroke="#FFA07A" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#FFA07A" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Empty state */}
                {plannedDays === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
                        <span className="text-4xl mb-4">📊</span>
                        <h3 className="font-serif text-xl text-[#2D2D2D] mb-2">Aucun repas planifié pour {activeMember?.name}</h3>
                        <p className="text-sm text-[#9C9C9C]">Ajoutez des repas dans le Planificateur pour voir les statistiques ici.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
