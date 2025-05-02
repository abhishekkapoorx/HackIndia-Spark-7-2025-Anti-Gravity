"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"
import JustiFiLogo from "./JustiFiLogo"

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto w-[85%] flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Home">
          <JustiFiLogo />
        </Link>

        {/* Desktop nav */}
        <SignedIn>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
          </nav>
        </SignedIn>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <div className="hidden md:flex">
              <Link href="/sign-in">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          </SignedOut>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === "/dashboard"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                </SignedIn>

                <SignedOut>
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    <Button className="w-full cursor-pointer" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </SignedOut>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
