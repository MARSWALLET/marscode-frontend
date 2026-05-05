"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldAlert, Users, Settings2, Activity, Shield, LogOut, ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const adminNavItems = [
  { href: "/admin", icon: Activity, label: "System Health" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/config", icon: Settings2, label: "Kill Switches" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-destructive/30">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-destructive/20 bg-card/50 flex flex-col shrink-0 relative overflow-hidden">
        {/* Danger background effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-destructive/10 to-transparent pointer-events-none" />
        
        <div className="p-6 relative z-10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-destructive/10 p-1.5 rounded-md border border-destructive/20">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-bold tracking-tight text-destructive">Superuser</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 relative z-10">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-4">
            Platform Control
          </div>
          
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block relative">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 z-10 relative",
                  isActive ? "text-destructive-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute inset-0 bg-destructive rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 relative z-10 space-y-3">
          <Button variant="outline" className="w-full justify-start rounded-xl border-border/50 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 w-4 h-4" /> Return to App
            </Link>
          </Button>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-bold text-xs">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">Clearance Level 5</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">Admin Environment Active</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
