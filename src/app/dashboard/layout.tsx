import React from "react"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      
      {/* Floating Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10 pl-6">
        <div className="max-w-6xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
