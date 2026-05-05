"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Mock API call delay
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Create new password</h2>
        <p className="text-muted-foreground text-sm">
          Your new password must be different from previous used passwords.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={onSubmit} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  minLength={8}
                  className="pl-10 h-12 rounded-xl border-border/60"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  minLength={8}
                  className="pl-10 h-12 rounded-xl border-border/60"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-medium mt-4 shadow-lg shadow-primary/20 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Resetting password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset Password
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Password Reset Successfully</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <Button className="w-full rounded-xl" asChild>
              <Link href="/login">Return to Login</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
