"use client"

import React from "react"
import { motion } from "framer-motion"
import { Users, Bot, Activity, DollarSign, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

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

const metrics = [
  { label: "Total Users", value: "14,205", change: "+12.5%", trend: "up", icon: Users },
  { label: "Active Agents", value: "3,482", change: "+4.1%", trend: "up", icon: Bot },
  { label: "Monthly Revenue", value: "$142,500", change: "+18.2%", trend: "up", icon: DollarSign },
  { label: "System Errors", value: "0.04%", change: "-0.02%", trend: "down", icon: AlertTriangle, alert: true },
]

export default function AdminOverviewPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">System Health</h1>
          <p className="text-muted-foreground text-lg">Real-time metrics and platform status.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
            Export Logs
          </Button>
          <Button className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20">
            <Activity className="mr-2 w-4 h-4" />
            Run Diagnostics
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {metrics.map((metric, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className={`p-6 rounded-3xl border bg-card flex flex-col ${metric.alert ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-border/50 shadow-sm'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${metric.alert ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                metric.trend === 'up' && !metric.alert ? 'text-green-500 bg-green-500/10' : 
                metric.trend === 'down' && metric.alert ? 'text-green-500 bg-green-500/10' :
                'text-destructive bg-destructive/10'
              }`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {metric.change}
              </div>
            </div>
            <div className="mt-auto">
              <h3 className="text-3xl font-bold tracking-tight mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts / Activity area (Mocked) */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 p-6 rounded-3xl border border-border/50 bg-card shadow-sm h-96 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          <Activity className="w-16 h-16 text-muted mb-4" />
          <p className="text-muted-foreground font-medium">Platform Activity Chart</p>
          <p className="text-xs text-muted-foreground mt-2">(Awaiting live websocket connection)</p>
        </div>

        <div className="p-6 rounded-3xl border border-border/50 bg-card shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4">Recent Audit Logs</h3>
          <div className="flex-1 space-y-4">
            {[
              { time: "2 mins ago", action: "User banned manually", admin: "AD" },
              { time: "1 hour ago", action: "Credits adjusted (+500)", admin: "AD" },
              { time: "3 hours ago", action: "Kill switch triggered: Stripe", admin: "SYS" },
              { time: "5 hours ago", action: "Deepseek endpoint rotated", admin: "SYS" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 items-start border-b border-border/40 pb-3 last:border-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                  {log.admin}
                </div>
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  )
}
