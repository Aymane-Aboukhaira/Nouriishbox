"use client";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ChatBubble, TypingIndicator } from "@/components/ui/chat-bubble";
import { useClinicStore } from "@/lib/store";
import { MOCK_USER } from "@/lib/mock-data";
import { AI_RESPONSES } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Brain, Sparkles, ChevronDown } from "lucide-react";
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
    const [showSidebar, setShowSidebar] = useState(false);
    // Keyboard-aware bottom padding for mobile
    const [keyboardPadding, setKeyboardPadding] = useState(0);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Use visualViewport API to handle mobile keyboard
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const vv = window.visualViewport;
        if (!vv) return;
        const onResize = () => {
            const diff = window.innerHeight - vv.height;
            setKeyboardPadding(diff > 50 ? diff : 0);
        };
        vv.addEventListener('resize', onResize);
        vv.addEventListener('scroll', onResize);
        return () => {
            vv.removeEventListener('resize', onResize);
            vv.removeEventListener('scroll', onResize);
        };
    }, []);

    // Scroll to bottom when keyboard opens
    useEffect(() => {
        if (keyboardPadding > 0) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }, [keyboardPadding]);

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
            
            {/* Main layout: side-by-side on desktop, stacked on mobile */}
            <div className="flex flex-1 flex-col md:flex-row gap-0 md:gap-6 md:p-8 overflow-hidden" style={{ height: "calc(100vh - 80px)" }}>
                
                {/* Sidebar info — hidden on mobile unless toggled */}
                {/* Mobile: toggle button */}
                <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-[#F0E4D8] bg-white/80 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                            style={{ background: "linear-gradient(135deg, #F1FAF4, #A8E6CF)" }}>
                            🥗
                        </div>
                        <div>
                            <p className="font-serif text-sm text-[#2D2D2D]">Nourishbot</p>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6BC4A0] animate-pulse" />
                                <span className="text-[10px] text-[#6BC4A0] font-medium">En ligne</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                clearMessages();
                                toast.info("Conversation réinitialisée");
                            }}
                            className="p-2 rounded-xl text-[#9C9C9C] hover:text-[#2D2D2D] border border-[#F0E4D8] transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-2 rounded-xl text-[#9C9C9C] hover:text-[#2D2D2D] border border-[#F0E4D8] transition-colors"
                        >
                            <Sparkles size={16} />
                        </button>
                    </div>
                </div>

                {/* Mobile sidebar overlay */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden flex-shrink-0"
                        >
                            <div className="px-4 py-3 space-y-3 bg-[#FFF8F4] border-b border-[#F0E4D8]">
                                <p className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-[#B09AE0]" />
                                    Suggestions rapides
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => { setInput(prompt); setShowSidebar(false); inputRef.current?.focus(); }}
                                            className="text-xs px-3 py-2 rounded-xl bg-white border border-[#F0E4D8] text-[#6B6B6B] hover:border-[#A8E6CF] hover:text-[#2F8B60] transition-all"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop sidebar */}
                <div className="hidden md:flex w-72 flex-shrink-0 flex-col space-y-4">
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

                {/* Chat area — full width on mobile */}
                <div className="flex-1 flex flex-col overflow-hidden md:rounded-[20px] bg-white"
                    style={{ border: "none", boxShadow: "none" }}>
                    {/* Desktop border */}
                    <div className="hidden md:block absolute inset-0" style={{ border: "1px solid #F0E4D8", borderRadius: 20, boxShadow: "0 4px 24px rgba(45,45,45,0.06)", pointerEvents: 'none' }} />
                    
                    <div className="flex-1 flex flex-col md:rounded-[20px] md:border md:border-[#F0E4D8] md:shadow-[0_4px_24px_rgba(45,45,45,0.06)] overflow-hidden relative">
                        {/* Messages */}
                        <div 
                            className="flex-1 overflow-y-auto px-4 py-4 md:p-6 space-y-4" 
                            style={{ 
                                background: "linear-gradient(180deg, #FFF8F4 0%, #FFFFFF 100%)",
                                paddingBottom: keyboardPadding > 0 ? '16px' : '16px',
                            }}
                        >
                            {/* Welcome message if no messages */}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 md:py-16 text-center px-4">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                                        style={{ background: "linear-gradient(135deg, #F1FAF4, #A8E6CF)" }}>
                                        🥗
                                    </div>
                                    <h3 className="font-serif text-xl md:text-2xl text-[#2D2D2D] mb-2">Bonjour ! Je suis Nourishbot</h3>
                                    <p className="text-sm text-[#9C9C9C] max-w-sm leading-relaxed">
                                        Posez-moi des questions sur vos macros, repas ou objectifs nutritionnels.
                                    </p>
                                    {/* Mobile quick prompts inline */}
                                    <div className="mt-6 flex flex-wrap justify-center gap-2 md:hidden">
                                        {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => sendMessage(prompt)}
                                                className="text-xs px-3 py-2 rounded-full bg-[#F1FAF4] border border-[#A8E6CF] text-[#2F8B60] font-medium transition-all active:scale-95"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                        {/* Input bar — fixed at bottom on mobile with keyboard awareness */}
                        <div 
                            className="flex-shrink-0 p-3 md:p-4 border-t border-[#F0E4D8] bg-white safe-bottom"
                            style={{ paddingBottom: keyboardPadding > 0 ? `${keyboardPadding + 12}px` : undefined }}
                        >
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 px-4 py-3 min-h-[48px] rounded-2xl bg-[#FFF8F4] border border-[#F0E4D8] text-base md:text-sm text-[#2D2D2D] placeholder:text-[#C4C4C4] outline-none focus:border-[#A8E6CF] transition-colors"
                                    disabled={isTyping}
                                />
                                <motion.button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    whileHover={input.trim() && !isTyping ? { scale: 1.05 } : {}}
                                    whileTap={input.trim() && !isTyping ? { scale: 0.95 } : {}}
                                    className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-white transition-all flex-shrink-0"
                                    style={{
                                        background: input.trim() && !isTyping
                                            ? "linear-gradient(135deg, #6BC4A0, #2F8B60)"
                                            : "#E0E0E0",
                                        boxShadow: input.trim() && !isTyping ? "0 4px 16px rgba(107,196,160,0.3)" : "none",
                                    }}
                                >
                                    <Send size={18} />
                                </motion.button>
                            </form>
                            <p className="text-[10px] text-[#C4C4C4] text-center mt-2 hidden md:block">
                                Nourishbot ne remplace pas un avis médical professionnel
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
