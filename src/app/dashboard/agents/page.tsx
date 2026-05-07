"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot, Play, Square, FileText, Plus, Activity, MoreVertical,
  Loader2, CheckCircle2, AlertCircle, Clock, Zap, BarChart2,
  ExternalLink, RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Agent {
  id: string
  name: string
  status: string          // "in_progress" | "pending" | "completed" | "failed"
  progress: number
  uptime: string
  task: string
  workspace: string
  tech_stack: string[]
  updated_at: string | null
}

interface AgentCounts {
  running: number
  queued: number
  completed: number
  total: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("marscoder_access_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
  in_progress: {
    label: "Running",
    color: "text-green-500 border-green-500/20 bg-green-500/10",
    dot: "bg-green-500",
    ping: true,
  },
  pending: {
    label: "Queued",
    color: "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
    dot: "bg-yellow-400",
    ping: false,
  },
  completed: {
    label: "Completed",
    color: "text-blue-500 border-blue-500/20 bg-blue-500/10",
    dot: "bg-blue-400",
    ping: false,
  },
  failed: {
    label: "Failed",
    color: "text-red-500 border-red-500/20 bg-red-500/10",
    dot: "bg-red-500",
    ping: false,
  },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS] ?? STATUS.pending
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {s.ping && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${s.dot}`} />
      </span>
      <Badge variant="outline" className={`text-xs ${s.color}`}>{s.label}</Badge>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="p-6 rounded-2xl border border-border/50 bg-card flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  )
}

// ── Agent Row ─────────────────────────────────────────────────────────────────

function AgentRow({ agent }: { agent: Agent }) {
  const isRunning = agent.status === "in_progress"
  const isFailed = agent.status === "failed"

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all shadow-sm"
    >
      {/* Agent icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        isRunning ? "bg-primary/10 text-primary" : isFailed ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
      }`}>
        <Bot size={22} />
      </div>

      {/* Name + status */}
      <div className="min-w-0 w-48 shrink-0">
        <h3 className="font-semibold flex items-center gap-2 text-base truncate">
          {agent.name}
        </h3>
        <div className="mt-1">
          <StatusBadge status={agent.status} />
        </div>
      </div>

      {/* Task + workspace */}
      <div className="flex-1 md:px-6 md:border-l border-border/30 min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
          Current Task
        </div>
        <div className="text-sm font-medium truncate">{agent.task}</div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
          <Activity className="w-3 h-3 shrink-0" />
          Workspace: <span className="text-foreground font-medium">{agent.workspace}</span>
          {agent.uptime !== "—" && (
            <>
              <span className="text-border">·</span>
              <Clock className="w-3 h-3 shrink-0" />
              {agent.uptime}
            </>
          )}
        </div>
      </div>

      {/* Progress bar (only for running) */}
      {isRunning && (
        <div className="w-full md:w-32 shrink-0">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{agent.progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isRunning ? (
          <Button variant="outline" size="sm" className="rounded-lg text-amber-500 hover:text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
            <Square className="w-3.5 h-3.5 mr-1.5 fill-current" /> Stop
          </Button>
        ) : agent.status === "pending" ? (
          <Button variant="outline" size="sm" className="rounded-lg text-muted-foreground" disabled>
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Queued
          </Button>
        ) : (
          <Link href={`/dashboard/workspaces/${agent.id}`}>
            <Button variant="outline" size="sm" className="rounded-lg text-green-500 hover:text-green-600 border-green-500/20 hover:bg-green-500/10">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View
            </Button>
          </Link>
        )}
        <Link href={`/dashboard/workspaces/${agent.id}`}>
          <Button variant="secondary" size="sm" className="rounded-lg">
            <FileText className="w-4 h-4 mr-1.5" /> Logs
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="font-semibold text-base">{title}</h2>
      <Badge variant="outline" className="text-xs px-2 h-5">{count}</Badge>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-10 text-center text-muted-foreground border border-dashed border-border/50 rounded-2xl">
      <Bot className="w-10 h-10 opacity-20 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [agents, setAgents] = useState<{ running: Agent[]; queued: Agent[]; completed: Agent[] }>({
    running: [], queued: [], completed: [],
  })
  const [counts, setCounts] = useState<AgentCounts>({ running: 0, queued: 0, completed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await api.get("/api/dashboard/agents", { headers: authHeader() })
      setAgents(res.data.agents)
      setCounts(res.data.counts)
    } catch {
      if (!silent) toast.error("Failed to load agents.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    // Auto-refresh every 15s if there are running agents
    const interval = setInterval(() => load(true), 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full flex flex-col py-4 pb-20">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Autonomous Agents</h1>
          <p className="text-muted-foreground text-lg">Monitor every AI agent working across your workspaces.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/dashboard/workspaces">
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 w-4 h-4" /> New Workspace
            </Button>
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Zap} label="Running" value={counts.running} color="bg-primary/10 text-primary" />
            <StatCard icon={Clock} label="Queued" value={counts.queued} color="bg-yellow-500/10 text-yellow-500" />
            <StatCard icon={CheckCircle2} label="Completed" value={counts.completed} color="bg-blue-500/10 text-blue-500" />
            <StatCard icon={BarChart2} label="Total Projects" value={counts.total} color="bg-muted text-muted-foreground" />
          </div>

          {/* Running */}
          <div>
            <SectionHeader title="Running" count={agents.running.length} />
            {agents.running.length === 0 ? (
              <EmptyState message="No agents running right now. Open a workspace and send a prompt to start one." />
            ) : (
              <motion.div className="space-y-3">
                {agents.running.map((a) => <AgentRow key={a.id} agent={a} />)}
              </motion.div>
            )}
          </div>

          {/* Queued */}
          {agents.queued.length > 0 && (
            <div>
              <SectionHeader title="Queued" count={agents.queued.length} />
              <motion.div className="space-y-3">
                {agents.queued.map((a) => <AgentRow key={a.id} agent={a} />)}
              </motion.div>
            </div>
          )}

          {/* Completed */}
          <div>
            <SectionHeader title="Completed & History" count={agents.completed.length} />
            {agents.completed.length === 0 ? (
              <EmptyState message="Completed workspaces will appear here." />
            ) : (
              <motion.div className="space-y-3">
                {agents.completed.map((a) => <AgentRow key={a.id} agent={a} />)}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
