import React from "react"
import Link from "next/link"
import { Terminal, ChevronRight, BookOpen, Layers, Cpu, Code2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
              <Terminal size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight">Marscoder Docs</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Go to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 flex flex-col md:flex-row gap-8 py-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-3">Getting Started</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="text-foreground font-medium block px-2 py-1 bg-muted/50 rounded-md">Introduction</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">Quickstart</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">Authentication</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Core Concepts</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">Autonomous Agents</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">Docker Sandboxing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">Multi-model Routing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">API Reference</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">REST Endpoints</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors block px-2 py-1">Webhooks</Link></li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-3xl prose prose-neutral dark:prose-invert">
          <div className="mb-4 text-sm text-muted-foreground flex items-center gap-1">
            Docs <ChevronRight className="w-3 h-3" /> Getting Started <ChevronRight className="w-3 h-3" /> Introduction
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-4">Introduction to Marscoder</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Marscoder is an advanced AI engineering platform that provides autonomous agents capable of designing, building, and deploying software.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 not-prose mb-12">
            <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-colors cursor-pointer group">
              <BookOpen className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Quickstart Guide</h3>
              <p className="text-sm text-muted-foreground">Deploy your first autonomous agent in under 5 minutes.</p>
            </div>
            <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-colors cursor-pointer group">
              <Layers className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Architecture overview</h3>
              <p className="text-sm text-muted-foreground">Understand the sandboxing and multi-model fallbacks.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">How it works</h2>
          <p className="mb-4">
            Unlike standard LLM chat interfaces, Marscoder operates on a state-machine based agent architecture. When you submit a request, the system:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-8">
            <li><strong>Analyzes</strong> the intent using an orchestration model.</li>
            <li><strong>Plans</strong> the implementation, breaking it down into distinct file-level tasks.</li>
            <li><strong>Executes</strong> the code securely within an ephemeral Docker sandbox.</li>
            <li><strong>Verifies</strong> the build before presenting the final result to the user.</li>
          </ol>

          <div className="p-4 rounded-xl bg-muted border border-border/50 my-6 not-prose text-sm font-mono text-muted-foreground">
            <span className="text-primary">import</span> &#123; MarscoderClient &#125; <span className="text-primary">from</span> <span className="text-green-500">"@marscoder/sdk"</span>;<br/><br/>
            const client = new MarscoderClient(&#123; apiKey: process.env.MARSCODER_KEY &#125;);<br/>
            <br/>
            const agent = await client.agents.create(&#123; <br/>
            &nbsp;&nbsp;role: <span className="text-green-500">"fullstack_engineer"</span>, <br/>
            &nbsp;&nbsp;task: <span className="text-green-500">"Build a React dashboard"</span> <br/>
            &#125;);
          </div>

          <p className="mt-8">
            To get started with the API, generate an access token from your Dashboard Settings and proceed to the Authentication guide.
          </p>

          <div className="mt-12 pt-6 border-t border-border/40 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last updated: Oct 12, 2026</span>
            <Button variant="outline" size="sm">
              Next: Quickstart <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
