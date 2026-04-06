"use client";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar variant="admin" />
            <main className="flex-1 flex flex-col overflow-hidden ml-64">
                <div className="flex-1 overflow-y-auto px-8 py-10">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
