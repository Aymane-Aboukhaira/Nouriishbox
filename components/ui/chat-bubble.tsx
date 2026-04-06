"use client";
import { motion } from "framer-motion";

interface ChatBubbleProps {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
    const isUser = role === "user";
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-auto"
                    style={{ background: "linear-gradient(135deg,#6BC4A0,#2F8B60)" }}>
                    <span className="text-white text-sm">🥗</span>
                </div>
            )}
            <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                    className="px-4 py-3 rounded-[20px] text-sm leading-relaxed"
                    style={
                        isUser
                            ? {
                                background: "linear-gradient(135deg,#6BC4A0,#2F8B60)",
                                color: "white",
                                borderRadius: "24px 24px 6px 24px",
                                boxShadow: "0 4px 16px rgba(107,196,160,0.3)",
                            }
                            : {
                                background: "white",
                                color: "#2D2D2D",
                                border: "1px solid #F0E4D8",
                                borderRadius: "24px 24px 24px 6px",
                                boxShadow: "0 4px 16px rgba(45,45,45,0.06)",
                            }
                    }
                >
                    {content}
                </div>
                {timestamp && (
                    <span className="text-[10px] text-[#9C9C9C] px-1">
                        {new Date(timestamp).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                )}
            </div>
            {isUser && (
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-auto"
                    style={{ background: "linear-gradient(135deg,#B09AE0,#7C5CCC)" }}>
                    <span className="text-white text-xs font-bold">Y</span>
                </div>
            )}
        </motion.div>
    );
}

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6BC4A0,#2F8B60)" }}>
                <span className="text-white text-sm">🥗</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-[20px] bg-white border border-[#F0E4D8]"
                style={{ borderRadius: "24px 24px 24px 6px" }}>
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#A8E6CF]"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
