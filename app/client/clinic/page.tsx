"use client";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ChatBubble, TypingIndicator } from "@/components/ui/chat-bubble";
import { useClinicStore } from "@/lib/store";
import { MOCK_USER } from "@/lib/mock-data";
import { AI_RESPONSES } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Brain, Sparkles } from "lucide-react";
import { generateId, sleep } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { toast } from "sonner";

const QUICK_PROMPTS = [
    "Combien de protéines aujourd'hui ?",
    "Comment améliorer mon adhérence ?",
    "Conseil pour la prise de masse",
    "Repas vegan recommandé",
    "J'ai du mal à atteindre mes calories",
];

function getAIResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    if (message.includes("protéine") || message.includes("protein")) {
        const responses = AI_RESPONSES.protein;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    if (message.includes("calorie") || message.includes("kcal")) {
        const responses = AI_RESPONSES.calories;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    if (message.includes("vegan") || message.includes("végé")) {
        const responses = AI_RESPONSES.vegan;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    if (message.includes("stress") || message.includes("fatigue") || message.includes("difficile")) {
        const responses = AI_RESPONSES.stress;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    if (message.includes("streak") || message.includes("série") || message.includes("jours")) {
        const responses = AI_RESPONSES.streak;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    const responses = AI_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
}

export default function ClinicPage() {
    const { messages, isTyping, addMessage, setTyping, clearMessages } = useClinicStore();
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;
        setInput("");

        const userMsg: ChatMessage = {
            id: generateId(),
            role: "user",
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };
        addMessage(userMsg);

        // Simulate AI typing
        setTyping(true);
        const delay = 800 + Math.random() * 1200;
        await sleep(delay);
        setTyping(false);

        const aiResponse = getAIResponse(content);
        const aiMsg: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: aiResponse,
            timestamp: new Date().toISOString(),
        };
        addMessage(aiMsg);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Clinique Virtuelle IA" subtitle="Votre assistant nutritionnel personnel" />
            <div className="flex flex-1 gap-6 p-8 overflow-hidden" style={{ height: "calc(100vh - 80px)" }}>
                {/* Sidebar info */}
                <div className="w-72 flex-shrink-0 space-y-4">
                    {/* AI Coach Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-5 rounded-[20px] bg-white"
                        style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: "linear-gradient(135deg, #F1FAF4, #A8E6CF)" }}>
                                🥗
                            </div>
                            <div>
                                <p className="font-serif text-[#2D2D2D]">Nourishbot</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#6BC4A0] animate-pulse" />
                                    <span className="text-[11px] text-[#6BC4A0] font-medium">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-[#9C9C9C] leading-relaxed">
                            Votre coach IA spécialisé en nutrition. Posez-moi des questions sur vos macros, repas ou objectifs.
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#B09AE0]">
                            <Brain size={12} />
                            <span>Personnalisé pour {MOCK_USER.name.split(" ")[0]}</span>
                        </div>
                    </motion.div>

                    {/* Quick prompts */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 rounded-[20px] bg-white"
                        style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-[#B09AE0]" />
                            <p className="text-xs font-semibold text-[#6B6B6B]">Suggestions rapides</p>
                        </div>
                        <div className="space-y-2">
                            {QUICK_PROMPTS.map((prompt) => (
                                <motion.button
                                    key={prompt}
                                    whileHover={{ x: 3 }}
                                    onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-[#FFF8F4] border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#A8E6CF] hover:text-[#2F8B60] transition-all"
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Reset button */}
                    <button
                        onClick={() => {
                            clearMessages();
                            toast.info("Conversation réinitialisée");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-medium text-[#9C9C9C] border border-[#F0E4D8] hover:bg-white hover:text-[#2D2D2D] transition-all"
                    >
                        <RefreshCw size={13} />
                        Nouvelle conversation
                    </button>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col rounded-[20px] overflow-hidden bg-white"
                    style={{ border: "1px solid #F0E4D8", boxShadow: "0 4px 24px rgba(45,45,45,0.06)" }}>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: "linear-gradient(180deg, #FFF8F4 0%, #FFFFFF 100%)" }}>
                        <AnimatePresence>
                            {messages.map((message) => (
                                <ChatBubble
                                    key={message.id}
                                    role={message.role}
                                    content={message.content}
                                    timestamp={message.timestamp}
                                />
                            ))}
                            {isTyping && (
                                <motion.div
                                    key="typing"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                >
                                    <TypingIndicator />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={bottomRef} />
                    </div>

                    {/* Input bar */}
                    <div className="p-4 border-t border-[#F0E4D8] bg-white">
                        <form onSubmit={handleSubmit} className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez votre question nutritionnelle..."
                                className="flex-1 px-4 py-3 rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-sm text-[#2D2D2D] placeholder:text-[#C4C4C4] outline-none focus:border-[#A8E6CF] transition-colors"
                                disabled={isTyping}
                            />
                            <motion.button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                whileHover={input.trim() && !isTyping ? { scale: 1.05 } : {}}
                                whileTap={input.trim() && !isTyping ? { scale: 0.95 } : {}}
                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all flex-shrink-0"
                                style={{
                                    background: input.trim() && !isTyping
                                        ? "linear-gradient(135deg, #6BC4A0, #2F8B60)"
                                        : "#E0E0E0",
                                    boxShadow: input.trim() && !isTyping ? "0 4px 16px rgba(107,196,160,0.3)" : "none",
                                }}
                            >
                                <Send size={16} />
                            </motion.button>
                        </form>
                        <p className="text-[10px] text-[#C4C4C4] text-center mt-2">
                            Nourishbot ne remplace pas un avis médical professionnel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
