"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MealCard } from "@/components/ui/meal-card";
import { useFamilyStore, useMealsStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UserPlus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Relation, Goal } from "@/lib/types";

const memberSchema = z.object({
    name: z.string().min(2, "Le prénom doit avoir au moins 2 caractères"),
    relation: z.enum(["self", "partner", "child", "parent", "other"]),
    age: z.coerce.number().min(1).max(120),
    goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "balance"]),
    daily_kcal: z.coerce.number().min(800).max(5000),
});
type MemberForm = z.infer<typeof memberSchema>;

const RELATION_LABELS: Record<Relation, string> = {
    self: "Moi-même",
    partner: "Conjoint(e)",
    child: "Enfant",
    parent: "Parent",
    other: "Autre",
};

const GOAL_LABELS: Record<Goal, string> = {
    weight_loss: "Perte de poids",
    muscle_gain: "Prise de masse",
    maintenance: "Maintien",
    balance: "Équilibre",
};

const AVATAR_COLORS = [
    "#6BC4A0", "#B09AE0", "#FFA07A", "#FFD3B6", "#A8E6CF",
    "#D6C1FF", "#FFE5A0", "#C8EEFF", "#FFD6D6",
];

export default function FamilyPage() {
    const { members, activeMemberId, setActiveMember, addMember, removeMember, assignMeal, unassignMeal } = useFamilyStore();
    const { meals } = useMealsStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

    const activeMember = members.find((m) => m.id === activeMemberId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<MemberForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(memberSchema) as any,
        defaultValues: { relation: "partner", goal: "maintenance", daily_kcal: 2000, age: 30 },
    });

    const onSubmit = (data: MemberForm) => {
        addMember({ ...data, avatar_color: selectedColor });
        toast.success(`${data.name} ajouté à votre famille ! 🎉`);
        reset();
        setShowAddModal(false);
    };

    const activeMemberMeals = meals.filter((m) =>
        activeMember?.assigned_meal_ids.includes(m.id)
    );

    const unassignedMeals = meals.filter(
        (m) => !activeMember?.assigned_meal_ids.includes(m.id) && m.is_active
    ).slice(0, 8);

    return (
        <div className="min-h-screen">
            <Header title="Family Hub" subtitle="Gérez la nutrition de toute votre famille" />
            <div className="p-8">
                {/* Family member profile chips */}
                <div className="flex items-center gap-3 mb-8 flex-wrap">
                    {members.map((member) => (
                        <motion.button
                            key={member.id}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setActiveMember(member.id)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all"
                            style={
                                member.id === activeMemberId
                                    ? { background: member.avatar_color + "22", border: `2px solid ${member.avatar_color}`, boxShadow: `0 4px 16px ${member.avatar_color}33` }
                                    : { background: "white", border: "1px solid #F0E4D8" }
                            }
                        >
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ background: member.avatar_color }}
                            >
                                {member.name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-[#2D2D2D]">{member.name}</p>
                                <p className="text-[10px] text-[#9C9C9C]">
                                    {RELATION_LABELS[member.relation]} · {member.daily_kcal} kcal
                                </p>
                            </div>
                            {member.id === activeMemberId && (
                                <div className="w-2 h-2 rounded-full ml-1" style={{ background: member.avatar_color }} />
                            )}
                        </motion.button>
                    ))}

                    {/* Add member button */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#6BC4A0] border-2 border-dashed border-[#A8E6CF] hover:bg-[#F1FAF4] transition-colors"
                    >
                        <UserPlus size={16} />
                        Ajouter un membre
                    </motion.button>
                </div>

                {/* Active member detail */}
                {activeMember && (
                    <div className="grid grid-cols-3 gap-6">
                        {/* Member profile card */}
                        <motion.div
                            key={activeMember.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6 rounded-[20px] bg-white"
                            style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                                    style={{ background: activeMember.avatar_color }}
                                >
                                    {activeMember.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="font-serif text-lg text-[#2D2D2D]">{activeMember.name}</h2>
                                    <p className="text-sm text-[#9C9C9C]">{RELATION_LABELS[activeMember.relation]}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: "Âge", value: activeMember.age ? `${activeMember.age} ans` : "—" },
                                    { label: "Objectif", value: GOAL_LABELS[activeMember.goal] },
                                    { label: "Calories/jour", value: `${activeMember.daily_kcal} kcal` },
                                    { label: "Repas assignés", value: `${activeMember.assigned_meal_ids.length} repas` },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#F0E4D8] last:border-0">
                                        <span className="text-xs text-[#9C9C9C] font-medium">{item.label}</span>
                                        <span className="text-sm font-semibold text-[#2D2D2D]">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {activeMember.relation !== "self" && (
                                <button
                                    onClick={() => {
                                        removeMember(activeMember.id);
                                        toast.info(`${activeMember.name} retiré de la famille`);
                                        setActiveMember(members[0]?.id ?? "");
                                    }}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs text-[#E07050] hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={12} />
                                    Retirer de la famille
                                </button>
                            )}
                        </motion.div>

                        {/* Assigned meals */}
                        <div className="col-span-2">
                            <h3 className="font-serif text-lg text-[#2D2D2D] mb-4">
                                Repas de {activeMember.name}
                                <span className="text-sm font-sans font-normal text-[#9C9C9C] ml-2">
                                    ({activeMemberMeals.length} assignés)
                                </span>
                            </h3>

                            {activeMemberMeals.length === 0 ? (
                                <div className="flex flex-col items-center py-12 text-[#9C9C9C]">
                                    <span className="text-4xl mb-3">🍽️</span>
                                    <p className="text-sm font-medium">Aucun repas assigné</p>
                                    <p className="text-xs mt-1">Ajoutez des repas depuis la liste ci-dessous</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {activeMemberMeals.map((meal) => (
                                        <div key={meal.id} className="relative group">
                                            <MealCard
                                                meal={meal}
                                                variant="default"
                                                isAdded
                                                showAdd={false}
                                            />
                                            <button
                                                onClick={() => {
                                                    unassignMeal(activeMember.id, meal.id);
                                                    toast.info(`${meal.name} retiré de la liste de ${activeMember.name}`);
                                                }}
                                                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Available meals to assign */}
                            <div className="p-5 rounded-[20px] bg-[#F1FAF4] border border-[#A8E6CF]">
                                <h4 className="text-sm font-semibold text-[#2F8B60] mb-3">
                                    + Ajouter depuis le menu
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {unassignedMeals.slice(0, 6).map((meal) => (
                                        <motion.button
                                            key={meal.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => {
                                                assignMeal(activeMember.id, meal.id);
                                                toast.success(`${meal.emoji} ${meal.name} assigné à ${activeMember.name} !`);
                                            }}
                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#F0E4D8] hover:border-[#A8E6CF] text-left transition-all"
                                        >
                                            <span className="text-lg">{meal.emoji}</span>
                                            <span className="text-xs font-medium text-[#2D2D2D] truncate">{meal.name}</span>
                                            <Plus size={12} className="ml-auto text-[#6BC4A0] flex-shrink-0" />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Member Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-[20px] p-8 w-full max-w-md"
                                style={{ boxShadow: "0 24px 64px rgba(45,45,45,0.16)" }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-serif text-xl text-[#2D2D2D]">Nouveau membre</h2>
                                    <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-xl bg-[#F1FAF4] text-[#9C9C9C] flex items-center justify-center hover:bg-[#A8E6CF]/30 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Avatar color picker */}
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-[#9C9C9C] capitalize tracking-wide mb-2 block">
                                        Couleur Avatar
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {AVATAR_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setSelectedColor(c)}
                                                className="w-8 h-8 rounded-full transition-transform"
                                                style={{
                                                    background: c,
                                                    border: selectedColor === c ? "3px solid #2D2D2D" : "3px solid transparent",
                                                    transform: selectedColor === c ? "scale(1.15)" : "scale(1)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {[
                                        { field: "name", label: "Prénom", type: "text", placeholder: "Ex: Karim" },
                                        { field: "age", label: "Âge", type: "number", placeholder: "30" },
                                        { field: "daily_kcal", label: "Calories/jour", type: "number", placeholder: "2000" },
                                    ].map(({ field, label, type, placeholder }) => (
                                        <div key={field}>
                                            <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">{label}</label>
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                {...register(field as keyof MemberForm)}
                                                className="w-full px-4 py-3 rounded-full bg-[#FFF8F4] border border-[#F0E4D8] text-sm text-[#2D2D2D] outline-none focus:border-[#A8E6CF] transition-colors"
                                            />
                                            {errors[field as keyof MemberForm] && (
                                                <p className="text-xs text-red-400 mt-1">{errors[field as keyof MemberForm]?.message}</p>
                                            )}
                                        </div>
                                    ))}

                                    <div>
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Relation</label>
                                        <select {...register("relation")} className="w-full px-4 py-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-sm text-[#2D2D2D] outline-none focus:border-[#A8E6CF]">
                                            {Object.entries(RELATION_LABELS).filter(([k]) => k !== "self").map(([k, v]) => (
                                                <option key={k} value={k}>{v}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-[#6B6B6B] mb-1.5 block">Objectif</label>
                                        <select {...register("goal")} className="w-full px-4 py-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-sm text-[#2D2D2D] outline-none focus:border-[#A8E6CF]">
                                            {Object.entries(GOAL_LABELS).map(([k, v]) => (
                                                <option key={k} value={k}>{v}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm"
                                        style={{ background: "linear-gradient(135deg, #6BC4A0, #2F8B60)", boxShadow: "0 4px 16px rgba(107,196,160,0.3)" }}
                                    >
                                        Ajouter à la famille 🎉
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
