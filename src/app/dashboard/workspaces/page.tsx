"use client"

import React from "react"
import { motion } from "framer-motion"
import { Code2, Search, Filter, Plus, Clock, HardDrive, MoreHorizontal, ExternalLink } from "lucide-react"

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

const workspaces = [
  { id: 1, name: "Project Alpha", updated: "2 mins ago", tech: ["Next.js", "Tailwind"], size: "45 MB", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, name: "E-Commerce API", updated: "3 hours ago", tech: ["Node.js", "Express"], size: "12 MB", color: "text-green-500", bg: "bg-green-500/10" },
  { id: 3, name: "Marscoder Core", updated: "Yesterday", tech: ["Python", "FastAPI"], size: "120 MB", color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 4, name: "Marketing Site", updated: "2 days ago", tech: ["Astro", "Tailwind"], size: "8 MB", color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 5, name: "Data Pipeline", updated: "Last week", tech: ["Python", "Pandas"], size: "340 MB", color: "text-pink-500", bg: "bg-pink-500/10" },
]

export default function WorkspacesPage() {
  return (
    <div className="w-full h-full flex flex-col py-4">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Workspaces</h1>
          <p className="text-muted-foreground text-lg">Manage your codebases and projects.</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 w-4 h-4" />
          New Workspace
        </Button>
      </motion.div>

      {/* Toolbar */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search workspaces..." 
            className="w-full pl-10 pr-4 py-2 bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <Button variant="outline" className="rounded-xl shrink-0">
          <Filter className="mr-2 w-4 h-4" />
          Filter
        </Button>
      </motion.div>

      {/* Workspace Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {workspaces.map((workspace) => (
          <motion.div 
            key={workspace.id}
            variants={itemVariants}
            className="group flex flex-col justify-between p-6 rounded-3xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${workspace.bg} ${workspace.color}`}>
                  <Code2 size={24} />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{workspace.name}</h3>
              
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Updated {workspace.updated}</span>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-2 mb-6">
                {workspace.tech.map(tech => (
                  <Badge key={tech} variant="secondary" className="bg-muted text-muted-foreground font-medium rounded-lg">
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <HardDrive className="w-3.5 h-3.5" />
                  {workspace.size}
                </div>
                <Button size="sm" variant="ghost" className="hover:bg-primary hover:text-primary-foreground rounded-lg -mr-2">
                  Open IDE <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
