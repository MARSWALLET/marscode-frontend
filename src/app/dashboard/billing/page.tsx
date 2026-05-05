"use client"

import React from "react"
import { motion } from "framer-motion"
import { CreditCard, Zap, CheckCircle2, AlertCircle, Wallet, ArrowUpRight, History } from "lucide-react"

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

export default function BillingPage() {
  return (
    <div className="w-full h-full flex flex-col py-4 pb-20">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-2">Billing & Usage</h1>
        <p className="text-muted-foreground text-lg">Manage your subscriptions, tokens, and payment methods via Korapay.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Credits & Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="md:col-span-2 p-8 rounded-3xl border border-border/50 bg-card shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                <Wallet className="w-5 h-5" />
                Current Balance
              </div>
              <div className="flex items-end gap-3 mb-6">
                <h2 className="text-5xl font-bold tracking-tight">$42.50</h2>
                <span className="text-muted-foreground mb-1">USD</span>
              </div>
              
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-sm font-medium">
                  <span>Usage this month</span>
                  <span>$12.50 / $55.00 limit</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 w-[22%]"></div>
                </div>
                <p className="text-xs text-muted-foreground">Approx. 4.2M tokens used across DeepSeek & Anthropic models.</p>
              </div>
              
              <div className="flex gap-4">
                <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                  <ArrowUpRight className="mr-2 w-4 h-4" />
                  Top Up Credits
                </Button>
                <Button variant="outline" size="lg" className="rounded-xl">Manage Auto-recharge</Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-border/50 bg-primary/5 shadow-sm flex flex-col">
            <div className="mb-4">
              <Badge className="bg-primary text-primary-foreground mb-4">Current Plan</Badge>
              <h3 className="text-2xl font-bold mb-2">Pro Developer</h3>
              <p className="text-sm text-muted-foreground">Renews on Oct 15, 2026 for $20.00/mo.</p>
            </div>
            
            <div className="space-y-3 mt-4 mb-8 flex-1">
              {["GPT-4o & Opus Access", "10 Concurrent Agents", "Priority Docker Sandboxes", "Advanced Webhooks"].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            <Button variant="secondary" className="w-full rounded-xl">Upgrade Plan</Button>
          </motion.div>
        </div>

        {/* Pricing Tiers */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-4">Subscription Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Free */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card">
              <h4 className="font-semibold text-lg mb-1">Hobby</h4>
              <div className="mb-4"><span className="text-3xl font-bold">$0</span><span className="text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground mb-6">Perfect for exploring the capabilities of autonomous AI.</p>
              <Button variant="outline" className="w-full rounded-xl mb-6" disabled>Current Base Plan</Button>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> DeepSeek & Haiku Models</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> 1 Concurrent Agent</div>
              </div>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-3xl border-2 border-primary bg-card relative shadow-xl shadow-primary/5">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Active
              </div>
              <h4 className="font-semibold text-lg mb-1">Pro Developer</h4>
              <div className="mb-4"><span className="text-3xl font-bold">$20</span><span className="text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground mb-6">For engineers building real production systems.</p>
              <Button className="w-full rounded-xl mb-6 shadow-md shadow-primary/20">Manage Plan</Button>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> All Frontier Models</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> 10 Concurrent Agents</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited Workspaces</div>
              </div>
            </div>

            {/* Team */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card">
              <h4 className="font-semibold text-lg mb-1">Enterprise</h4>
              <div className="mb-4"><span className="text-3xl font-bold">$99</span><span className="text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground mb-6">Dedicated resources and team collaboration.</p>
              <Button variant="secondary" className="w-full rounded-xl mb-6">Upgrade to Enterprise</Button>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Custom Model Fine-tuning</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> 50+ Concurrent Agents</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Advanced RBAC</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Invoice History */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <Button variant="ghost" size="sm" className="text-primary"><History className="w-4 h-4 mr-2"/>View All</Button>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">Oct 01, 2026</td>
                  <td className="px-6 py-4 font-medium">Credits Top-up (Korapay)</td>
                  <td className="px-6 py-4 font-mono">$50.00</td>
                  <td className="px-6 py-4"><Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Successful</Badge></td>
                  <td className="px-6 py-4 text-right"><Button variant="link" size="sm">Download</Button></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">Sep 15, 2026</td>
                  <td className="px-6 py-4 font-medium">Pro Developer Subscription</td>
                  <td className="px-6 py-4 font-mono">$20.00</td>
                  <td className="px-6 py-4"><Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Paid</Badge></td>
                  <td className="px-6 py-4 text-right"><Button variant="link" size="sm">Download</Button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
