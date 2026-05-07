"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Key, Shield, Save, Loader2, Check, AlertTriangle,
  Eye, EyeOff, ChevronRight, Camera, Trash2, LogOut,
  Copy, CheckCheck,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  tier: string
  credits_balance: number
  created_at: string | null
}

type ActiveSection = "profile" | "security" | "api-keys"

// ── Helpers ───────────────────────────────────────────────────────────────────

function authToken() {
  return typeof window !== "undefined" ? localStorage.getItem("marscoder_access_token") ?? "" : ""
}

function initials(name: string | null, email: string) {
  if (name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ── Input ─────────────────────────────────────────────────────────────────────

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  className = "",
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  type?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:bg-muted/50 disabled:text-muted-foreground disabled:cursor-not-allowed ${className}`}
    />
  )
}

// ── Nav Item ──────────────────────────────────────────────────────────────────

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      {active && <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  )
}

// ── Delete Account Modal ──────────────────────────────────────────────────────

function DeleteAccountModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState("")
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card border border-destructive/30 rounded-3xl shadow-2xl w-full max-w-md p-8"
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-1">Delete Account</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This will permanently delete your account, all workspaces, and all data. <strong>This cannot be undone.</strong>
        </p>
        <Field label='Type "delete my account" to confirm'>
          <TextInput value={typed} onChange={setTyped} placeholder="delete my account" />
        </Field>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1 rounded-xl"
            disabled={typed !== "delete my account"}
            onClick={onConfirm}
          >
            Delete Account
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const [active, setActive] = useState<ActiveSection>("profile")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile form
  const [name, setName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Password form
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  // API key
  const [copied, setCopied] = useState(false)

  // Delete modal
  const [showDelete, setShowDelete] = useState(false)

  // Load user
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/auth/me?token=${authToken()}`)
        const u = res.data
        setProfile(u)
        setName(u.name ?? "")
      } catch {
        toast.error("Failed to load profile.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await api.patch(
        `/api/auth/me?token=${authToken()}`,
        { full_name: name.trim() || null }
      )
      setProfile((p) => p ? { ...p, name: res.data.user.name } : p)
      setProfileSaved(true)
      toast.success("Profile updated.")
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to update profile.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPwd.length < 8) {
      toast.error("New password must be at least 8 characters.")
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords don't match.")
      return
    }
    setSavingPwd(true)
    try {
      await api.post(`/api/auth/change-password?token=${authToken()}`, {
        current_password: currentPwd,
        new_password: newPwd,
      })
      toast.success("Password updated successfully.")
      setCurrentPwd("")
      setNewPwd("")
      setConfirmPwd("")
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to change password.")
    } finally {
      setSavingPwd(false)
    }
  }

  const handleCopyApiKey = async () => {
    const key = `mc_live_${authToken().slice(0, 8)}••••••••••••••••`
    await navigator.clipboard.writeText(authToken())
    setCopied(true)
    toast.success("Token copied to clipboard.")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem("marscoder_access_token")
    localStorage.removeItem("marscoder_refresh_token")
    router.push("/login")
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete(`/api/auth/me?token=${authToken()}`)
      localStorage.removeItem("marscoder_access_token")
      localStorage.removeItem("marscoder_refresh_token")
      toast.success("Account deleted.")
      router.push("/")
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to delete account.")
    }
    setShowDelete(false)
  }

  const tierColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-primary text-primary-foreground",
    enterprise: "bg-purple-500/20 text-purple-400",
  }

  return (
    <div className="w-full h-full flex flex-col py-4 pb-20">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account, security, and API access.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar Nav ── */}
        <motion.div
          className="lg:w-56 shrink-0 space-y-1.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Avatar card */}
          {loading ? (
            <div className="p-5 rounded-2xl border border-border/50 bg-card mb-4">
              <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse mb-3" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          ) : profile && (
            <div className="p-5 rounded-2xl border border-border/50 bg-card mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-3">
                {initials(profile.name, profile.email)}
              </div>
              <p className="font-semibold text-sm truncate">{profile.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground truncate mb-2">{profile.email}</p>
              <Badge className={`text-[10px] px-2 capitalize ${tierColors[profile.tier] ?? ""}`}>
                {profile.tier}
              </Badge>
            </div>
          )}

          <NavItem icon={User} label="Profile" active={active === "profile"} onClick={() => setActive("profile")} />
          <NavItem icon={Shield} label="Security" active={active === "security"} onClick={() => setActive("security")} />
          <NavItem icon={Key} label="API Keys" active={active === "api-keys"} onClick={() => setActive("api-keys")} />

          <div className="pt-4 border-t border-border/40 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </motion.div>

        {/* ── Content ── */}
        <motion.div
          key={active}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 max-w-2xl space-y-8"
        >
          {/* ─ Profile Section ─ */}
          {active === "profile" && (
            <>
              <motion.section variants={itemVariants} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Profile Information</h2>
                  <p className="text-muted-foreground text-sm">Update your personal details.</p>
                </div>

                <div className="p-8 rounded-3xl border border-border/50 bg-card space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {profile ? initials(profile.name, profile.email) : "?"}
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-0.5">{profile?.email}</p>
                      <p>Avatar changes coming soon.</p>
                    </div>
                  </div>

                  {/* Name */}
                  <Field label="Display Name" note="This is how you appear across Marscoder.">
                    <TextInput
                      value={name}
                      onChange={setName}
                      placeholder="Your full name"
                      disabled={loading}
                    />
                  </Field>

                  {/* Email (read-only) */}
                  <Field label="Email Address" note="Contact support to change your email address.">
                    <TextInput value={profile?.email ?? ""} disabled />
                  </Field>

                  {/* Member since */}
                  {profile?.created_at && (
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      className="rounded-xl px-8"
                      onClick={handleSaveProfile}
                      disabled={savingProfile || loading}
                    >
                      {savingProfile ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : profileSaved ? (
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {profileSaved ? "Saved!" : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </motion.section>

              {/* Danger Zone */}
              <motion.section variants={itemVariants}>
                <div className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4">
                  <div>
                    <h3 className="font-bold text-destructive mb-1">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                    onClick={() => setShowDelete(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </div>
              </motion.section>
            </>
          )}

          {/* ─ Security Section ─ */}
          {active === "security" && (
            <motion.section variants={itemVariants} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Security</h2>
                <p className="text-muted-foreground text-sm">Update your password and session security.</p>
              </div>

              <div className="p-8 rounded-3xl border border-border/50 bg-card space-y-6">
                <h3 className="font-semibold text-lg">Change Password</h3>

                <Field label="Current Password">
                  <div className="relative">
                    <TextInput
                      value={currentPwd}
                      onChange={setCurrentPwd}
                      type={showCurrentPwd ? "text" : "password"}
                      placeholder="Your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="New Password" note="Must be at least 8 characters.">
                  <div className="relative">
                    <TextInput
                      value={newPwd}
                      onChange={setNewPwd}
                      type={showNewPwd ? "text" : "password"}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPwd && (
                    <div className="mt-2 flex gap-1">
                      {[8, 12, 16, 20].map((threshold, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPwd.length >= threshold
                              ? i < 1 ? "bg-red-500" : i < 2 ? "bg-orange-400" : i < 3 ? "bg-yellow-400" : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </Field>

                <Field label="Confirm New Password">
                  <TextInput
                    value={confirmPwd}
                    onChange={setConfirmPwd}
                    type="password"
                    placeholder="Repeat new password"
                    className={confirmPwd && confirmPwd !== newPwd ? "border-destructive/60 focus:ring-destructive/30" : ""}
                  />
                  {confirmPwd && confirmPwd !== newPwd && (
                    <p className="text-xs text-destructive mt-1">Passwords don't match.</p>
                  )}
                </Field>

                <div className="pt-2 flex justify-end">
                  <Button
                    className="rounded-xl px-8"
                    onClick={handleChangePassword}
                    disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
                  >
                    {savingPwd ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                    {savingPwd ? "Updating…" : "Update Password"}
                  </Button>
                </div>
              </div>

              {/* Google login notice */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 text-sm text-muted-foreground">
                <strong className="text-foreground">Logged in with Google?</strong> If you signed up via Google, you don't have a password on this account. You can still create one by entering your desired password above and leaving current password blank.
              </div>
            </motion.section>
          )}

          {/* ─ API Keys Section ─ */}
          {active === "api-keys" && (
            <motion.section variants={itemVariants} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Developer API Keys</h2>
                <p className="text-muted-foreground text-sm">Use your access token to call Marscoder APIs from external clients.</p>
              </div>

              <div className="p-8 rounded-3xl border border-border/50 bg-card space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Access Token</h3>
                    <p className="text-sm text-muted-foreground">Your personal Bearer token. Keep this secret.</p>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Active</Badge>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-3 font-mono text-xs flex items-center text-muted-foreground overflow-hidden">
                    <span className="truncate">
                      {authToken() ? `${authToken().slice(0, 20)}${"•".repeat(20)}` : "No token found"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl shrink-0 h-[42px] w-[42px]"
                    onClick={handleCopyApiKey}
                  >
                    {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 space-y-2 text-sm">
                  <p className="font-medium">Usage example:</p>
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
{`curl https://your-api.com/api/workspaces \\
  -H "Authorization: Bearer <your_token>"`}
                  </pre>
                </div>

                <p className="text-xs text-muted-foreground">
                  Your token expires in 24 hours. Use the refresh token to extend your session automatically.
                  To regenerate, log out and log back in.
                </p>
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDelete && (
          <DeleteAccountModal
            onClose={() => setShowDelete(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
