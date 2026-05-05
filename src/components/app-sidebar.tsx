"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  TerminalSquare, 
  ChevronRight,
  ChevronLeft
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Bot, label: "AI Agents", href: "/dashboard/agents" },
  { icon: TerminalSquare, label: "Workspaces", href: "/dashboard/workspaces" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function AppSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        initial={false}
        animate={{ 
          width: isExpanded ? 240 : 80 
        }}
        className={cn(
          "sticky top-6 h-[calc(100vh-3rem)] ml-6 rounded-3xl border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg flex flex-col items-center py-6 overflow-hidden z-40 transition-shadow hover:shadow-xl hover:border-border/80"
        )}
      >
        {/* Logo Area */}
        <div className="w-full px-6 flex items-center mb-8">
          <div className="flex-shrink-0 bg-primary text-primary-foreground p-2 rounded-xl">
            <TerminalSquare size={24} strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-4 font-bold text-lg tracking-tight whitespace-nowrap"
              >
                Marscoder
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 w-full flex flex-col gap-2 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            const Icon = item.icon

            const linkContent = (
              <Link 
                href={item.href}
                className={cn(
                  "relative flex items-center w-full p-3 rounded-2xl group transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex-shrink-0 relative">
                  <Icon size={22} className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    isActive ? "animate-pulse" : ""
                  )} />
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-4 font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )

            if (!isExpanded) {
              return (
                <Tooltip key={item.label} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div>{linkContent}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={20} className="font-semibold px-3 py-1.5 rounded-lg">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <React.Fragment key={item.label}>{linkContent}</React.Fragment>
          })}
        </div>

        {/* Toggle Expand Button */}
        <div className="w-full px-4 mt-auto pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full rounded-2xl text-muted-foreground hover:bg-muted"
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
