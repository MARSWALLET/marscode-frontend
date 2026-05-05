"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ShieldAlert, AlertOctagon, Power, Database, CloudOff, Lock, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function AdminConfigPage() {
  // Mock state for the toggles
  const [toggles, setToggles] = useState({
    maintenance: false,
    newSignups: true,
    deepseekFallback: true,
    korapayBilling: true,
    dockerExecution: true,
  })

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full h-full flex flex-col py-4">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            System Config 
            <span className="bg-destructive/10 text-destructive text-sm font-bold px-3 py-1 rounded-full border border-destructive/20 uppercase tracking-wider">
              Danger Zone
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage global platform state and kill switches.</p>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Core Kill Switches */}
        <motion.section variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Power className="w-5 h-5 text-destructive" /> Emergency Controls
          </h2>
          <div className="space-y-4">
            
            {/* Maintenance Mode */}
            <div className={`p-6 rounded-3xl border transition-colors ${toggles.maintenance ? 'bg-destructive/10 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-card border-border/50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertOctagon className={`w-5 h-5 ${toggles.maintenance ? 'text-destructive' : 'text-muted-foreground'}`} />
                    Maintenance Mode
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Forces all active user sessions to log out and displays a maintenance page. Admins are exempt.
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('maintenance')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background ${toggles.maintenance ? 'bg-destructive' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.maintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Stop New Signups */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    Allow New Signups
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    When disabled, the `/signup` route will be locked. Existing users can still log in.
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('newSignups')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${toggles.newSignups ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.newSignups ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

          </div>
        </motion.section>

        {/* Integration Toggles */}
        <motion.section variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CloudOff className="w-5 h-5 text-muted-foreground" /> Integrations & Routing
          </h2>
          <div className="space-y-4">
            
            {/* DeepSeek Fallback */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    DeepSeek Fallback Routing
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    If Anthropic/OpenAI APIs degrade, automatically route generation requests to DeepSeek models.
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('deepseekFallback')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${toggles.deepseekFallback ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.deepseekFallback ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Docker Execution */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                    Live Docker Execution
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Allow AI agents to spin up and execute code in isolated Docker containers on the host.
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('dockerExecution')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${toggles.dockerExecution ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.dockerExecution ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Korapay Webhooks */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    Korapay Webhooks
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Process incoming top-up events. Disabling this will queue events in the DB without fulfilling credits.
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('korapayBilling')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${toggles.korapayBilling ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.korapayBilling ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

          </div>
        </motion.section>
      </motion.div>
      
      {/* Save Action */}
      <motion.div variants={itemVariants} className="mt-10 flex justify-end">
        <Button className="rounded-xl px-8 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          Apply Configuration
        </Button>
      </motion.div>
    </div>
  )
}
