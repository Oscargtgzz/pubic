import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebarContent } from "@/components/layout/app-sidebar-content";
import { Providers } from "@/components/providers";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarInset,
  // SidebarRail, // Optional: if you want the draggable rail
} from "@/components/ui/sidebar"; // Assuming this is the correct path for the new Sidebar

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}> {/* Or manage state via cookies/localStorage */}
        <div className="flex min-h-screen w-full">
          <Sidebar collapsible="icon" side="left" variant="sidebar">
            {/* Sidebar content is rendered here */}
            <AppSidebarContent />
          </Sidebar>
          {/* Optional: SidebarRail for resizing/toggling */}
          {/* <SidebarRail /> */} 

          <SidebarInset> {/* This wraps the main content area */}
            <div className="flex flex-col flex-1">
              <AppHeader />
              <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
