"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/store";
import { FamilyMemberModal } from "../components/FamilyMemberModal";
import { ArrowRight, Plus, Users, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FamilyPage() {
    const router = useRouter();
    const { members, addMember, removeMember } = useFamilyStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter out "self" since we already collected primary user metrics
    const secondaryMembers = members.filter(m => m.relation !== "self" && m.id !== "f1" && m.id !== "u1");

    return (
        <div className="w-full pb-24">
            <div className="text-center mb-10">
                <h1 className="font-serif text-3xl text-[#2D2D2D] mb-2">Build your family</h1>
                <p className="text-[#9C9C9C] text-sm">Add profiles for whoever you are cooking for.</p>
            </div>

            <div className="space-y-4">
                {secondaryMembers.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-[#F0E4D8] rounded-[20px] p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#F4F0FB] rounded-full flex items-center justify-center text-[#B09AE0] mb-4">
                            <Users size={28} />
                        </div>
                        <h3 className="font-bold text-[#2D2D2D] mb-1">No members added yet</h3>
                        <p className="text-sm text-[#9C9C9C]">Add your partner, kids, or anyone else eating with you.</p>
                    </div>
                ) : (
                    secondaryMembers.map(member => (
                        <div key={member.id} className="bg-white border border-[#F0E4D8] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{backgroundColor: member.avatar_color}}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2D2D2D]">{member.name}</h3>
                                    <p className="text-xs text-[#9C9C9C] capitalize">{member.relation} • {member.age} yrs • {member.daily_kcal} kcal</p>
                                </div>
                            </div>
                            <button onClick={() => removeMember(member.id)} className="p-2 text-[#9C9C9C] hover:text-[#FFA07A] transition-colors rounded-full hover:bg-[#FFF4EF]">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 rounded-2xl border-2 border-[#F0E4D8] flex items-center justify-center gap-2 text-[#2D2D2D] font-bold hover:border-[#6BC4A0] hover:text-[#2F8B60] transition-colors bg-white mt-4"
                >
                    <Plus size={20} /> Add Family Member
                </button>
            </div>

            <FamilyMemberModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAdd={addMember} 
            />

            <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#FFF8F4] via-[#FFF8F4] to-transparent pointer-events-none z-10">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/onboarding/review")}
                        className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 text-lg shadow-[0_8px_24px_rgba(107,196,160,0.3)] bg-gradient-to-br from-[#6BC4A0] to-[#2F8B60]"
                    >
                        Review Profile <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
