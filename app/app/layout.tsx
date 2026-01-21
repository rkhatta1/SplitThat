"use client";

import { ConvexClientProvider } from "@/components/convex-provider";
import { AuthProvider } from "@/lib/auth-client";
import { SplitwiseProvider } from "@/lib/splitwise-context";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, SplitEditProvider } from "@/components/app-sidebar";
import { NewSplitButton } from "@/components/new-split-button";
import { Toaster } from "@/components/ui/sonner";
import { EditSplitModal } from "@/components/edit-split-modal";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <ConvexClientProvider>
        <AuthProvider>
          <SplitwiseProvider>
            <SplitEditProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <NewSplitButton />
                  {/* Mobile sidebar trigger - bottom left */}
                  <div className="fixed bottom-6 left-6 z-50 md:hidden">
                    <SidebarTrigger className="h-12 w-12 rounded-none bg-muted shadow-lg border" />
                  </div>
                  <main className="flex-1 overflow-auto p-6">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
              <EditSplitModal />
            </SplitEditProvider>
            <Toaster />
          </SplitwiseProvider>
        </AuthProvider>
      </ConvexClientProvider>
    </div>
  );
}
