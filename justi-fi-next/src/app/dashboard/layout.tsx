import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
         <SidebarProvider>
            <AppSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">{children}</div>
      </SidebarInset>
      </SidebarProvider>
      
    </div>
  )
}
