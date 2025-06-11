
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, mainNavItems, settingsNavItems } from "@/lib/config";
import type { SidebarNavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LogInIcon, PanelLeftClose, PanelLeftOpen, Settings as SettingsIcon } from "lucide-react"; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSidebar } from "@/components/ui/sidebar";

interface AppSidebarContentProps {
  isMobile?: boolean; 
  className?: string;
}

export function AppSidebarContent({ isMobile = false, className }: AppSidebarContentProps) {
  const pathname = usePathname();
  const { toggleSidebar, state, isMobile: isDesktopSidebarContextMobile } = useSidebar(); 

  const renderNavItem = (item: SidebarNavItem, index: number) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    
    if (item.isCollapsible && item.subItems) {
      const isParentActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
      return (
        <Accordion key={item.label} type="single" collapsible className="w-full" defaultValue={isParentActive ? `item-${index}` : undefined}>
          <AccordionItem value={`item-${index}`} className="border-b-0">
            <AccordionTrigger 
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isParentActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                "justify-between group" 
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4 pt-1 pb-0">
              <nav className="grid gap-1">
                {item.subItems.map(renderSubNavItem)}
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link key={item.href} href={item.href} legacyBehavior passHref>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-2",
            isActive 
              ? "bg-sidebar-accent text-sidebar-accent-foreground" 
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Button>
      </Link>
    );
  };
  
  const renderSubNavItem = (item: SidebarNavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href);
    return (
      <Link key={item.href} href={item.href} legacyBehavior passHref>
         <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 rounded-md px-3 py-2 text-sm",
             isActive 
              ? "bg-sidebar-accent/80 text-sidebar-accent-foreground" 
              : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    );
  };


  return (
    <>
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border shrink-0",
        (state === 'expanded' || isDesktopSidebarContextMobile) ? "justify-between px-4" : "justify-center px-2"
      )}>
        {/* Logo and App Name - only shown if expanded or on mobile */}
        {(state === 'expanded' || isDesktopSidebarContextMobile) && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground hover:text-sidebar-primary-foreground/90"
          >
            <LogInIcon className="h-7 w-7 text-sidebar-primary" />
            {/* Show APP_NAME only when expanded on desktop OR on mobile sheet */}
            {(state === 'expanded' && !isDesktopSidebarContextMobile || isDesktopSidebarContextMobile) && (
              <span className="text-xl">
                {APP_NAME}
              </span>
            )}
          </Link>
        )}

        {/* Desktop-only collapse/expand button */}
        {!isDesktopSidebarContextMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              // If sidebar is expanded and logo is shown, button is pushed by justify-between.
              // If sidebar is collapsed (and logo hidden), parent's justify-center will center this button.
            )}
            aria-label={state === 'expanded' ? "Colapsar barra lateral" : "Expandir barra lateral"}
          >
            {state === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className={cn(
          "grid items-start gap-2 text-sm font-medium",
          (state === 'collapsed' && !isDesktopSidebarContextMobile) ? "p-2" : "p-4"
        )}>
          {mainNavItems.map(renderNavItem)}
          <Separator className="my-2 bg-sidebar-border" /> {/* Reduced margin for separator */}
          
          {/* Conditional rendering for "Configuración" title */}
          {(state === 'expanded' || isDesktopSidebarContextMobile) ? (
            <h4 className="px-3 py-1 text-xs font-semibold uppercase text-sidebar-foreground/70 tracking-wider">
              Configuración
            </h4>
          ) : !isDesktopSidebarContextMobile ? ( // Collapsed on desktop
            <div className="flex justify-center py-1">
              <SettingsIcon className="h-4 w-4 text-sidebar-foreground/70"/>
            </div>
          ) : null }
          {settingsNavItems.map(renderNavItem)}
        </nav>
      </ScrollArea>
    </>
  );
}
