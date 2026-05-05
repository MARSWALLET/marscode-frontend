"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/api"

export interface User {
  id: string
  email: string
  name: string | null
  tier: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, fullName?: string) => Promise<boolean>
  googleLogin: (credential: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check local storage for existing session on mount
    const storedUser = localStorage.getItem("marscoder_user")
    const storedToken = localStorage.getItem("marscoder_access_token")
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("marscoder_user")
        localStorage.removeItem("marscoder_access_token")
      }
    }
    setIsLoading(false)
  }, [])

  const handleAuthSuccess = (data: any) => {
    const { user, access_token } = data
    
    // Store token and user data
    localStorage.setItem("marscoder_access_token", access_token)
    localStorage.setItem("marscoder_user", JSON.stringify(user))
    
    setUser(user)
    toast.success("Successfully logged in!")
    router.push("/dashboard")
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/api/v1/auth/login", { email, password })
      if (response.data.success) {
        handleAuthSuccess(response.data)
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to login. Please check your credentials.")
      return false
    }
  }

  const register = async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      const response = await api.post("/api/v1/auth/register", { email, password, full_name: fullName })
      if (response.data.success) {
        handleAuthSuccess(response.data)
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to register. Email might already exist.")
      return false
    }
  }

  const googleLogin = async (credential: string): Promise<boolean> => {
    try {
      const response = await api.post("/api/v1/auth/google", { token: credential })
      if (response.data.success) {
        handleAuthSuccess(response.data)
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Google login failed.")
      return false
    }
  }

  const logout = () => {
    // Optionally call backend logout endpoint here
    localStorage.removeItem("marscoder_access_token")
    localStorage.removeItem("marscoder_user")
    setUser(null)
    router.push("/login")
    toast.info("You have been logged out.")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
