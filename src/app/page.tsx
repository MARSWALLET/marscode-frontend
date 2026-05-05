"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { Code2, Cpu, Globe, LayoutTemplate, Sparkles, Terminal, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">Marscoder</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#docs" className="hover:text-foreground transition-colors">Documentation</Link>
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-2">
              <Button variant="ghost" className="font-medium" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="font-medium" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-32">
        {/* Hero Section */}
        <motion.section 
          className="flex flex-col items-center text-center max-w-4xl mx-auto pt-10 pb-20"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="mb-6">
            <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline-block text-primary" />
              Meet Marscoder AI
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8"
          >
            The autonomous AI that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              builds software for you
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            Experience the world's most capable AI software engineer. Marscoder doesn't just assist—it writes, debugs, and deploys full-stack applications autonomously.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="xl" className="rounded-full font-semibold px-8" asChild>
              <Link href="/dashboard">Start Building Free</Link>
            </Button>
            <Button size="xl" variant="outline" className="rounded-full font-semibold px-8" asChild>
              <Link href="/docs">View Capabilities</Link>
            </Button>
          </motion.div>
        </motion.section>

        {/* Bento Grid Features */}
        <motion.section 
          id="features"
          className="pt-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">A complete ecosystem</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to orchestrate complex AI logic, compiled into a single beautiful interface.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Feature 1 (Large) */}
            <motion.div 
              variants={fadeIn}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={120} />
              </div>
              <div className="relative z-10">
                <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-6">
                  <Zap className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Multi-Model Orchestration</h3>
                <p className="text-muted-foreground text-lg max-w-md">Seamlessly fallback between DeepSeek, Anthropic, and OpenAI. Our factory ensures 99.99% uptime for your agents.</p>
              </div>
            </motion.div>

            {/* Feature 2 (Small) */}
            <motion.div 
              variants={fadeIn}
              className="group rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm"
            >
              <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-6">
                <Globe className="text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Docker Sandboxing</h3>
              <p className="text-muted-foreground">Secure execution environments isolated natively in real-time.</p>
            </motion.div>

            {/* Feature 3 (Small) */}
            <motion.div 
              variants={fadeIn}
              className="group rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm"
            >
              <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-6">
                <LayoutTemplate className="text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Real-time Collab</h3>
              <p className="text-muted-foreground">Watch agents write code live alongside your team.</p>
            </motion.div>

            {/* Feature 4 (Large) */}
            <motion.div 
              variants={fadeIn}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 hover:border-border transition-colors shadow-sm"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code2 size={120} />
              </div>
              <div className="relative z-10">
                <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-6">
                  <Terminal className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Extensible Architecture</h3>
                <p className="text-muted-foreground text-lg max-w-md">Plug in your own tools, scripts, and endpoints. Marscoder adapts to any proprietary tech stack you throw at it.</p>
              </div>
            </motion.div>

          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <Terminal size={18} />
            <span className="font-semibold tracking-tight">Marscoder</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marscoder Inc. Built for the next generation.
          </p>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
