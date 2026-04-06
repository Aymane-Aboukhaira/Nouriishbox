"use client";
import { useCallback, useState } from "react";
import { Header } from "@/components/layout/header";
import { useOrdersStore, useMealsStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
} from "@dnd-kit/core";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/types";
import { Clock, MapPin } from "lucide-react";

const COLUMNS: { id: OrderStatus; label: string; emoji: string; color: string; bg: string }[] = [
    { id: "pending", label: "En Attente", emoji: "📋", color: "#F59E0B", bg: "#FFFBEA" },
    { id: "preparing", label: "En Préparation", emoji: "👨‍🍳", color: "#B09AE0", bg: "#F0EAFF" },
    { id: "out_for_delivery", label: "En Livraison", emoji: "🚴", color: "#FFA07A", bg: "#FFF0E8" },
    { id: "delivered", label: "Livré", emoji: "✅", color: "#6BC4A0", bg: "#F1FAF4" },
];

function DraggableOrderCard({ order }: { order: Order }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: order.id,
        data: { order },
    });

    const col = COLUMNS.find((c) => c.id === order.status)!;

    return (
        <motion.div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ opacity: isDragging ? 0.4 : 1, cursor: isDragging ? "grabbing" : "grab" }}
            className="p-4 rounded-2xl bg-white border border-[#F0E4D8] hover:border-[#A8E6CF] transition-all"
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(45,45,45,0.10)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{order.meal_emoji}</span>
                    <span className="text-[11px] font-bold text-[#9C9C9C] font-mono">#{order.id.toUpperCase()}</span>
                </div>
                <span className="text-lg font-bold text-[#2F8B60]">{order.total_mad} MAD</span>
            </div>
            {/* Meal name */}
            <p className="text-sm font-semibold text-[#2D2D2D] mb-1">{order.meal_name}</p>
            {/* User */}
            <p className="text-xs text-[#6B6B6B] mb-2">{order.user_name}</p>
            {/* Address */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C]">
                <MapPin size={11} />
                <span className="truncate">{order.address}</span>
            </div>
            {/* Time */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C] mt-1">
                <Clock size={11} />
                <span>{new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
        </motion.div>
    );
}

function DroppableColumn({
    column,
    orders,
    isOver,
}: {
    column: typeof COLUMNS[0];
    orders: Order[];
    isOver: boolean;
}) {
    const { setNodeRef } = useDroppable({ id: column.id });

    return (
        <div className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{column.emoji}</span>
                    <div>
                        <p className="text-sm font-bold text-[#2D2D2D]">{column.label}</p>
                    </div>
                </div>
                <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: column.bg, color: column.color }}
                >
                    {orders.length}
                </span>
            </div>

            {/* Drop zone */}
            <div
                ref={setNodeRef}
                className="flex flex-col gap-2.5 min-h-[400px] p-3 rounded-2xl transition-all kanban-col"
                style={{
                    background: isOver ? column.bg : "rgba(255,248,244,0.4)",
                    border: isOver ? `2px dashed ${column.color}` : "2px dashed #F0E4D8",
                }}
            >
                <AnimatePresence>
                    {orders.map((order) => (
                        <DraggableOrderCard key={order.id} order={order} />
                    ))}
                </AnimatePresence>
                {orders.length === 0 && !isOver && (
                    <div className="flex flex-col items-center justify-center h-32 text-[#C4C4C4]">
                        <span className="text-2xl mb-1">{column.emoji}</span>
                        <p className="text-xs">Déposez ici</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "out_for_delivery", "delivered"];

export default function AdminOrdersPage() {
    const { orders, updateOrderStatus } = useOrdersStore();
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [overColumnId, setOverColumnId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragOver = (event: any) => {
        setOverColumnId(event.over?.id ?? null);
    };

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragId(null);
            setOverColumnId(null);
            const { active, over } = event;
            if (!over) return;

            const newStatus = over.id as OrderStatus;
            const order = orders.find((o) => o.id === active.id);
            if (!order || order.status === newStatus) return;

            const currentIdx = STATUS_ORDER.indexOf(order.status);
            const newIdx = STATUS_ORDER.indexOf(newStatus);

            if (newIdx < currentIdx) {
                toast.error("Impossible de revenir en arrière dans le flux de commande");
                return;
            }

            updateOrderStatus(order.id, newStatus);
            const col = COLUMNS.find((c) => c.id === newStatus)!;
            toast.success(`Commande ${order.id} → ${col.label} ${col.emoji}`);
        },
        [orders, updateOrderStatus]
    );

    const activeOrder = activeDragId ? orders.find((o) => o.id === activeDragId) : null;

    return (
        <div className="min-h-screen">
            <Header title="Gestion des Commandes" subtitle="Kanban — Glissez pour faire avancer les commandes" />
            <div className="p-8">
                {/* Stats bar */}
                <div className="flex items-center gap-6 mb-8">
                    {COLUMNS.map((col) => {
                        const count = orders.filter((o) => o.status === col.id).length;
                        return (
                            <div key={col.id} className="flex items-center gap-2.5 px-4 py-2 rounded-2xl"
                                style={{ background: col.bg, border: `1px solid ${col.color}33` }}>
                                <span>{col.emoji}</span>
                                <span className="text-sm font-bold" style={{ color: col.color }}>{count}</span>
                                <span className="text-xs text-[#9C9C9C]">{col.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Kanban board */}
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-4 gap-5">
                        {COLUMNS.map((col) => (
                            <DroppableColumn
                                key={col.id}
                                column={col}
                                orders={orders.filter((o) => o.status === col.id)}
                                isOver={overColumnId === col.id}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeOrder && (
                            <div className="p-4 rounded-2xl bg-white border-2 border-[#6BC4A0] w-64"
                                style={{ boxShadow: "0 16px 48px rgba(107,196,160,0.25)" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{activeOrder.meal_emoji}</span>
                                    <span className="text-[11px] font-bold text-[#9C9C9C]">#{activeOrder.id.toUpperCase()}</span>
                                </div>
                                <p className="text-sm font-semibold text-[#2D2D2D]">{activeOrder.meal_name}</p>
                                <p className="text-xs text-[#6B6B6B]">{activeOrder.user_name}</p>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
