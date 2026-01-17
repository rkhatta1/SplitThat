"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  UserIcon,
  Logout01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const navItems = [
  { title: "Dashboard", icon: DashboardSquare01Icon, url: "/" },
  { title: "Groups", icon: UserGroupIcon, url: "/groups" },
  { title: "Friends", icon: UserIcon, url: "/friends" },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const recentSplits = useQuery(
    api.splits.getRecentSplits,
    user?.id ? { userId: user.id as any } : "skip"
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            ST
          </div>
          <span className="group-data-[collapsible=icon]:hidden">SplitThat</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <HugeiconsIcon icon={item.icon} size={18} />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Recent Splits</SidebarGroupLabel>
          <SidebarGroupContent>
             <SidebarMenu>
               {recentSplits?.map((split) => (
                 <SidebarMenuItem key={split._id}>
                   <SidebarMenuButton className="h-auto py-2 group-data-[collapsible=icon]:px-2">
                     <div className="flex flex-col gap-0.5 min-w-0 group-data-[collapsible=icon]:hidden">
                       <span className="text-sm font-medium truncate">{split.description}</span>
                       <span className="text-xs text-muted-foreground">${split.amount} • {split.date}</span>
                     </div>
                     <div className="hidden group-data-[collapsible=icon]:block">
                        <HugeiconsIcon icon={Clock01Icon} size={16} />
                     </div>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
               {(!recentSplits || recentSplits.length === 0) && (
                 <div className="px-4 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                   No recent splits
                 </div>
               )}
             </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5 overflow-hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate">
                  {user?.name || "Guest"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 group-data-[collapsible=icon]:hidden"
                onClick={() => signOut()}
              >
                <HugeiconsIcon icon={Logout01Icon} size={16} />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
