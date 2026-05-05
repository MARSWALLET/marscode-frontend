"use client"

import React from "react"
import { motion } from "framer-motion"
import { Plus, Terminal, Code, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function DashboardPage() {
  return (
    <div className="w-full h-full flex flex-col py-4">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back.</h1>
          <p className="text-muted-foreground text-lg">Here's what your AI agents are up to.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl">
            <Terminal className="mr-2 w-4 h-4" />
            Terminal
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="mr-2 w-4 h-4" />
            New Workspace
          </Button>
        </div>
      </motion.div>

      {/* Grid Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Quick Stats / Active Agent */}
        <motion.div variants={itemVariants} className="md:col-span-2 relative group rounded-3xl border border-border/50 bg-card p-8 hover:border-primary/30 transition-all shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu size={150} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                <h3 className="font-semibold text-muted-foreground tracking-wide uppercase text-xs">Active Agent</h3>
              </div>
              <h2 className="text-3xl font-bold mb-2">Frontend Specialist</h2>
              <p className="text-muted-foreground max-w-sm mb-6">Currently resolving 3 UI bugs in the landing page repository.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="secondary" className="rounded-xl">View Logs</Button>
              <span className="text-sm text-muted-foreground font-mono">Uptime: 2h 45m</span>
            </div>
          </div>
        </motion.div>

        {/* System Health / Usage */}
        <motion.div variants={itemVariants} className="rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-muted-foreground tracking-wide uppercase text-xs mb-4">System Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Compute</span>
                  <span className="font-mono">45%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 w-[45%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory</span>
                  <span className="font-mono">82%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-destructive rounded-full h-2 w-[82%]"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-border/40">
            <p className="text-sm text-muted-foreground">All systems operational.</p>
          </div>
        </motion.div>

        {/* Recent Workspaces */}
        <motion.div variants={itemVariants} className="md:col-span-3 rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg tracking-tight">Recent Workspaces</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground">View all</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group p-4 rounded-2xl border border-border/40 bg-background/50 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Code size={20} />
                </div>
                <div>
                  <h4 className="font-medium truncate">Project Alpha {i}</h4>
                  <p className="text-xs text-muted-foreground">Updated 2h ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
