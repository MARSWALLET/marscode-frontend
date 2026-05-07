"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Terminal, Code, Cpu, Zap, Wallet, TrendingUp, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  name: string
  status: string
  description: string | null
  tech_stack: string[]
  updated_at: string | null
  progress: number
}

interface ActiveAgent {
  project_id: string
  project_name: string
  status: string
  progress: number
  description: string | null
  uptime_start: string | null
}

interface DashboardData {
  user: {
    id: string
    name: string | null
    email: string
    tier: string
    credits_balance: number
    member_since: string | null
  }
  projects: {
    total: number
    recent: Project[]
  }
  active_agent: ActiveAgent | null
  usage: {
    tokens_used: number
    monthly_token_limit: number
    token_usage_pct: number
    cost_this_month: number
    requests_this_month: number
  }
  billing: {
    credits_balance: number
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatUptime(iso: string | null): string {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
}

function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (status === "in_progress") return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
  if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-500" />
  return <Clock className="w-4 h-4 text-muted-foreground" />
}

// ── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("marscoder_access_token")
        const res = await api.get("/api/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(res.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const displayName = data?.user?.name || user?.name || user?.email?.split("@")[0] || "there"
  const tier = data?.user?.tier || user?.tier || "free"

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
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, {displayName}.
          </h1>
          <p className="text-muted-foreground text-lg">
            {loading
              ? "Loading your workspace…"
              : data?.active_agent
              ? "Your AI agents are hard at work."
              : "Ready to build something new?"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl">
            <Terminal className="mr-2 w-4 h-4" />
            Terminal
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" asChild>
            <Link href="/dashboard/workspaces">
              <Plus className="mr-2 w-4 h-4" />
              New Workspace
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Active Agent */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 relative group rounded-3xl border border-border/50 bg-card p-8 hover:border-primary/30 transition-all shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Cpu size={150} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading agent status…
              </div>
            ) : data?.active_agent ? (
              <>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="font-semibold text-muted-foreground tracking-wide uppercase text-xs">Active Agent</h3>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{data.active_agent.project_name}</h2>
                  <p className="text-muted-foreground max-w-sm mb-4">
                    {data.active_agent.description || "Running automated tasks on your project."}
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-secondary rounded-full h-2 mb-6">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-700"
                      style={{ width: `${data.active_agent.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="rounded-xl" asChild>
                    <Link href={`/dashboard/workspaces/${data.active_agent.project_id}`}>View Logs</Link>
                  </Button>
                  <span className="text-sm text-muted-foreground font-mono">
                    Uptime: {formatUptime(data.active_agent.uptime_start)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-3 w-3 rounded-full bg-muted-foreground/40" />
                    <h3 className="font-semibold text-muted-foreground tracking-wide uppercase text-xs">No Active Agent</h3>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">All quiet.</h2>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Start a new workspace and your AI agent will appear here in real-time.
                  </p>
                </div>
                <Button variant="secondary" className="rounded-xl w-fit" asChild>
                  <Link href="/dashboard/workspaces">Create a Workspace</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm flex flex-col justify-between"
        >
          <div>
            <h3 className="font-semibold text-muted-foreground tracking-wide uppercase text-xs mb-4">Usage This Month</h3>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-8 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Token usage */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Tokens</span>
                    <span className="font-mono">
                      {data?.usage.token_usage_pct ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all duration-700 ${
                        (data?.usage.token_usage_pct ?? 0) > 85 ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${data?.usage.token_usage_pct ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data?.usage.tokens_used.toLocaleString() ?? 0} /{" "}
                    {data?.usage.monthly_token_limit === 0
                      ? "∞"
                      : (data?.usage.monthly_token_limit ?? 0).toLocaleString()} tokens
                  </p>
                </div>
                {/* Cost */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Spend</span>
                    <span className="font-mono text-green-500">${data?.usage.cost_this_month ?? "0.00"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{data?.usage.requests_this_month ?? 0} requests</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Credits</span>
            </div>
            <span className="font-semibold font-mono text-sm">
              {loading ? "—" : `$${data?.billing.credits_balance.toFixed(2) ?? "0.00"}`}
            </span>
          </div>
        </motion.div>

        {/* Recent Workspaces */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-3 rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg tracking-tight">Recent Workspaces</h3>
              {data && (
                <p className="text-xs text-muted-foreground mt-0.5">{data.projects.total} total project{data.projects.total !== 1 ? "s" : ""}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/dashboard/workspaces">View all</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : data?.projects.recent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Code className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No workspaces yet.</p>
              <Button className="mt-4 rounded-xl" size="sm" asChild>
                <Link href="/dashboard/workspaces">Create your first workspace</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data?.projects.recent.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/workspaces/${p.id}`}
                  className="group p-4 rounded-2xl border border-border/40 bg-background/50 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Code size={20} />
                    </div>
                    {statusIcon(p.status)}
                  </div>
                  <div>
                    <h4 className="font-medium truncate">{p.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Updated {timeAgo(p.updated_at)}</p>
                    {p.tech_stack?.length > 0 && (
                      <p className="text-xs text-muted-foreground/60 mt-1 truncate">
                        {p.tech_stack.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                  {p.status === "in_progress" && (
                    <div className="w-full bg-secondary rounded-full h-1">
                      <div
                        className="bg-primary rounded-full h-1 transition-all duration-700"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
