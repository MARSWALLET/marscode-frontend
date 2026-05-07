"use client"

import { useEffect } from "react"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // We could log this to Sentry/Datadog here in production
    console.error("Dashboard caught error:", error)
  }, [error])

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => reset()} className="rounded-xl shadow-lg shadow-primary/20">
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl">
            <Home className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 w-full max-w-2xl rounded-lg bg-red-500/5 p-4 text-left border border-red-500/10">
          <p className="text-xs font-mono text-red-500/80 break-words">{error.message}</p>
        </div>
      )}
    </div>
  )
}
