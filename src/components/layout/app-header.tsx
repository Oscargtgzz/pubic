
"use client";

import { Bell, Menu, ExternalLink, ListChecks, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"; // Added SheetTitle
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { AppSidebarContent } from "./app-sidebar-content";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import type { NotificationItem } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

const NOTIFICATIONS_STORAGE_KEY = "fleetfox_notifications";
const THEME_STORAGE_KEY = "fleetfox_theme";

export function AppHeader() {
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Effect to load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to light theme if nothing is stored, or implement system preference check
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
  }, []);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (popoverOpen) {
      try {
        const storedNotificationsString = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotificationsString) {
          const allNotifications: NotificationItem[] = JSON.parse(storedNotificationsString);
          const sortedNotifications = allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecentNotifications(sortedNotifications.slice(0, 5)); // Show top 5
        } else {
          setRecentNotifications([]);
        }
      } catch (error) {
        console.error("Error loading notifications for popover:", error);
        setRecentNotifications([]);
      }
    }
  }, [popoverOpen]);

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "Servicio": return <Bell className="h-4 w-4 text-blue-500" />;
      case "Verificación": return <ListChecks className="h-4 w-4 text-green-500" />;
      case "Siniestro": return <Bell className="h-4 w-4 text-red-500" />; 
      case "General":
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      {/* Mobile navigation trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 bg-sidebar text-sidebar-foreground">
          <SheetTitle className="sr-only">Navegación Principal</SheetTitle>
          <AppSidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1">
        {/* Optional: Breadcrumbs or dynamic page title can go here */}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {currentTheme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificaciones</span>
              {/* Optional: Add a badge for unread notifications count */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4">
              <h4 className="font-medium leading-none text-foreground">Notificaciones Recientes</h4>
              <p className="text-sm text-muted-foreground">Las últimas 5 actualizaciones.</p>
            </div>
            <Separator />
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-3">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((item) => (
                    <Link href={item.link || "/notifications"} key={item.id} legacyBehavior>
                        <a 
                            onClick={() => setPopoverOpen(false)}
                            className={cn(
                                "block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                                item.isRead ? "opacity-70" : ""
                            )}
                        >
                        <div className="flex items-start gap-3">
                            <div className="mt-1">{getNotificationIcon(item.type)}</div>
                            <div className="flex-1">
                                <p className="text-sm font-medium leading-tight text-foreground">{item.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.message}</p>
                                <p className="text-xs text-muted-foreground/80 mt-0.5">
                                    {new Date(item.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                      </a>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay notificaciones recientes.</p>
                )}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-2 text-center">
              <Button variant="link" size="sm" asChild onClick={() => setPopoverOpen(false)}>
                <Link href="/notifications">
                  Ver todas las notificaciones <ExternalLink className="ml-1 h-3 w-3"/>
                </Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <UserNav />
      </div>
    </header>
  );
}
