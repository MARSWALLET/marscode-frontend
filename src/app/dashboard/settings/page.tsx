"use client"

import React from "react"
import { motion } from "framer-motion"
import { User, Key, Bell, Shield, Save, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

export default function SettingsPage() {
  return (
    <div className="w-full h-full flex flex-col py-4 pb-20">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account preferences and API keys.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Settings Navigation */}
        <motion.div 
          className="lg:w-64 shrink-0 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="secondary" className="w-full justify-start rounded-xl font-medium">
            <User className="mr-3 w-4 h-4" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground font-medium">
            <Shield className="mr-3 w-4 h-4" /> Security
          </Button>
          <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground font-medium">
            <Key className="mr-3 w-4 h-4" /> API Keys
          </Button>
          <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground font-medium">
            <Bell className="mr-3 w-4 h-4" /> Notifications
          </Button>
        </motion.div>

        {/* Settings Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 space-y-8 max-w-3xl"
        >
          {/* Profile Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Profile Information</h2>
              <p className="text-muted-foreground">Update your personal details and public profile.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-border/50 bg-card space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  JS
                </div>
                <div>
                  <Button variant="outline" className="rounded-xl mr-3">Upload Avatar</Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl">Remove</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input type="text" defaultValue="John" className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input type="text" defaultValue="Smith" className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" defaultValue="john.smith@example.com" disabled className="w-full px-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Contact support to change your email address.</p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.section>

          {/* API Keys Section */}
          <motion.section variants={itemVariants} className="space-y-6 pt-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Developer API Keys</h2>
              <p className="text-muted-foreground">Manage your keys to access Marscoder endpoints externally.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-border/50 bg-card space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border/40">
                <div>
                  <h3 className="font-semibold text-lg">Production Key</h3>
                  <p className="text-sm text-muted-foreground">Created 2 months ago</p>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Active</Badge>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-3 font-mono text-sm flex items-center justify-between text-muted-foreground">
                  mc_live_8f92********************3a2c
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-foreground">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" className="rounded-xl shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">Revoke</Button>
              </div>
              
              <div className="pt-4">
                <Button variant="secondary" className="w-full rounded-xl">
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </div>
          </motion.section>
        </motion.div>

      </div>
    </div>
  )
}
