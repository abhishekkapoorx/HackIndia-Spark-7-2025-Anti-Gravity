import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs'
import { Navbar } from "@/components/navbar";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentic Lawsuit Manager",
  description: "AI-powered platform for building, managing, and filing legal cases with structured arguments and citations.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background font-sans antialiased">
        <ClerkProvider>
          <ClerkLoaded>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Navbar />
              {children}
              <Footer />
              <Toaster />
            </ThemeProvider>
          </ClerkLoaded>
          <ClerkLoading><Loading /></ClerkLoading>
        </ClerkProvider>
      </body>
    </html>
  );
}
