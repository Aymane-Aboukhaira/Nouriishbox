"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar variant="client" />
            <main className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
                <div className="flex-1 overflow-y-auto px-0 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10 pb-24 md:pb-10">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
}
