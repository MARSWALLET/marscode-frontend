import { useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface AgentThought {
  project_id: string
  agent: string
  thought: string
  step?: string
  timestamp?: string
}

export interface AgentResponse {
  project_id: string
  agent: string
  message: string
  actions?: any[]
  tokens_used?: number
}

export interface ProjectPlan {
  project_id: string
  plan: any
}

export interface ProjectError {
  project_id: string
  error: string
}

export interface ProjectComplete {
  project_id: string
  status: string
  files_count?: number
}

interface UseSocketOptions {
  workspaceId: string
  // Real backend events (what the orchestrator actually emits)
  onAgentThought?: (data: AgentThought) => void       // agent:thought — thinking steps
  onAgentResponse?: (data: AgentResponse) => void     // agent:response — final reply
  onProjectPlan?: (data: ProjectPlan) => void         // project:plan — plan generated
  onProjectComplete?: (data: ProjectComplete) => void // project:complete — done
  onProjectError?: (data: ProjectError) => void       // project:error — error
  onFileChanged?: (data: { project_id: string; path: string }) => void
  // Legacy / streaming events (kept for forward-compat)
  onAgentStream?: (data: { token: string; project_id: string }) => void
  onAgentComplete?: (data: { project_id: string; message?: string }) => void
}

export function useSocket({
  workspaceId,
  onAgentThought,
  onAgentResponse,
  onProjectPlan,
  onProjectComplete,
  onProjectError,
  onFileChanged,
  onAgentStream,
  onAgentComplete,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("marscoder_access_token")
      : null

  useEffect(() => {
    if (!workspaceId || !token) return

    const socket = io(API_URL, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("agent:subscribe", { project_id: workspaceId })
    })

    // ── Real backend events ───────────────────────────────────────────────────
    // Fired from orchestrator every time an agent emits a thought/progress step
    socket.on("agent:thought", (data) => onAgentThought?.(data))

    // Fired when an agent finishes and has a final response (chat mode)
    socket.on("agent:response", (data) => onAgentResponse?.(data))

    // Fired when the planner finishes creating an implementation plan
    socket.on("project:plan", (data) => onProjectPlan?.(data))

    // Fired when the full project pipeline completes
    socket.on("project:complete", (data) => {
      onProjectComplete?.(data)
      onAgentComplete?.(data)
    })

    // Fired on any unrecoverable error in the pipeline
    socket.on("project:error", (data) => onProjectError?.(data))

    // Fired when a file changes in the sandbox
    socket.on("project:file_changed", (data) => onFileChanged?.(data))

    // ── Legacy streaming events ───────────────────────────────────────────────
    socket.on("agent:stream", (data) => onAgentStream?.(data))
    socket.on("agent:complete", (data) => onAgentComplete?.(data))

    return () => {
      socket.emit("agent:unsubscribe", { project_id: workspaceId })
      socket.disconnect()
      socketRef.current = null
    }
  }, [workspaceId, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendChat = useCallback(
    (content: string) => {
      socketRef.current?.emit("chat:message", {
        project_id: workspaceId,
        message: content,
      })
    },
    [workspaceId]
  )

  const startProject = useCallback(
    (prompt: string, options?: Record<string, any>) => {
      socketRef.current?.emit("project:create", {
        project_id: workspaceId,
        prompt,
        options,
      })
    },
    [workspaceId]
  )

  const requestFileTree = useCallback(
    (path = ".") => {
      socketRef.current?.emit("file:list", { project_id: workspaceId, path })
    },
    [workspaceId]
  )

  const readFile = useCallback(
    (path: string) => {
      socketRef.current?.emit("file:read", { project_id: workspaceId, path })
    },
    [workspaceId]
  )

  const isConnected = () => socketRef.current?.connected ?? false

  return { sendChat, startProject, requestFileTree, readFile, isConnected, socket: socketRef }
}
