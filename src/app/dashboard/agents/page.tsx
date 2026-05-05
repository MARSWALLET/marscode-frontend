"use client"

import React from "react"
import { motion } from "framer-motion"
import { Bot, Play, Square, FileText, Plus, Activity, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const agents = [
  { id: 1, name: "Frontend Specialist", status: "Running", uptime: "2h 45m", task: "Resolving UI bugs in landing page", workspace: "Project Alpha" },
  { id: 2, name: "Database Architect", status: "Idle", uptime: "-", task: "Awaiting instruction", workspace: "E-Commerce API" },
  { id: 3, name: "DevOps Engineer", status: "Stopped", uptime: "4d 12h", task: "Deployment finished", workspace: "Marscoder Core" },
]

export default function AgentsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Autonomous Agents</h1>
          <p className="text-muted-foreground text-lg">Deploy, monitor, and manage your AI workforce.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 w-4 h-4" />
          Deploy Agent
        </Button>
      </motion.div>

      {/* Agents List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {agents.map((agent) => (
          <motion.div 
            key={agent.id}
            variants={itemVariants} 
            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${agent.status === 'Running' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {agent.name}
                  {agent.status === 'Running' && (
                    <span className="relative flex h-2.5 w-2.5 ml-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Activity size={14} />
                  Status: <span className="font-medium text-foreground">{agent.status}</span>
                  <span className="mx-1">•</span>
                  Uptime: {agent.uptime}
                </p>
              </div>
            </div>

            <div className="flex-1 md:px-8 border-l border-border/30 hidden md:block">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Task</div>
              <div className="text-sm font-medium">{agent.task}</div>
              <div className="text-xs text-muted-foreground mt-1">Workspace: {agent.workspace}</div>
            </div>

            <div className="flex items-center gap-2">
              {agent.status === 'Running' ? (
                <Button variant="outline" size="sm" className="rounded-lg text-amber-500 hover:text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
                  <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Stop
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="rounded-lg text-green-500 hover:text-green-600 border-green-500/20 hover:bg-green-500/10">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Start
                </Button>
              )}
              <Button variant="secondary" size="sm" className="rounded-lg">
                <FileText className="w-4 h-4 mr-1.5" />
                Logs
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
