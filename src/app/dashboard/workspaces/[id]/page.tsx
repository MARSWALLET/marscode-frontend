"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Bot, User, Code2, FileText, CheckCircle2, CircleDashed,
  ArrowLeft, Loader2, ChevronRight, ChevronDown, FolderOpen, File,
  Wifi, WifiOff, X, Sparkles, Zap, Globe, Terminal, ListChecks, Clock,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useSocket, AgentThought, AgentResponse } from "@/hooks/useSocket"

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentState = "idle" | "thinking" | "coding"

interface Message {
  id: string
  role: "user" | "agent" | "system"
  agent_type?: string | null
  content: string
  created_at: string | null
  streaming?: boolean
}

interface FileNode {
  name: string
  path: string
  type: "file" | "dir"
  children?: FileNode[]
}

interface WorkspaceInfo {
  id: string
  name: string
  status: string
}

interface PlanStep {
  id: string
  title: string
  description: string
  agent: string
  files_affected: string[]
}

interface ProjectPlanData {
  title: string
  description: string
  tech_stack: Record<string, string>
  steps: PlanStep[]
}

function authHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("marscoder_access_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function makeId() { return Math.random().toString(36).slice(2) }

// ── Suggestion chips ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: Globe, label: "Landing page", prompt: "Build a beautiful SaaS landing page with hero, features, pricing, and CTA sections" },
  { icon: Terminal, label: "REST API", prompt: "Create a FastAPI backend with CRUD endpoints, auth, and a PostgreSQL schema" },
  { icon: Code2, label: "Dashboard UI", prompt: "Build an analytics dashboard with charts, a sidebar, and a data table" },
  { icon: Zap, label: "Auth system", prompt: "Scaffold a full authentication system with login, register, JWT, and protected routes" },
]

// ── Empty / hero state ────────────────────────────────────────────────────────
function EmptyState({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full pb-40 px-6 text-center"
    >
      {/* Glowing orb */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-9 h-9 text-primary" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl -z-10 scale-150" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
        What can I help you build?
      </h1>
      <p className="text-muted-foreground max-w-md mb-10 text-sm leading-relaxed">
        Describe your idea and Marscoder's AI agents will plan, code, and ship it — files appear live as they write.
      </p>

      {/* Suggestion chips */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => onSelect(prompt)}
            className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/60 hover:border-primary/30 transition-all text-left text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ── File Tree ─────────────────────────────────────────────────────────────────
function FileTreeNode({ node, depth = 0, activeFile, onSelect }: {
  node: FileNode; depth?: number; activeFile: string | null; onSelect: (p: string) => void
}) {
  const [open, setOpen] = useState(depth < 2)
  if (node.type === "dir") {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 text-sm text-muted-foreground transition-colors"
          style={{ paddingLeft: `${8 + depth * 12}px` }}>
          {open ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
          <FolderOpen className="w-3.5 h-3.5 shrink-0 text-yellow-500/80" />
          <span className="truncate">{node.name}</span>
        </button>
        <AnimatePresence>
          {open && node.children && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
              {node.children.map(child => (
                <FileTreeNode key={child.path} node={child} depth={depth + 1} activeFile={activeFile} onSelect={onSelect} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  return (
    <button onClick={() => onSelect(node.path)}
      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
        activeFile === node.path ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
      style={{ paddingLeft: `${8 + depth * 12}px` }}>
      <File className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={16} />
        </div>
      )}
      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
        isUser
          ? "bg-muted text-foreground rounded-tr-sm"
          : msg.role === "system"
          ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-tl-sm"
          : "bg-transparent border border-border/50 text-foreground rounded-tl-sm"
      }`}>
        {msg.agent_type && !isUser && (
          <div className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider mb-1">{msg.agent_type}</div>
        )}
        <span className="whitespace-pre-wrap">{msg.content}</span>
        {msg.streaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
          <User size={16} />
        </div>
      )}
    </motion.div>
  )
}

// ── Thought stream ─────────────────────────────────────────────────────────────
function ThoughtStream({ thoughts }: { thoughts: { agent: string; thought: string }[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={16} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-primary/20 bg-primary/5 text-sm max-w-[85%]">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
          <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">Thinking</span>
        </div>
        <div className="space-y-1">
          {thoughts.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              className="text-muted-foreground text-xs leading-relaxed flex gap-1.5">
              <span className="text-primary/40 shrink-0 font-mono text-[10px] mt-0.5">{t.agent}</span>
              <span>{t.thought}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkspaceIDEPage() {
  const { id } = useParams<{ id: string }>()

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [agentState, setAgentState] = useState<AgentState>("idle")
  // Live thought stream (cleared on response)
  const [thoughts, setThoughts] = useState<{ agent: string; thought: string }[]>([])
  // Plan from planner agent — shown in side panel
  const [plan, setPlan] = useState<ProjectPlanData | null>(null)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingFile, setLoadingFile] = useState(false)
  const [connected, setConnected] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isEmpty = messages.length === 0 && !loadingHistory

  // ── Socket ────────────────────────────────────────────────────────────────

  const { sendChat, requestFileTree, readFile, approvePlan, rejectPlan, socket } = useSocket({
    workspaceId: id,

    // Every "thought" the agent emits while working — accumulate them
    onAgentThought: ({ project_id, agent, thought }) => {
      if (project_id !== id) return
      setAgentState("thinking")
      setThoughts(prev => [...prev, { agent, thought }])
    },

    // Final response from the agent in chat mode
    onAgentResponse: ({ project_id, message }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setSending(false)
      setThoughts([])
      if (message && !message.startsWith("**Error:**") || message) {
        setMessages(prev => [...prev, {
          id: makeId(), role: "agent", content: message, created_at: new Date().toISOString()
        }])
      }
    },

    // When a project plan is generated — show in side panel, brief note in chat
    onProjectPlan: ({ project_id, plan: planData }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setThoughts([])
      setSending(false)
      if (planData) setPlan(planData)
      // Just a short acknowledgement in chat — full plan is in the side panel
      setMessages(prev => [...prev, {
        id: makeId(), role: "agent", agent_type: "planner",
        content: `📋 Plan ready: **${planData?.title ?? "Implementation Plan"}** (${planData?.steps?.length ?? 0} steps) — see the panel →`,
        created_at: new Date().toISOString()
      }])
    },

    // Build pipeline started (after user approval)
    onProjectBuilding: ({ project_id, message }) => {
      if (project_id !== id) return
      setAgentState("coding")
      setThoughts([])
      toast.success(message || "Build started!", { duration: 4000 })
    },

    // Project fully complete
    onProjectComplete: ({ project_id }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setSending(false)
      setThoughts([])
      requestFileTree()
    },

    // Error from backend pipeline
    onProjectError: ({ project_id, error }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setSending(false)
      setThoughts([])
      const friendly = error.includes("429") || error.includes("rate") || error.includes("busy")
        ? "The AI provider is temporarily busy. Please try again in a moment."
        : error
      setMessages(prev => [...prev, {
        id: makeId(), role: "system", content: friendly, created_at: new Date().toISOString()
      }])
    },

    onFileChanged: ({ project_id }) => {
      if (project_id !== id) return
      requestFileTree()
    },
  })

  // Track connection + file events
  useEffect(() => {
    const sock = socket.current
    if (!sock) return
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    sock.on("connect", onConnect)
    sock.on("disconnect", onDisconnect)
    sock.on("file:tree", ({ tree }: { tree: FileNode[] }) => setFileTree(tree || []))
    sock.on("file:content", ({ content }: { content: string }) => {
      setFileContent(content)
      setLoadingFile(false)
    })
    return () => {
      sock.off("connect", onConnect)
      sock.off("disconnect", onDisconnect)
      sock.off("file:tree")
      sock.off("file:content")
    }
  }, [socket.current]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load workspace meta + history
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [metaRes, histRes] = await Promise.all([
          api.get(`/api/workspaces/${id}`, { headers: authHeader() }),
          api.get(`/api/workspaces/${id}/messages`, { headers: authHeader() }),
        ])
        setWorkspace(metaRes.data.workspace)
        const history: Message[] = histRes.data.messages.map((m: any) => ({
          id: m.id, role: m.role === "user" ? "user" : "agent",
          agent_type: m.agent_type, content: m.content, created_at: m.created_at,
        }))
        setMessages(history)
      } catch {
        toast.error("Failed to load workspace.")
      } finally {
        setLoadingMeta(false)
        setLoadingHistory(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (connected && id) requestFileTree()
  }, [connected, id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thoughts, agentState])

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent, overrideText?: string) => {
    e.preventDefault()
    const text = (overrideText ?? input).trim()
    if (!text || sending) return

    setSending(true)
    setInput("")
    setAgentState("thinking")
    setThoughts([])

    const userMsg: Message = { id: makeId(), role: "user", content: text, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])

    try {
      await api.post(`/api/workspaces/${id}/messages`, { content: text }, { headers: authHeader() })
    } catch { /* non-fatal */ }

    sendChat(text)
  }, [input, sending, id, sendChat])

  const handleSuggestion = useCallback((prompt: string) => {
    setInput(prompt)
    // Submit right away
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent
    setSending(true)
    setInput("")
    setAgentState("thinking")
    setThoughts([])
    const userMsg: Message = { id: makeId(), role: "user", content: prompt, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    api.post(`/api/workspaces/${id}/messages`, { content: prompt }, { headers: authHeader() }).catch(() => {})
    sendChat(prompt)
  }, [id, sendChat])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any) }
  }

  const handleFileSelect = (path: string) => {
    setActiveFile(path); setFileContent(null); setLoadingFile(true); readFile(path)
  }

  // Panel shows when: files exist, file open, OR a plan was generated
  const isPanelOpen = fileTree.length > 0 || activeFile !== null || plan !== null

  if (loadingMeta) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* ── Chat Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative min-w-0">

        {/* Top bar */}
        <div className="h-14 border-b border-border/40 flex items-center px-4 gap-3 shrink-0 bg-background/80 backdrop-blur-sm">
          <Link href="/dashboard/workspaces" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm truncate">{workspace?.name ?? "Workspace"}</span>
            <Badge variant="outline" className={`ml-1 text-[10px] px-2 py-0 h-5 shrink-0 ${
              agentState !== "idle" ? "border-blue-500/30 text-blue-500 animate-pulse" : ""
            }`}>
              {agentState === "idle" ? (workspace?.status ?? "ready") : agentState}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            {connected
              ? <><Wifi className="w-3.5 h-3.5 text-green-500" /> <span className="hidden sm:inline">Connected</span></>
              : <><WifiOff className="w-3.5 h-3.5 text-red-400" /> <span className="hidden sm:inline">Reconnecting…</span></>}
          </div>
        </div>

        {/* Messages or empty state */}
        <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef as any}>
          {loadingHistory ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : isEmpty ? (
            <EmptyState onSelect={handleSuggestion} />
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-36">
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              <AnimatePresence>
                {agentState === "thinking" && thoughts.length > 0 && (
                  <ThoughtStream thoughts={thoughts} />
                )}
                {agentState === "thinking" && thoughts.length === 0 && (
                  <motion.div key="dot-thinking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-border/50 bg-transparent text-sm flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Thinking…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Floating input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}
              className="relative shadow-xl rounded-2xl overflow-hidden border border-border/50 bg-card focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Marscoder to build something…"
                disabled={sending}
                className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 bg-transparent py-4 pl-4 pr-14 text-sm"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || sending}
                className="absolute right-2 bottom-2 rounded-xl h-8 w-8">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </Button>
            </form>
            <p className="text-center mt-2 text-[10px] text-muted-foreground">
              Marscoder AI can make mistakes. Review important changes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel (files only) ─────────────────────────────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="border-l border-border/40 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden shadow-2xl">

            {/* Panel header */}
            <div className="h-14 border-b border-border/40 flex items-center px-4 shrink-0 bg-muted/20">
              <div className="flex items-center gap-2">
                {activeFile
                  ? <Code2 className="w-4 h-4 text-primary" />
                  : plan && fileTree.length === 0
                  ? <ListChecks className="w-4 h-4 text-primary" />
                  : <Code2 className="w-4 h-4 text-primary" />}
                <span className="font-semibold text-sm">
                  {activeFile ? activeFile.split("/").pop()
                    : plan && fileTree.length === 0 ? "Implementation Plan"
                    : "File Explorer"}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {agentState === "coding" && (
                  <Badge variant="outline" className="text-[10px] px-2 h-5 border-primary/30 text-primary animate-pulse">Coding live</Badge>
                )}
                {activeFile && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
                    onClick={() => { setActiveFile(null); setFileContent(null) }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                {plan && !activeFile && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
                    onClick={() => setPlan(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-3">
              <AnimatePresence mode="wait">
                {/* File content view */}
                {activeFile ? (
                  <motion.div key="file-content" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    {loadingFile
                      ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                      : <pre className="text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap break-all bg-muted/30 p-3 rounded-xl">{fileContent ?? "Empty file"}</pre>}
                  </motion.div>

                ) : fileTree.length > 0 ? (
                  /* File tree */
                  <motion.div key="file-tree" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Explorer</div>
                    <div className="space-y-0.5">
                      {fileTree.map(node => (
                        <FileTreeNode key={node.path} node={node} activeFile={activeFile} onSelect={handleFileSelect} />
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-xl border border-border/50 bg-background/50 text-[11px] text-muted-foreground">
                      Click a file to view its content.
                    </div>
                  </motion.div>

                ) : plan ? (
                  /* Plan view */
                  <motion.div key="plan-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-4">

                    {/* Plan header */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                      <h2 className="font-semibold text-sm text-foreground mb-1">{plan.title}</h2>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Tech stack */}
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">Tech Stack</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(plan.tech_stack).map(([k, v]) => (
                          <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border/50 text-foreground/70">
                            <span className="text-muted-foreground">{k}: </span>{v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
                        {plan.steps.length} Steps
                      </div>
                      <div className="space-y-1.5">
                        {plan.steps.map((step, i) => (
                          <div key={step.id}
                            className="flex gap-2.5 p-2.5 rounded-lg border border-border/40 bg-background/50 hover:bg-muted/30 transition-colors group">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground leading-snug">{step.title}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 font-medium uppercase tracking-wide">
                                  {String(step.agent).replace("AgentRole.", "").toLowerCase()}
                                </span>
                                {step.files_affected?.length > 0 && (
                                  <span className="text-[9px] text-muted-foreground truncate">
                                    {step.files_affected[0]}{step.files_affected.length > 1 ? ` +${step.files_affected.length - 1}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Approve / Reject actions */}
                    <div className="pt-2 space-y-2 border-t border-border/40 mt-2">
                      <Button
                        className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          approvePlan()
                          setPlan(null)
                          setAgentState("coding")
                          toast.success("Build approved! Agents are starting…")
                        }}
                        disabled={agentState === "coding"}
                      >
                        {agentState === "coding"
                          ? <><Loader2 size={13} className="animate-spin" /> Building…</>
                          : <><Zap size={13} /> Approve & Build</>}
                      </Button>
                      <Button variant="outline" className="w-full gap-2 text-muted-foreground"
                        onClick={() => { rejectPlan(); setPlan(null) }}
                        disabled={agentState === "coding"}
                      >
                        <X size={13} /> Reject Plan
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
