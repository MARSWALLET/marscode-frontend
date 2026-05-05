import React from "react"
import Link from "next/link"
import { Bot } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side: Marketing / Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Marscoder</span>
          </Link>
          
          <div className="mt-20 max-w-md">
            <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
              Build incredible software, faster.
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Join the next generation of developers leveraging autonomous AI agents to design, build, and deploy production-grade applications.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-zinc-500 text-sm">
          <span>© 2026 Marscoder Inc.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="flex flex-col relative">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <ModeToggle />
        </div>
        
        {/* Mobile Logo */}
        <div className="lg:hidden p-6 flex justify-center border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Marscoder</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
