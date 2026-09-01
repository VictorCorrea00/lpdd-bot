"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Archive, 
  Send, 
  TerminalSquare, 
  Menu,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Bóveda", href: "/dashboard/vault", icon: Archive },
  { name: "Broadcast", href: "/dashboard/broadcast", icon: Send },
  { name: "Logs", href: "/dashboard/logs", icon: TerminalSquare },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header & Sidebar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 font-bold text-xl text-zinc-100">
          <ShieldAlert className="text-emerald-500 w-6 h-6" />
          Sharkbot <span className="text-emerald-500">🦈</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-zinc-950 border-zinc-800 text-zinc-100 p-0 w-64">
            <div className="p-6">
              <div className="flex items-center gap-2 font-bold text-2xl text-zinc-100 mb-8">
                <ShieldAlert className="text-emerald-500 w-8 h-8" />
                Sharkbot 🦈
              </div>
              <nav className="flex flex-col gap-2">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-zinc-800 text-emerald-400"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/50 p-6 min-h-screen">
        <div className="flex items-center gap-2 font-bold text-2xl text-zinc-100 mb-10">
          <ShieldAlert className="text-emerald-500 w-8 h-8" />
          Sharkbot 🦈
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-emerald-400 border border-zinc-700/50"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema en línea
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
