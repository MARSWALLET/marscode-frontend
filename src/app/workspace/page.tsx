"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Code2, FileText, CheckCircle2, CircleDashed } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type AgentState = "idle" | "planning" | "coding"

export default function WorkspacePage() {
  const [agentState, setAgentState] = useState<AgentState>("idle")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{role: "user"|"ai", text: string}[]>([
    { role: "ai", text: "Hello! I am Marscoder AI. What would you like to build today?" }
  ])
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Mock submission handler to demo the dynamic UI
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", text: input }])
    const currentInput = input
    setInput("")

    // Simulate Agent transitioning states based on keywords or just sequentially
    setTimeout(() => {
      setAgentState("planning")
      setMessages(prev => [...prev, { role: "ai", text: "Analyzing your request... I'll create an implementation plan first." }])
      
      setTimeout(() => {
        setAgentState("coding")
        setMessages(prev => [...prev, { role: "ai", text: "Plan approved internally. I'm now writing the code files." }])
      }, 4000)
    }, 1000)
  }

  // Handle textarea enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      
      {/* Center/Left Chat Area */}
      <div className="flex-1 flex flex-col relative transition-all duration-500 ease-in-out">
        {/* Chat History */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-32">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Bot size={18} />
                  </div>
                )}
                
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-muted text-foreground rounded-tr-sm' 
                    : 'bg-transparent border border-border/50 text-foreground'
                }`}>
                  {msg.text}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area (Floating at bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSubmit} className="relative shadow-lg rounded-2xl overflow-hidden border border-border/50 bg-card focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Marscoder to build something..."
                className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 bg-transparent py-4 pl-4 pr-14 text-sm"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim()}
                className="absolute right-2 bottom-2 rounded-xl h-8 w-8"
              >
                <Send size={16} />
              </Button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-muted-foreground">Marscoder AI can make mistakes. Check important changes.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Context Panel (Right Side) */}
      <AnimatePresence>
        {agentState !== "idle" && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="border-l border-border/40 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden shadow-2xl"
          >
            {/* Context Panel Header */}
            <div className="h-14 border-b border-border/40 flex items-center px-4 shrink-0 bg-muted/30">
              <div className="flex items-center gap-2">
                {agentState === "planning" ? (
                  <FileText className="w-4 h-4 text-primary" />
                ) : (
                  <Code2 className="w-4 h-4 text-primary" />
                )}
                <span className="font-semibold text-sm">
                  {agentState === "planning" ? "Implementation Plan" : "Workspace Files"}
                </span>
              </div>
              <Badge variant="outline" className="ml-auto bg-background animate-pulse">
                {agentState === "planning" ? "Generating..." : "Coding live"}
              </Badge>
            </div>

            {/* Context Panel Content */}
            <ScrollArea className="flex-1 p-4">
              <motion.div 
                key={agentState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {agentState === "planning" && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                      <h3 className="font-medium mb-3 text-sm flex items-center gap-2">
                        <CircleDashed className="w-4 h-4 text-primary animate-spin-slow" />
                        Analyzing Request
                      </h3>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-muted rounded animate-pulse" />
                        <div className="h-2 w-4/5 bg-muted rounded animate-pulse" />
                        <div className="h-2 w-5/6 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {agentState === "coding" && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Explorer</div>
                    
                    {/* Mock File Tree */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span>package.json</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span>src/app/globals.css</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 text-primary cursor-pointer text-sm font-medium">
                        <CircleDashed className="w-3.5 h-3.5 animate-spin-slow" />
                        <span>src/components/chat.tsx</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl border border-border/50 bg-background/50 text-xs text-muted-foreground">
                      The file tree tracks files modified during the active agent session. Click a file to view the code diff.
                    </div>
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
