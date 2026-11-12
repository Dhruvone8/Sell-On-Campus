"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { Footer } from "./footer";
import { SmoothScrollProvider } from "./smooth-scroll-provider";
import { AuthProvider } from "@/lib/auth-context";
import { SocketProvider } from "@/lib/socket-context";

import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Full-screen messaging or auth screens don't need the global footer
  const isMessageView = pathname.startsWith("/conversations");
  const isAuthScreen = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
  const hideFooter = isMessageView || isAuthScreen;

  return (
    <AuthProvider>
      <SocketProvider>
        <SmoothScrollProvider>
          <div className="min-h-screen flex flex-col bg-canvas text-charcoal-900">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#181d27",
                  color: "#f8fafc",
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "12px 18px",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px -10px rgba(15, 19, 28, 0.25), 0 4px 6px -2px rgba(15, 19, 28, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#ffffff",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#f43f5e",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
            <Navbar />
            <main className={cn("flex-1 pt-16", isMessageView ? "pb-0" : "pb-20 md:pb-0")}>
              {children}
            </main>
            {!hideFooter && <Footer />}
            <MobileNav />
          </div>
        </SmoothScrollProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
