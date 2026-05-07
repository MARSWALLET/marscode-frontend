import { useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface UseSocketOptions {
  workspaceId: string
  onAgentStream?: (data: { token: string; project_id: string }) => void
  onAgentComplete?: (data: { project_id: string; message?: string }) => void
  onAgentThinking?: (data: { project_id: string; step: string }) => void
  onFileChanged?: (data: { project_id: string; path: string }) => void
  onError?: (data: { message: string }) => void
}

export function useSocket({
  workspaceId,
  onAgentStream,
  onAgentComplete,
  onAgentThinking,
  onFileChanged,
  onError,
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
      // Subscribe to the workspace's real-time room
      socket.emit("agent:subscribe", { project_id: workspaceId })
    })

    socket.on("agent:stream", (data) => onAgentStream?.(data))
    socket.on("agent:complete", (data) => onAgentComplete?.(data))
    socket.on("agent:thinking", (data) => onAgentThinking?.(data))
    socket.on("project:file_changed", (data) => onFileChanged?.(data))
    socket.on("error", (data) => onError?.(data))

    return () => {
      socket.emit("agent:unsubscribe", { project_id: workspaceId })
      socket.disconnect()
      socketRef.current = null
    }
  }, [workspaceId, token])

  const sendChat = useCallback(
    (content: string) => {
      socketRef.current?.emit("chat:message", {
        project_id: workspaceId,
        message: content,
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

  return { sendChat, requestFileTree, readFile, isConnected, socket: socketRef }
}
