"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Bot, User, Code2, FileText, CheckCircle2, CircleDashed,
  ArrowLeft, Loader2, ChevronRight, ChevronDown, FolderOpen, File,
  Wifi, WifiOff, AlertCircle, RotateCcw, X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentState = "idle" | "thinking" | "planning" | "coding"

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("marscoder_access_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

// ── File Tree Node ─────────────────────────────────────────────────────────────

function FileTreeNode({
  node,
  depth = 0,
  activeFile,
  onSelect,
}: {
  node: FileNode
  depth?: number
  activeFile: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(depth < 2)

  if (node.type === "dir") {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 text-sm text-muted-foreground transition-colors"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {open ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
          <FolderOpen className="w-3.5 h-3.5 shrink-0 text-yellow-500/80" />
          <span className="truncate">{node.name}</span>
        </button>
        <AnimatePresence>
          {open && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {node.children.map((child) => (
                <FileTreeNode
                  key={child.path}
                  node={child}
                  depth={depth + 1}
                  activeFile={activeFile}
                  onSelect={onSelect}
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
    <button
      onClick={() => onSelect(node.path)}
      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <File className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
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
          <div className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider mb-1">
            {msg.agent_type}
          </div>
        )}
        <span className="whitespace-pre-wrap">{msg.content}</span>
        {msg.streaming && (
          <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
          <User size={16} />
        </div>
      )}
    </motion.div>
  )
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator({ step }: { step: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3 justify-start"
    >
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={16} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-border/50 bg-transparent text-sm flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span className="text-muted-foreground">{step || "Thinking…"}</span>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WorkspaceIDEPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  // Workspace meta
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [loadingMeta, setLoadingMeta] = useState(true)

  // Chat
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [agentState, setAgentState] = useState<AgentState>("idle")
  const [thinkingStep, setThinkingStep] = useState("")

  // File tree
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingFile, setLoadingFile] = useState(false)

  // Connection
  const [connected, setConnected] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Socket ──────────────────────────────────────────────────────────────────

  const { sendChat, requestFileTree, readFile, socket } = useSocket({
    workspaceId: id,
    onAgentStream: ({ token, project_id }) => {
      if (project_id !== id) return
      setAgentState("coding")
      setThinkingStep("")
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.streaming) {
          return [...prev.slice(0, -1), { ...last, content: last.content + token }]
        }
        const newMsg: Message = {
          id: makeId(),
          role: "agent",
          content: token,
          created_at: new Date().toISOString(),
          streaming: true,
        }
        return [...prev, newMsg]
      })
    },
    onAgentComplete: ({ project_id }) => {
      if (project_id !== id) return
      setAgentState("idle")
      setStreamingId(null)
      setSending(false)
      // Mark last streaming message as done
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 && m.streaming ? { ...m, streaming: false } : m))
      )
      // Refresh file tree after agent finishes
      requestFileTree()
    },
    onAgentThinking: ({ project_id, step }) => {
      if (project_id !== id) return
      setAgentState("thinking")
      setThinkingStep(step)
    },
    onFileChanged: ({ project_id }) => {
      if (project_id !== id) return
      requestFileTree()
    },
    onError: ({ message }) => {
      toast.error(message)
      setSending(false)
      setAgentState("idle")
    },
  })

  // Track connection status
  useEffect(() => {
    const sock = socket.current
    if (!sock) return
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    sock.on("connect", onConnect)
    sock.on("disconnect", onDisconnect)
    sock.on("file:tree", ({ tree }: { tree: FileNode[] }) => setFileTree(tree || []))
    sock.on("file:content", ({ content, path }: { content: string; path: string }) => {
      setFileContent(content)
      setLoadingFile(false)
    })
    return () => {
      sock.off("connect", onConnect)
      sock.off("disconnect", onDisconnect)
      sock.off("file:tree")
      sock.off("file:content")
    }
  }, [socket.current])

  // ── Load workspace + history ────────────────────────────────────────────────

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
          id: m.id,
          role: m.role === "user" ? "user" : "agent",
          agent_type: m.agent_type,
          content: m.content,
          created_at: m.created_at,
        }))
        if (history.length === 0) {
          setMessages([{
            id: makeId(),
            role: "agent",
            content: "Hello! I'm Marscoder AI. What would you like to build today?",
            created_at: new Date().toISOString(),
          }])
        } else {
          setMessages(history)
        }
      } catch (e: any) {
        toast.error("Failed to load workspace.")
      } finally {
        setLoadingMeta(false)
        setLoadingHistory(false)
      }
    }
    load()
  }, [id])

  // Load file tree once socket connects
  useEffect(() => {
    if (connected && id) {
      requestFileTree()
    }
  }, [connected, id])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, agentState])

  // ── Send message ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const text = input.trim()
      if (!text || sending) return

      setSending(true)
      setInput("")
      setAgentState("thinking")
      setThinkingStep("Processing your request…")

      // Optimistically add user message
      const userMsg: Message = {
        id: makeId(),
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])

      // Persist to DB
      try {
        await api.post(
          `/api/workspaces/${id}/messages`,
          { content: text },
          { headers: authHeader() }
        )
      } catch {
        // non-fatal — socket will still fire
      }

      // Send to agent via Socket.io
      sendChat(text)
    },
    [input, sending, id, sendChat]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileSelect = (path: string) => {
    setActiveFile(path)
    setFileContent(null)
    setLoadingFile(true)
    readFile(path)
  }

  const isPanelOpen = agentState !== "idle" || fileTree.length > 0 || activeFile !== null

  if (loadingMeta) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* ── Chat Area ───────────────────────────────────────────────────────── */}
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
            <Badge
              variant="outline"
              className={`ml-1 text-[10px] px-2 py-0 h-5 shrink-0 ${
                agentState !== "idle" ? "border-blue-500/30 text-blue-500 animate-pulse" : ""
              }`}
            >
              {agentState === "idle" ? workspace?.status ?? "ready" : agentState}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            {connected ? (
              <><Wifi className="w-3.5 h-3.5 text-green-500" /> <span className="hidden sm:inline">Connected</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5 text-red-400" /> <span className="hidden sm:inline">Reconnecting…</span></>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef as any}>
          <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-36">
            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
            )}

            <AnimatePresence>
              {agentState === "thinking" && (
                <TypingIndicator step={thinkingStep} />
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Floating Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative shadow-xl rounded-2xl overflow-hidden border border-border/50 bg-card focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Marscoder to build something…"
                disabled={sending}
                className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 bg-transparent py-4 pl-4 pr-14 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sending}
                className="absolute right-2 bottom-2 rounded-xl h-8 w-8"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </Button>
            </form>
            <p className="text-center mt-2 text-[10px] text-muted-foreground">
              Marscoder AI can make mistakes. Review important changes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel (slides in when agent is active or files exist) ─────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="border-l border-border/40 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden shadow-2xl"
          >
            {/* Panel header */}
            <div className="h-14 border-b border-border/40 flex items-center px-4 shrink-0 bg-muted/20">
              <div className="flex items-center gap-2">
                {agentState === "thinking" || agentState === "planning" ? (
                  <FileText className="w-4 h-4 text-primary" />
                ) : (
                  <Code2 className="w-4 h-4 text-primary" />
                )}
                <span className="font-semibold text-sm">
                  {activeFile ? activeFile.split("/").pop() : "File Explorer"}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {agentState !== "idle" && (
                  <Badge variant="outline" className="text-[10px] px-2 h-5 border-primary/30 text-primary animate-pulse">
                    {agentState === "thinking" ? "Thinking…" : agentState === "planning" ? "Planning…" : "Coding live"}
                  </Badge>
                )}
                {activeFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    onClick={() => { setActiveFile(null); setFileContent(null) }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-3">
              <AnimatePresence mode="wait">
                {/* File content view */}
                {activeFile && (
                  <motion.div
                    key="file-content"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loadingFile ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <pre className="text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap break-all bg-muted/30 p-3 rounded-xl">
                        {fileContent ?? "Empty file"}
                      </pre>
                    )}
                  </motion.div>
                )}

                {/* File tree */}
                {!activeFile && (agentState === "thinking" || agentState === "planning") && (
                  <motion.div
                    key="planning"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                      <h3 className="font-medium mb-3 text-sm flex items-center gap-2">
                        <CircleDashed className="w-4 h-4 text-primary animate-spin" />
                        {thinkingStep || "Analyzing Request"}
                      </h3>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-muted rounded animate-pulse" />
                        <div className="h-2 w-4/5 bg-muted rounded animate-pulse" />
                        <div className="h-2 w-5/6 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* File tree (coding / idle with files) */}
                {!activeFile && (agentState === "coding" || agentState === "idle") && fileTree.length > 0 && (
                  <motion.div
                    key="file-tree"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Explorer
                    </div>
                    <div className="space-y-0.5">
                      {fileTree.map((node) => (
                        <FileTreeNode
                          key={node.path}
                          node={node}
                          activeFile={activeFile}
                          onSelect={handleFileSelect}
                        />
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-xl border border-border/50 bg-background/50 text-[11px] text-muted-foreground">
                      Click a file to view its content.
                    </div>
                  </motion.div>
                )}

                {/* Empty state — agent idle, no files yet */}
                {!activeFile && agentState === "idle" && fileTree.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <Code2 className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Files will appear here once the agent starts coding.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
