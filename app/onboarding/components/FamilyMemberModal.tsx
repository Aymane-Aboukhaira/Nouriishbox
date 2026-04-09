"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import type { Relation, Goal, FamilyMember } from "@/lib/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (member: Omit<FamilyMember, "id" | "assigned_meal_ids">) => void;
}

const COLORS = ["#6BC4A0", "#B09AE0", "#FFA07A", "#FFD3B6", "#93C5FD", "#FCD34D"];
const RELATIONS: Relation[] = ["self", "partner", "child", "parent", "other"];
const GOALS: {id: Goal; label: string}[] = [
    {id: "maintenance", label: "Maintien"},
    {id: "weight_loss", label: "Perdre du poids"},
    {id: "muscle_gain", label: "Prendre du muscle"},
    {id: "balance", label: "Manger sain"}
];

export function FamilyMemberModal({ isOpen, onClose, onAdd }: Props) {
    const [name, setName] = useState("");
    const [relation, setRelation] = useState<Relation>("child");
    const [age, setAge] = useState<number>(10);
    const [goal, setGoal] = useState<Goal>("balance");

    const handleSubmit = () => {
        if (!name.trim()) return;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        // Ensure age is at least 4
        const validAge = Math.max(4, age);
        
        // Very basic TDEE dummy calculation for secondary members to get daily_kcal
        let kcal = 2000;
        if (validAge < 12) kcal = 1600;
        if (goal === "weight_loss") kcal -= 300;
        if (goal === "muscle_gain") kcal += 300;

        onAdd({
            name, relation, age: validAge, goal, daily_kcal: kcal, avatar_color: color
        });
        
        setName("");
        setAge(10);
        setRelation("child");
        setGoal("balance");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#2D2D2D]/40 backdrop-blur-sm z-40 text-[#F5F0E8]"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl z-50 p-6 md:relative md:rounded-[20px] md:w-full md:max-w-md md:mx-auto md:my-auto md:top-20"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-2xl text-[#2D2D2D]">Ajouter un membre</h3>
                            <button onClick={onClose} className="p-2 rounded-full bg-[#F8F9FA] text-[#9C9C9C]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#9C9C9C] capitalize tracking-wider mb-2">Prénom</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="ex: Karim, Lina..."
                                    className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#6BC4A0] text-[#2D2D2D] font-medium"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-[#9C9C9C] capitalize tracking-wider mb-2">Relation</label>
                                    <select 
                                        value={relation}
                                        onChange={e => setRelation(e.target.value as Relation)}
                                        className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#6BC4A0] text-[#2D2D2D] font-medium appearance-none"
                                    >
                                        <option value="partner">Partenaire</option>
                                        <option value="child">Enfant</option>
                                        <option value="parent">Parent</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-[#9C9C9C] capitalize tracking-wider mb-2">Âge</label>
                                    <input
                                        type="number"
                                        min={4}
                                        value={age}
                                        onChange={e => setAge(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#6BC4A0] text-[#2D2D2D] font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#9C9C9C] capitalize tracking-wider mb-2">Objectif</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {GOALS.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setGoal(g.id)}
                                            className={`py-3 rounded-xl text-sm font-bold transition-colors ${goal === g.id ? "bg-[#F1FAF4] text-[#2F8B60] border-2 border-[#6BC4A0]" : "bg-white border-2 border-[#F0E4D8] text-[#9C9C9C]"}`}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!name.trim()}
                                className="w-full mt-6 py-4 rounded-full text-white font-bold bg-[#6BC4A0] disabled:bg-[#E5E7EB] disabled:text-[#9C9C9C] transition-colors"
                            >
                                Enregistrer le profil
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
