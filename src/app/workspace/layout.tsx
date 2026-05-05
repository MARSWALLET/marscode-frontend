import React from "react"
import Link from "next/link"
import { ChevronLeft, Cloud, Terminal } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Workspace Top Bar */}
      <header className="h-14 border-b border-border/40 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-sm">Project Alpha 1</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
            <Cloud className="w-4 h-4 text-green-500" />
            <span>Saved</span>
          </div>
          <ModeToggle />
          <Button size="sm" className="font-medium">
            Export Code
          </Button>
        </div>
      </header>

      {/* Main Workspace Area (Edge-to-edge) */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}
