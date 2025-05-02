"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  Lightbulb,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Space interface
interface Space {
  _id: string
  spaceName: string
  owner: string
}

// Thread interface
interface Thread {
  _id: string
  title: string
}

export function AppSidebar() {
  const pathname = usePathname()
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")
  const [spaces, setSpaces] = useState<Space[]>([])
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [threads, setThreads] = useState<Record<string, Thread[]>>({})
  const [loading, setLoading] = useState(true)

  // Function to check if a path is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  // Function to check if a specific section is active
  const isSectionActive = (spaceId: string, section: string) => {
    return pathname?.includes(`/dashboard/space/${spaceId}/${section}`)
  }

  // Function to toggle space expansion
  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces((prev) => ({
      ...prev,
      [spaceId]: !prev[spaceId],
    }))

    // Load threads when expanding a space
    if (!expandedSpaces[spaceId] && !threads[spaceId]) {
      fetchThreads(spaceId)
    }
  }

  // Function to toggle section expansion
  const toggleSection = (spaceId: string, section: string) => {
    const key = `${spaceId}-${section}`
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Fetch spaces from API
  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/spaces")
      setSpaces(response.data)

      // Auto-expand the space if we're currently viewing it
      if (pathname && pathname.includes("/dashboard/space/")) {
        const currentSpaceId = pathname.split("/")[3]
        if (currentSpaceId) {
          setExpandedSpaces((prev) => ({
            ...prev,
            [currentSpaceId]: true,
          }))
          fetchThreads(currentSpaceId)
        }
      }
    } catch (error) {
      console.error("Failed to fetch spaces:", error)
      toast("Failed to load your spaces. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch threads for a specific space
  const fetchThreads = async (spaceId: string) => {
    try {
      const response = await axios.get(`/api/spaces/${spaceId}/threads`)
      setThreads((prev) => ({
        ...prev,
        [spaceId]: response.data,
      }))
    } catch (error) {
      console.error(`Failed to fetch threads for space ${spaceId}:`, error)
      toast("Failed to load threads. Please try again.")
    }
  }

  // Handle space creation
  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return

    try {
      setLoading(true)
      const response = await axios.post("/api/spaces", { spaceName: newSpaceName })
      setSpaces((prevSpaces) => [response.data, ...prevSpaces])
      setNewSpaceName("")
      setIsCreateSpaceOpen(false)
      toast("Space created successfully")
    } catch (error) {
      console.error("Failed to create space:", error)
      toast("Failed to create space. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Load spaces on component mount
  useEffect(() => {
    fetchSpaces()
  }, [])

  return (
    <Sidebar>
      <SidebarContent className="pt-16 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Spaces</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {loading && <div className="px-4 py-2 text-sm text-muted-foreground">Loading spaces...</div>}
              {!loading && spaces.length === 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">No spaces found. Create one below.</div>
              )}
              {spaces.map((space) => (
                <Collapsible
                  key={space._id}
                  open={expandedSpaces[space._id]}
                  onOpenChange={() => toggleSpace(space._id)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive(`/dashboard/space/${space._id}`)}
                        className="flex items-center"
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <Link key={space._id} href={`/dashboard/space/${space._id}`} className="w-full">
                          <span className="flex-1 truncate">{space.spaceName}</span>
                        </Link>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedSpaces[space._id] ? "rotate-180" : "rotate-0",
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Documents Section */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isSectionActive(space._id, "documents")}>
                            <Link href={`/dashboard/space/${space._id}/documents`}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Documents</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* Insights Section */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isSectionActive(space._id, "insights")}>
                            <Link href={`/dashboard/space/${space._id}/insights`}>
                              <Lightbulb className="mr-2 h-4 w-4" />
                              <span>Insights</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* Threads Section with nested threads */}
                        <Collapsible
                          open={expandedSections[`${space._id}-threads`]}
                          onOpenChange={() => toggleSection(space._id, "threads")}
                          className="group/threads"
                        >
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton
                                className="flex items-center"
                                isActive={isSectionActive(space._id, "thread")}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span className="flex-1">Threads</span>
                                <ChevronRight
                                  className={cn(
                                    "h-3 w-3 transition-transform duration-200",
                                    expandedSections[`${space._id}-threads`] ? "rotate-90" : "rotate-0",
                                  )}
                                />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                          </SidebarMenuSubItem>
                          <CollapsibleContent>
                            <div className="ml-6 pl-2 border-l border-sidebar-border">
                              {threads[space._id]?.map((thread) => (
                                <div key={thread._id} className="py-1">
                                  <Link
                                    href={`/dashboard/space/${space._id}/thread/${thread._id}`}
                                    className={cn(
                                      "flex items-center text-xs rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                      pathname?.includes(`/thread/${thread._id}`) &&
                                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                                    )}
                                  >
                                    <span className="truncate">{thread.title}</span>
                                  </Link>
                                </div>
                              ))}
                              {threads[space._id]?.length === 0 && (
                                <div className="text-xs text-muted-foreground py-1 px-2">No threads yet</div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create New Space</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Space</DialogTitle>
                      <DialogDescription>Enter a name for your new case space.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="space-name">Space Name</Label>
                        <Input
                          id="space-name"
                          placeholder="e.g., Smith v. Johnson"
                          value={newSpaceName}
                          onChange={(e) => setNewSpaceName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newSpaceName.trim()) {
                              handleCreateSpace()
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateSpace} disabled={!newSpaceName.trim() || loading}>
                        {loading ? "Creating..." : "Create Space"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
