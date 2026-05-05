"use client"

import React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "@/context/AuthContext"

// Extract Client ID from environment or use a fallback
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GoogleOAuthProvider>
    </NextThemesProvider>
  )
}
