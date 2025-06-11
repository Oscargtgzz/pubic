
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIconLucide } from "lucide-react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";
import { mockUserProfile } from "@/lib/mock-data";

const USER_PROFILE_KEY = "fleetfox_user_profile";

function getUserInitials(name?: string | null): string {
  if (!name) return "U";
  const names = name.split(" ");
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  if (names[0]) {
    return names[0].substring(0, 2).toUpperCase();
  }
  return "U";
}

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User>(mockUserProfile); 
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    setIsLoadingProfile(true);
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        setUser(JSON.parse(storedProfile));
      } else {
        // If no profile, use mock and save it (ProfilePage also does this)
        setUser(mockUserProfile);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(mockUserProfile));
      }
    } catch (error) {
      console.error("Error loading user profile for UserNav:", error);
      setUser(mockUserProfile); // Fallback to mock
    }
    setIsLoadingProfile(false);
  }, []);


  const handleLogout = () => {
    // Implement actual logout logic here
    console.log("User logged out");
    router.push("/"); // Redirect to login page
  };

  if (isLoadingProfile) {
    return (
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
                <AvatarFallback>..</AvatarFallback>
            </Avatar>
        </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10" data-ai-hint="user avatar">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name || "User avatar"} />
            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "Usuario"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || "No email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              <UserIconLucide className="mr-2 h-4 w-4" />
              <span>Perfil</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings" passHref>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

