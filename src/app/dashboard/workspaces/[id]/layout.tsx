// The workspace IDE should be full-screen — no dashboard sidebar.
// This layout overrides the parent dashboard layout for this route.
export default function WorkspaceIDELayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
