"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, GitBranch, CreditCard, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Bots", href: "/dashboard/bots", icon: Bot },
    { name: "Fluxos", href: "/dashboard/fluxos", icon: GitBranch },
    { name: "Gateways", href: "/dashboard/gateways", icon: CreditCard },
    { name: "Mais", href: "/dashboard/mais", icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex justify-center">
      {/* Mobile container constraint to match the app feel */}
      <div className="w-full max-w-md bg-[#0a0a0a] min-h-screen relative shadow-2xl border-x border-zinc-900/50 flex flex-col">
        
        {/* Main Content Area */}
        <main className="flex-1 pb-20 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 w-full h-16 bg-[#0a0a0a] border-t border-zinc-900 flex justify-around items-center px-2 z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex flex-col items-center justify-center w-16 h-full gap-1"
              >
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-colors", 
                    isActive ? "text-[#00a8ff]" : "text-zinc-500"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-[#00a8ff]" : "text-zinc-500"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
