"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { Footer } from "./footer";
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
        <div className="min-h-screen flex flex-col bg-canvas text-charcoal-900">
          <Navbar />
          <main className={cn("flex-1 pt-16", isMessageView ? "pb-0" : "pb-20 md:pb-0")}>
            {children}
          </main>
          {!hideFooter && <Footer />}
          <MobileNav />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}
