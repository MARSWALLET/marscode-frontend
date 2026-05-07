"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Code2, Search, Plus, Clock, MoreHorizontal, ExternalLink,
  Trash2, Loader2, AlertCircle, CheckCircle2, X, FolderOpen,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Workspace {
  id: string
  name: string
  slug: string
  prompt: string
  description: string | null
  status: string
  progress: number
  tech_stack: string[]
  preview_url: string | null
  updated_at: string | null
  created_at: string | null
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

const CARD_COLORS = [
  { color: "text-blue-500", bg: "bg-blue-500/10" },
  { color: "text-green-500", bg: "bg-green-500/10" },
  { color: "text-purple-500", bg: "bg-purple-500/10" },
  { color: "text-orange-500", bg: "bg-orange-500/10" },
  { color: "text-pink-500", bg: "bg-pink-500/10" },
  { color: "text-cyan-500", bg: "bg-cyan-500/10" },
]

function cardColor(id: string) {
  const idx = id.charCodeAt(0) % CARD_COLORS.length
  return CARD_COLORS[idx]
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:     { label: "Pending",     cls: "bg-muted text-muted-foreground" },
    in_progress: { label: "In Progress", cls: "bg-blue-500/15 text-blue-500" },
    completed:   { label: "Completed",   cls: "bg-green-500/15 text-green-500" },
    failed:      { label: "Failed",      cls: "bg-red-500/15 text-red-500" },
  }
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  )
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("marscoder_access_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Create Workspace Modal ────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void
  onCreated: (w: Workspace) => void
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !prompt.trim()) return
    setLoading(true)
    try {
      const res = await api.post(
        "/api/workspaces/",
        { name: name.trim(), prompt: prompt.trim(), description: description.trim() || undefined },
        { headers: authHeader() }
      )
      toast.success("Workspace created!")
      onCreated(res.data.workspace)
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create workspace.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold tracking-tight mb-1">New Workspace</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Describe what you want to build and your AI agent will get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. E-Commerce Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="Short summary of the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Prompt</label>
            <textarea
              required
              rows={4}
              placeholder="Build a full-stack Next.js e-commerce dashboard with product management, order tracking, and analytics..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Be specific — the more detail, the better the result.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary/20" disabled={loading || !name.trim() || !prompt.trim()}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Create Workspace</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      const res = await api.get("/api/workspaces/", { headers: authHeader(), params })
      setWorkspaces(res.data.workspaces)
    } catch {
      toast.error("Failed to load workspaces.")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchWorkspaces, 300)
    return () => clearTimeout(t)
  }, [fetchWorkspaces])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await api.delete(`/api/workspaces/${id}`, { headers: authHeader() })
      setWorkspaces((prev) => prev.filter((w) => w.id !== id))
      toast.success("Workspace deleted.")
    } catch {
      toast.error("Failed to delete workspace.")
    } finally {
      setDeletingId(null)
      setOpenMenuId(null)
    }
  }

  const handleCreated = (w: Workspace) => {
    setWorkspaces((prev) => [w, ...prev])
  }

  return (
    <div className="w-full h-full flex flex-col py-4" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Workspaces</h1>
          <p className="text-muted-foreground text-lg">
            {loading ? "Loading…" : `${workspaces.length} workspace${workspaces.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          className="rounded-xl shadow-lg shadow-primary/20"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="mr-2 w-4 h-4" />
          New Workspace
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search workspaces…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
          />
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-card rounded-3xl border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center text-center py-24"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-primary/40" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {search ? "No workspaces found" : "No workspaces yet"}
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            {search
              ? `No results for "${search}". Try a different search.`
              : "Create your first workspace and your AI agent will start building for you."}
          </p>
          {!search && (
            <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 w-4 h-4" /> Create your first workspace
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {workspaces.map((w) => {
            const { color, bg } = cardColor(w.id)
            return (
              <motion.div
                key={w.id}
                variants={itemVariants}
                className="group flex flex-col justify-between p-6 rounded-3xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all relative"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                      <Code2 size={22} />
                    </div>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setOpenMenuId(openMenuId === w.id ? null : w.id)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <AnimatePresence>
                        {openMenuId === w.id && (
                          <motion.div
                            className="absolute right-0 top-9 z-20 min-w-[140px] bg-popover border border-border/50 rounded-xl shadow-xl overflow-hidden"
                            initial={{ opacity: 0, scale: 0.92, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDelete(w.id, w.name)}
                              disabled={deletingId === w.id}
                            >
                              {deletingId === w.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">
                      {w.name}
                    </h3>
                  </div>

                  {w.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{w.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Updated {timeAgo(w.updated_at)}</span>
                    <span className="ml-auto">{statusBadge(w.status)}</span>
                  </div>

                  {w.status === "in_progress" && (
                    <div className="w-full bg-secondary rounded-full h-1.5 mb-4">
                      <div
                        className="bg-primary rounded-full h-1.5 transition-all duration-700"
                        style={{ width: `${w.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  {w.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {w.tech_stack.slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary" className="bg-muted text-muted-foreground font-medium rounded-lg text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <Link
                      href={`/dashboard/workspaces/${w.id}`}
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      View details →
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-primary hover:text-primary-foreground rounded-lg -mr-2 text-xs"
                      asChild
                    >
                      <Link href={`/dashboard/workspaces/${w.id}`}>
                        Open IDE <ExternalLink className="w-3 h-3 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateModal
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
