"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/contexts/auth-context";
import { Web3Provider } from "@/components/providers/web3-provider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Web3Provider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </Web3Provider>
    </AuthProvider>
  );
}
