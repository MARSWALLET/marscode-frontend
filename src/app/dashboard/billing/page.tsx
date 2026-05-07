"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  CreditCard, Zap, CheckCircle2, Wallet, ArrowUpRight,
  History, Loader2, AlertCircle, TrendingUp, Calendar,
  ExternalLink, X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Plan {
  id: string
  name: string
  tier: string
  billing_period: string
  price_usd: number
  monthly_token_limit: number
  max_projects: number
  credits_on_activation: number
  features: string[]
}

interface Subscription {
  status: string
  plan?: {
    name: string
    tier: string
    price_usd: number
    billing_period: string
    monthly_token_limit: number
    features: string[]
  }
  trial_ends_at?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
}

interface UsageSummary {
  total_tokens: number
  total_cost_usd: number
  total_requests: number
  monthly_token_limit: number
  token_usage_pct: number
  credits_balance: number
  monthly_budget: number
}

interface Transaction {
  id: string
  amount: number
  currency: string
  description: string
  payment_method: string | null
  status: string
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function authToken() {
  return typeof window !== "undefined" ? localStorage.getItem("marscoder_access_token") ?? "" : ""
}

function fmt(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "text-green-500 border-green-500/30 bg-green-500/10",
    pending: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    failed: "text-red-500 border-red-500/30 bg-red-500/10",
    refunded: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  }
  return (
    <Badge variant="outline" className={`text-xs ${map[status] ?? ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  free: ["DeepSeek & Haiku Models", "1 Concurrent Agent", "3 Projects"],
  pro: ["All Frontier Models", "10 Concurrent Agents", "Unlimited Projects", "Priority Sandboxes"],
  enterprise: ["Custom Fine-tuning", "50+ Concurrent Agents", "Dedicated Resources", "Advanced RBAC"],
}

const PLAN_COLORS: Record<string, string> = {
  free: "border-border/50",
  pro: "border-2 border-primary shadow-xl shadow-primary/5",
  enterprise: "border-border/50",
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ── Top-up Modal ──────────────────────────────────────────────────────────────

const TOPUP_AMOUNTS = [5, 10, 20, 50, 100]

function TopUpModal({ onClose, korapayKey }: { onClose: () => void; korapayKey: string }) {
  const [amount, setAmount] = useState(20)
  const [custom, setCustom] = useState("")
  const [loading, setLoading] = useState(false)

  const finalAmount = custom ? parseFloat(custom) : amount

  const handleTopup = async () => {
    if (!finalAmount || finalAmount < 1) return
    setLoading(true)
    try {
      const res = await api.post(
        `/api/billing/topup`,
        finalAmount,
        { headers: { "Content-Type": "application/json" } }
      )
      const url = res.data?.checkout_url
      if (url) {
        window.open(url, "_blank")
        onClose()
        toast.success("Redirecting to Korapay checkout…")
      } else {
        toast.error("No checkout URL returned.")
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to create checkout.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-5 right-5 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-1">Top Up Credits</h2>
        <p className="text-muted-foreground text-sm mb-6">Credits are used for AI model API calls and compute.</p>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {TOPUP_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setCustom("") }}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                amount === a && !custom
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "border-border/50 bg-muted/30 hover:bg-muted text-foreground"
              }`}
            >
              ${a}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-1.5 block">Custom amount (USD)</label>
          <input
            type="number"
            min="1"
            max="500"
            placeholder="e.g. 35"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">You will pay</span>
          <span className="text-2xl font-bold">${finalAmount || 0}.00</span>
        </div>

        <Button
          className="w-full rounded-xl shadow-lg shadow-primary/20 h-11"
          onClick={handleTopup}
          disabled={loading || !finalAmount || finalAmount < 1}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
          {loading ? "Redirecting…" : "Pay with Korapay"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Secured by Korapay · Credits added instantly on payment confirmation
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopup, setShowTopup] = useState(false)
  const [korapayKey, setKorapayKey] = useState("")

  useEffect(() => {
    const load = async () => {
      const token = authToken()
      try {
        const [usageRes, subRes, plansRes, txRes, pricingRes] = await Promise.allSettled([
          api.get(`/api/billing/usage?days=30`),
          api.get(`/api/billing/subscription`),
          api.get(`/api/billing/plans`),
          api.get(`/api/billing/transactions?limit=10`),
          api.get(`/api/billing/pricing`),
        ])

        if (usageRes.status === "fulfilled") setUsage(usageRes.value.data)
        if (subRes.status === "fulfilled") setSubscription(subRes.value.data)
        if (plansRes.status === "fulfilled") setPlans(plansRes.value.data.plans ?? [])
        if (txRes.status === "fulfilled") setTransactions(txRes.value.data.transactions ?? [])
        if (pricingRes.status === "fulfilled") setKorapayKey(pricingRes.value.data.korapay_public_key ?? "")
      } catch {
        toast.error("Failed to load billing data.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentTier = subscription?.plan?.tier ?? "free"
  const creditsBalance = usage?.credits_balance ?? 0
  const tokenUsagePct = usage?.token_usage_pct ?? 0
  const tokensUsed = usage?.total_tokens ?? 0
  const tokenLimit = usage?.monthly_token_limit ?? 100_000
  const costThisMonth = usage?.total_cost_usd ?? 0

  return (
    <div className="w-full h-full flex flex-col py-4 pb-20">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Billing & Usage</h1>
        <p className="text-muted-foreground text-lg">Manage your plan, credits, and transactions.</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

        {/* ── Credits + Subscription ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Credits card */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 p-8 rounded-3xl border border-border/50 bg-card shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Zap size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
                <Wallet className="w-4 h-4" /> Current Balance
              </div>
              {loading ? (
                <div className="h-14 w-40 bg-muted animate-pulse rounded-2xl mb-6" />
              ) : (
                <div className="flex items-end gap-3 mb-6">
                  <h2 className="text-5xl font-bold tracking-tight">{fmtMoney(creditsBalance)}</h2>
                  <span className="text-muted-foreground mb-1">USD</span>
                </div>
              )}

              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-sm font-medium">
                  <span>Token usage this month</span>
                  <span className="font-mono">
                    {tokensUsed.toLocaleString()} / {tokenLimit === 0 ? "∞" : tokenLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all duration-700 ${tokenUsagePct > 85 ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${Math.min(tokenUsagePct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {tokenUsagePct.toFixed(1)}% used · {fmtMoney(costThisMonth)} spent this month
                  </p>
                  {tokenUsagePct > 80 && (
                    <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                      <AlertCircle className="w-3 h-3" /> Approaching limit
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20" onClick={() => setShowTopup(true)}>
                  <ArrowUpRight className="mr-2 w-4 h-4" /> Top Up Credits
                </Button>
                <Button variant="outline" size="lg" className="rounded-xl">
                  <TrendingUp className="mr-2 w-4 h-4" /> Usage Details
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Current plan card */}
          <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-border/50 bg-primary/5 shadow-sm flex flex-col">
            <div className="mb-4">
              <Badge className="bg-primary text-primary-foreground mb-4 text-xs">Current Plan</Badge>
              {loading ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded-xl mb-2" />
              ) : (
                <h3 className="text-2xl font-bold mb-1 capitalize">
                  {subscription?.plan?.name ?? "Free"}
                </h3>
              )}
              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Renews {fmt(subscription.current_period_end)}
                </p>
              )}
              {subscription?.cancel_at_period_end && (
                <p className="text-xs text-orange-500 mt-1">Cancels at period end</p>
              )}
            </div>

            <div className="space-y-2.5 mt-3 mb-8 flex-1">
              {(PLAN_HIGHLIGHTS[currentTier] ?? PLAN_HIGHLIGHTS.free).map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <Button variant="secondary" className="w-full rounded-xl">
              {currentTier === "free" ? "Upgrade Plan" : "Manage Plan"}
            </Button>
          </motion.div>
        </div>

        {/* ── Subscription Tiers ── */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-4">Subscription Tiers</h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-card border border-border/40 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            /* Fallback static plans if DB has none seeded yet */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { tier: "free", name: "Hobby", price: 0, desc: "Perfect for exploring the capabilities of autonomous AI.", features: PLAN_HIGHLIGHTS.free },
                { tier: "pro", name: "Pro Developer", price: 20, desc: "For engineers building real production systems.", features: PLAN_HIGHLIGHTS.pro },
                { tier: "enterprise", name: "Enterprise", price: 99, desc: "Dedicated resources and team collaboration.", features: PLAN_HIGHLIGHTS.enterprise },
              ].map((p) => {
                const isActive = currentTier === p.tier
                return (
                  <div key={p.tier} className={`p-6 rounded-3xl bg-card relative ${PLAN_COLORS[p.tier]}`}>
                    {isActive && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Active
                      </div>
                    )}
                    <h4 className="font-semibold text-lg mb-1">{p.name}</h4>
                    <div className="mb-3">
                      <span className="text-3xl font-bold">${p.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">{p.desc}</p>
                    <Button
                      variant={isActive ? "default" : "secondary"}
                      className="w-full rounded-xl mb-5"
                      disabled={isActive && p.tier === "free"}
                    >
                      {isActive ? (p.tier === "free" ? "Current Plan" : "Manage Plan") : `Upgrade to ${p.name}`}
                    </Button>
                    <div className="space-y-2.5">
                      {p.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => {
                const isActive = currentTier === p.tier
                return (
                  <div key={p.id} className={`p-6 rounded-3xl bg-card relative ${PLAN_COLORS[p.tier] ?? "border border-border/50"}`}>
                    {isActive && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Active
                      </div>
                    )}
                    <h4 className="font-semibold text-lg mb-1">{p.name}</h4>
                    <div className="mb-3">
                      <span className="text-3xl font-bold">${p.price_usd}</span>
                      <span className="text-muted-foreground">/{p.billing_period}</span>
                    </div>
                    <Button
                      variant={isActive ? "default" : "secondary"}
                      className="w-full rounded-xl mb-5"
                      disabled={isActive && p.tier === "free"}
                    >
                      {isActive ? (p.tier === "free" ? "Current Plan" : "Manage") : "Upgrade"}
                    </Button>
                    <div className="space-y-2.5">
                      {(p.features?.length ? p.features : PLAN_HIGHLIGHTS[p.tier] ?? []).map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* ── Transaction History ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              <History className="w-4 h-4 mr-2" /> View All
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {loading ? (
              <div className="divide-y divide-border/40">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No transactions yet. Top up your credits to get started.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Date</th>
                    <th className="px-6 py-3.5 font-medium">Description</th>
                    <th className="px-6 py-3.5 font-medium">Amount</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{fmt(tx.created_at)}</td>
                      <td className="px-6 py-4 font-medium max-w-xs truncate">{tx.description}</td>
                      <td className={`px-6 py-4 font-mono font-semibold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {tx.amount >= 0 ? "+" : ""}{fmtMoney(tx.amount)}
                      </td>
                      <td className="px-6 py-4">{statusBadge(tx.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* Top-up Modal */}
      {showTopup && (
        <TopUpModal onClose={() => setShowTopup(false)} korapayKey={korapayKey} />
      )}
    </div>
  )
}
