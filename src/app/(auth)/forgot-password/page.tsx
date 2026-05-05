"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
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
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Reset password</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email address and we'll send you a link to reset your password.
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
              <label className="text-sm font-medium leading-none">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  className="pl-10 h-12 rounded-xl border-border/60"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-medium mt-4 shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Sending link...
                </span>
              ) : (
                "Send Reset Link"
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
            <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to your email. It may take a few minutes to arrive.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
