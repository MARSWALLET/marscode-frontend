"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, MoreHorizontal, ShieldBan, Coins, UserCheck, ShieldAlert } from "lucide-react"

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

const mockUsers = [
  { id: "usr_1", name: "John Doe", email: "john@example.com", status: "Active", plan: "Pro", credits: 450, lastLogin: "2 mins ago" },
  { id: "usr_2", name: "Alice Smith", email: "alice@acme.corp", status: "Active", plan: "Enterprise", credits: 12500, lastLogin: "1 hour ago" },
  { id: "usr_3", name: "Bob Jones", email: "bob@spammer.net", status: "Banned", plan: "Free", credits: 0, lastLogin: "3 days ago" },
  { id: "usr_4", name: "Emma Wilson", email: "emma@startup.io", status: "Active", plan: "Pro", credits: 120, lastLogin: "5 mins ago" },
  { id: "usr_5", name: "System Admin", email: "admin@marscoder.com", status: "Superuser", plan: "Infinite", credits: 999999, lastLogin: "Just now" },
]

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="w-full h-full flex flex-col py-4">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">User Management</h1>
          <p className="text-muted-foreground text-lg">Search, moderate, and adjust balances for all users.</p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by email, name, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent transition-all"
          />
        </div>
        <Button variant="outline" className="rounded-xl shrink-0">
          <Filter className="mr-2 w-4 h-4" />
          Filter Status
        </Button>
      </motion.div>

      {/* Users Table */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Credits</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {mockUsers.map((user) => (
                <motion.tr key={user.id} variants={itemVariants} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`
                      ${user.status === 'Active' ? 'text-green-500 border-green-500/30 bg-green-500/10' : ''}
                      ${user.status === 'Banned' ? 'text-red-500 border-red-500/30 bg-red-500/10' : ''}
                      ${user.status === 'Superuser' ? 'text-purple-500 border-purple-500/30 bg-purple-500/10' : ''}
                    `}>
                      {user.status === 'Superuser' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium">{user.plan}</td>
                  <td className="px-6 py-4 font-mono font-medium">{user.credits.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" title="Adjust Credits">
                        <Coins className="w-4 h-4" />
                      </Button>
                      {user.status === 'Banned' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10" title="Unban User">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Ban User" disabled={user.status === 'Superuser'}>
                          <ShieldBan className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
