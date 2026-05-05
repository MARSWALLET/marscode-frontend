"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight } from "lucide-react"

import { useGoogleLogin } from "@react-oauth/google"
import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const { login, googleLogin } = useAuth()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await login(email, password)
    setIsLoading(false)
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true)
      // Send the access_token or id_token to our backend
      await googleLogin(tokenResponse.access_token)
      setIsGoogleLoading(false)
    },
    onError: () => {
      console.error("Google Login Failed")
    }
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Log in to your Marscoder account to continue.
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Auth Button */}
        <Button 
          variant="outline" 
          onClick={() => handleGoogleLogin()}
          disabled={isGoogleLoading || isLoading}
          className="w-full h-12 rounded-xl text-base font-medium flex items-center justify-center gap-3 border-border/60 hover:bg-muted/50 transition-colors"
          type="button"
        >
          {isGoogleLoading ? (
             <span className="animate-spin w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
          )}
          {isGoogleLoading ? "Connecting..." : "Continue with Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-semibold tracking-wider">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="pl-10 h-12 rounded-xl border-border/60"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-medium text-primary hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="pl-10 h-12 rounded-xl border-border/60"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl font-medium mt-2 shadow-lg shadow-primary/20 group"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </motion.div>
  )
}
