"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Bot, User, Code2, FileText, CheckCircle2, CircleDashed,
  ArrowLeft, Loader2, ChevronRight, ChevronDown, FolderOpen, File,
  Wifi, WifiOff, X, Sparkles, Zap, Globe, Terminal, ListChecks, Clock,
  CheckCheck, AlertCircle, ChevronUp,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useSocket, AgentThought, AgentResponse, AgentLog } from "@/hooks/useSocket"
import { api } from "@/lib/api"
import { Square } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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

interface AgentLogEntry {
  id: string
  level: "info" | "warn" | "error"
  message: string
  timestamp: string
}

interface WorkerTask {
  id: string
  title: string
  description: string
  agent: string
  status: "pending" | "in_progress" | "done" | "failed"
  files_affected: string[]
  acceptance_criteria: string[]
  estimated_minutes?: number
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

const AGENT_COLORS: Record<string, string> = {
  backend:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  frontend: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  executor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  tester:   "bg-green-500/10 text-green-400 border-green-500/20",
  planner:  "bg-primary/10 text-primary border-primary/20",
  exporter: "bg-rose-500/10 text-rose-400 border-rose-500/20",
}

function TaskStatusIcon({ status }: { status: WorkerTask["status"] }) {
  if (status === "done")       return <CheckCheck size={12} className="text-green-400 shrink-0" />
  if (status === "in_progress") return <Loader2 size={12} className="text-primary animate-spin shrink-0" />
  if (status === "failed")     return <AlertCircle size={12} className="text-red-400 shrink-0" />
  return <CircleDashed size={12} className="text-muted-foreground/50 shrink-0" />
}

function TaskBar({ tasks }: { tasks: WorkerTask[] }) {
  const [dismissed, setDismissed] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    setDismissed(false) // reset when new tasks come in
  }, [tasks.length])

  if (tasks.length === 0 || dismissed) return null

  const done      = tasks.filter(t => t.status === "done").length
  const running   = tasks.filter(t => t.status === "in_progress").length
  const allDone   = done === tasks.length
  const pct       = Math.round((done / tasks.length) * 100)

  // Auto-dismiss 3s after all done
  React.useEffect(() => {
    if (!allDone) return
    const t = setTimeout(() => setDismissed(true), 3000)
    return () => clearTimeout(t)
  }, [allDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="max-w-3xl mx-auto mb-2"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-1.5">
        <ListChecks size={11} className={allDone ? "text-green-400" : "text-primary"} />
        <span className="text-[11px] font-semibold text-foreground/70">
          {allDone ? "All tasks complete" : `${done}/${tasks.length} tasks done`}
          {running > 0 && <span className="text-primary animate-pulse ml-1">· {running} running</span>}
        </span>
        {/* Progress bar */}
        <div className="flex-1 h-1 rounded-full bg-muted/60 overflow-hidden mx-1">
          <motion.div
            className={`h-full rounded-full ${allDone ? "bg-green-500" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <button
          onClick={() => setExpanded(o => !o)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
        >
          {expanded ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={11} />
        </button>
      </div>

      {/* Task pills — horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium shrink-0 transition-all ${
              task.status === "done"
                ? "border-green-500/30 bg-green-500/10 text-green-400/70"
                : task.status === "in_progress"
                ? "border-primary/40 bg-primary/10 text-primary animate-pulse"
                : task.status === "failed"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-border/40 bg-muted/30 text-muted-foreground"
            }`}
          >
            <TaskStatusIcon status={task.status} />
            <span className={task.status === "done" ? "line-through opacity-60" : ""}>{task.title}</span>
          </div>
        ))}
      </div>

      {/* Expanded detail view */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden mt-1.5"
          >
            <div className="rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm p-2 space-y-0.5">
              {tasks.map((task, i) => (
                <div key={task.id} className="flex gap-2 items-start p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <span className="text-[9px] text-muted-foreground/40 w-3 text-right font-mono">{i + 1}</span>
                    <TaskStatusIcon status={task.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-medium leading-snug ${
                      task.status === "done" ? "line-through text-muted-foreground/40" : "text-foreground"
                    }`}>{task.title}</p>
                    {task.description && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wide shrink-0 ${
                    AGENT_COLORS[task.agent] ?? "bg-muted text-muted-foreground border-border/40"
                  }`}>{task.agent}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

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

// ── v0-style File Tree ────────────────────────────────────────────────────────

// Map extension → colour class
const EXT_COLOR: Record<string, string> = {
  tsx: "text-sky-400", ts: "text-sky-400", jsx: "text-sky-400", js: "text-yellow-400",
  py: "text-blue-400", go: "text-cyan-400", rs: "text-orange-400",
  css: "text-violet-400", scss: "text-violet-400",
  json: "text-green-400", yaml: "text-green-400", yml: "text-green-400", toml: "text-green-400",
  md: "text-gray-400", txt: "text-gray-400",
  html: "text-orange-400", svg: "text-pink-400",
  env: "text-yellow-600", sh: "text-lime-400",
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  const color = EXT_COLOR[ext] ?? "text-muted-foreground/60"
  return <File className={`w-3.5 h-3.5 shrink-0 ${color}`} />
}

function FileTreeNode({
  node, depth = 0, activeFile, newFiles, onSelect,
}: {
  node: FileNode; depth?: number; activeFile: string | null
  newFiles: Set<string>; onSelect: (p: string) => void
}) {
  const [open, setOpen] = useState(depth < 2)
  const isNew = newFiles.has(node.path)

  if (node.type === "dir") {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-1.5 py-[3px] pr-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors group"
          style={{ paddingLeft: `${6 + depth * 14}px` }}
        >
          <span className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
          <FolderOpen className="w-3.5 h-3.5 shrink-0 text-yellow-500/70 group-hover:text-yellow-500 transition-colors" />
          <span className="text-xs truncate">{node.name}</span>
        </button>
        <AnimatePresence>
          {open && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.13 }}
              className="overflow-hidden"
            >
              {node.children.map(child => (
                <FileTreeNode
                  key={child.path} node={child} depth={depth + 1}
                  activeFile={activeFile} newFiles={newFiles} onSelect={onSelect}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const isActive = activeFile === node.path
  return (
    <motion.button
      onClick={() => onSelect(node.path)}
      initial={isNew ? { opacity: 0, x: -6 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={`w-full flex items-center gap-1.5 py-[3px] pr-2 rounded-md text-xs transition-all relative group ${
        isActive
          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border-l-2 border-transparent"
      }`}
      style={{ paddingLeft: `${6 + depth * 14}px` }}
    >
      <FileIcon name={node.name} />
      <span className="truncate flex-1 text-left">{node.name}</span>
      {isNew && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
      )}
    </motion.button>
  )
}

// ── Markdown renderer ────────────────────────────────────────────────────────
function MarkdownContent({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 text-foreground">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mt-2.5 mb-1 text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[13px] font-semibold mt-2 mb-0.5 text-foreground">{children}</h3>,
        // Paragraph
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[13px]">{children}</p>,
        // Inline code
        code: ({ inline, children, ...props }: any) =>
          inline ? (
            <code className="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary">{children}</code>
          ) : (
            <code className="block w-full overflow-x-auto font-mono text-[11px] leading-relaxed">{children}</code>
          ),
        // Code block
        pre: ({ children }) => (
          <pre className="my-2 p-3 rounded-lg bg-black/40 border border-white/10 overflow-x-auto text-[11px] font-mono text-green-300/90 leading-relaxed">
            {children}
          </pre>
        ),
        // Bold
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        // Italic
        em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
        // Links
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
            {children}
          </a>
        ),
        // Lists
        ul: ({ children }) => <ul className="my-1.5 ml-4 space-y-0.5 list-disc marker:text-muted-foreground/60">{children}</ul>,
        ol: ({ children }) => <ol className="my-1.5 ml-4 space-y-0.5 list-decimal marker:text-muted-foreground/60">{children}</ol>,
        li: ({ children }) => <li className="text-[13px] leading-relaxed">{children}</li>,
        // Horizontal rule
        hr: () => <hr className="my-3 border-border/30" />,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic">{children}</blockquote>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"

  // Detect post-completion walkthrough (starts with ## What Was Built)
  const isWalkthrough = !isUser && msg.content.startsWith("## What Was Built")
  if (isWalkthrough) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-green-500/10 border-b border-green-500/15">
            <CheckCheck size={14} className="text-green-400 shrink-0" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Build Complete · Walkthrough</span>
          </div>
          {/* Walkthrough content rendered as markdown */}
          <div className="px-4 py-4">
            <MarkdownContent content={msg.content} />
          </div>
        </div>
      </motion.div>
    )
  }

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
          <div className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider mb-1.5">{msg.agent_type}</div>
        )}
        {isUser
          ? <span className="whitespace-pre-wrap text-[13px]">{msg.content}</span>
          : <MarkdownContent content={msg.content} />
        }
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


// ── Thought stream — action pill style ────────────────────────────────────────
function ThoughtStream({ thoughts }: { thoughts: { agent: string; thought: string }[] }) {
  const latest = thoughts[thoughts.length - 1]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-3 justify-start"
    >
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={16} />
      </div>
      <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm border border-primary/20 bg-primary/5 max-w-[85%] space-y-2">
        {/* Latest action pill */}
        {latest && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
            <span className="text-[12px] text-foreground/90 leading-snug">{latest.thought}</span>
          </div>
        )}
        {/* History — last 3 faded */}
        {thoughts.length > 1 && (
          <div className="space-y-0.5">
            {thoughts.slice(-4, -1).map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5 items-start">
                <CheckCircle2 size={10} className="shrink-0 mt-0.5 text-green-500/60" />
                <span>{t.thought}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Streaming bubble (live token display) ─────────────────────────────────────
function StreamingBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 justify-start"
    >
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={16} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-border/50 bg-transparent max-w-[85%]">
        <MarkdownContent content={content} />
        <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-middle" />
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
  // Live agent activity log
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([])
  // Tasks generated by the agent (optional, only when agent calls create_tasks)
  const [tasks, setTasks] = useState<WorkerTask[]>([])
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingFile, setLoadingFile] = useState(false)
  const [connected, setConnected] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [newFiles, setNewFiles] = useState<Set<string>>(new Set())

  const scrollRef = useRef<HTMLDivElement>(null)
  const isEmpty = messages.length === 0 && !loadingHistory

  // ── Socket ────────────────────────────────────────────────────────────────

  const { sendChat, requestFileTree, readFile, cancelBuild, socket } = useSocket({
    workspaceId: id,

    // Live token stream → accumulate in streamingContent
    onAgentStream: ({ project_id, token }: { project_id: string; token: string }) => {
      if (project_id !== id) return
      setStreamingContent(prev => prev + token)
      setThoughts([]) // hide thought pills once streaming starts
    },

    // Every "thought" the agent emits — show as action pills
    onAgentThought: ({ project_id, agent, thought }) => {
      if (project_id !== id) return
      setThoughts(prev => [...prev, { agent, thought }])
    },

    // Final response from the agent
    onAgentResponse: ({ project_id, message }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setSending(false)
      setThoughts([])
      // Promote streamed content or final message into the chat
      const finalContent = streamingContent.trim() || message
      setStreamingContent("") // clear streaming buffer
      if (finalContent) {
        setMessages(prev => [...prev, {
          id: makeId(), role: "agent", content: finalContent, created_at: new Date().toISOString()
        }])
      }
    },

    // agent:log — live activity from CodeActAgent and workers
    onAgentLog: ({ project_id, level, message, timestamp }: AgentLog) => {
      if (project_id !== id) return
      setAgentLogs(prev => [
        ...prev.slice(-199), // keep last 200
        { id: Math.random().toString(36).slice(2), level: level ?? "info", message, timestamp: timestamp ?? new Date().toISOString() }
      ])
    },

    // project:tasks — agent called create_tasks tool
    onProjectTasks: ({ project_id, tasks: newTasks }: { project_id: string; tasks: WorkerTask[] }) => {
      if (project_id !== id) return
      setTasks(newTasks)
    },

    // Walkthrough emitted right before project:complete
    // Push directly into chat as a document card rather than storing in state
    onProjectWalkthrough: ({ project_id, walkthrough: wt }: { project_id: string; walkthrough: string }) => {
      if (project_id !== id) return
      if (!wt) return
      setMessages(prev => [...prev, {
        id: makeId(), role: "agent", agent_type: "planner",
        content: wt, created_at: new Date().toISOString()
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
    onProjectComplete: ({ project_id, files_count, walkthrough: wt }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setSending(false)
      setThoughts([])
      requestFileTree()
      // Mark all tasks done
      setTasks(prev => prev.map(t => ({ ...t, status: "done" as const })))
      // Walkthrough card arrives via onProjectWalkthrough just before this event.
      // Fallback: if walkthrough is bundled only in project:complete, push it now, deduping.
      if (wt) {
        // check messages for existing walkthrough card to avoid duplicates
        setMessages(prev => {
          const alreadyHas = prev.some(m => m.content.startsWith("## What Was Built"))
          if (alreadyHas) return prev
          return [...prev, {
            id: makeId(), role: "agent", agent_type: "planner",
            content: wt, created_at: new Date().toISOString()
          }]
        })
      } else if (!wt) {
        // No walkthrough at all — show a minimal completion note
        setMessages(prev => [...prev, {
          id: makeId(), role: "system",
          content: `✅ Build complete! ${files_count ? `${files_count} files generated.` : ""} Check the file explorer →`,
          created_at: new Date().toISOString()
        }])
      }
      toast.success("Build complete! 🎉", { duration: 5000 })
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

    onFileChanged: ({ project_id, path }: { project_id: string; path?: string }) => {
      if (project_id !== id) return
      requestFileTree()
      // Mark new file for pulse animation, then clear after 4s
      if (path) {
        setNewFiles(prev => new Set(prev).add(path))
        setTimeout(() => setNewFiles(prev => { const n = new Set(prev); n.delete(path); return n }), 4000)
      }
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

  // Load workspace meta + history + state
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const [metaRes, histRes] = await Promise.all([
          api.get(`/api/workspaces/${id}`, { headers: authHeader() }),
          api.get(`/api/workspaces/${id}/messages`, { headers: authHeader() }),
        ])
        const ws = metaRes.data.workspace
        setWorkspace(ws)
        // Restore build state on reload
        if (ws?.status === "in_progress") {
          setAgentState("coding")
        }
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
    setAgentState("coding")
    setThoughts([])
    setAgentLogs([])

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
    setAgentState("coding")
    setThoughts([])
    setAgentLogs([])
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
  const isPanelOpen = fileTree.length > 0 || activeFile !== null || agentLogs.length > 0

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
            {agentState === "coding" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 text-[11px] px-2"
                onClick={() => {
                  cancelBuild()
                  setAgentState("idle")
                  setSending(false)
                  setThoughts([])
                  toast.info("Agent stopped.")
                }}
              >
                <Square size={11} className="fill-current" /> Stop
              </Button>
            )}
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
                {/* Thought pills — show while agent is calling tools */}
                {thoughts.length > 0 && !streamingContent && (
                  <ThoughtStream thoughts={thoughts} />
                )}
                {/* Live token streaming bubble */}
                {streamingContent && (
                  <StreamingBubble key="streaming" content={streamingContent} />
                )}
                {/* Fallback spinner before first thought/token */}
                {sending && thoughts.length === 0 && !streamingContent && (
                  <motion.div key="dot-thinking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-border/50 bg-transparent text-sm flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Starting up…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Floating input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
          <TaskBar tasks={tasks} />
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
                  : agentLogs.length > 0 && fileTree.length === 0
                  ? <Terminal className="w-4 h-4 text-primary" />
                  : <Code2 className="w-4 h-4 text-primary" />}
                <span className="font-semibold text-sm">
                  {activeFile ? activeFile.split("/").pop()
                    : agentLogs.length > 0 && fileTree.length === 0 ? "Agent Activity"
                    : "File Explorer"}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {agentState === "coding" && (
                  <Badge variant="outline" className="text-[10px] px-2 h-5 border-primary/30 text-primary animate-pulse">Working…</Badge>
                )}
                {activeFile && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
                    onClick={() => { setActiveFile(null); setFileContent(null) }}>
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
                        <FileTreeNode key={node.path} node={node} activeFile={activeFile} newFiles={newFiles} onSelect={handleFileSelect} />
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-xl border border-border/50 bg-background/50 text-[11px] text-muted-foreground">
                      Click a file to view its content.
                    </div>
                  </motion.div>

                ) : agentLogs.length > 0 ? (
                  /* Agent activity log */
                  <motion.div key="agent-log" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-1">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5 flex items-center gap-1.5">
                      <Terminal size={10} /> Activity
                    </div>
                    {agentLogs.map(log => (
                      <div key={log.id} className={`flex gap-2 px-2 py-1.5 rounded-lg text-[11px] font-mono leading-snug ${
                        log.level === "error" ? "bg-red-500/10 text-red-400" :
                        log.level === "warn"  ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-muted/30 text-muted-foreground"
                      }`}>
                        <span className="shrink-0 opacity-50">
                          {log.level === "error" ? "✗" : log.level === "warn" ? "⚠" : "›"}
                        </span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))}
                    {agentState === "coding" && (
                      <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-primary">
                        <Loader2 size={10} className="animate-spin shrink-0" />
                        <span>Working…</span>
                      </div>
                    )}
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
