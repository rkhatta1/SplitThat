"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  UserIcon,
  Logout01Icon,
  Clock01Icon,
  PencilEdit01Icon,
  Delete02Icon,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

const navItems = [
  { title: "Dashboard", icon: DashboardSquare01Icon, url: "/app" },
  { title: "Groups", icon: UserGroupIcon, url: "/app/groups" },
  { title: "Friends", icon: UserIcon, url: "/app/friends" },
];

// Context for managing split editing
interface SplitEditContextType {
  editingSplit: any | null;
  setEditingSplit: (split: any | null) => void;
}

export const SplitEditContext = React.createContext<SplitEditContextType>({
  editingSplit: null,
  setEditingSplit: () => {},
});

export function useSplitEdit() {
  return React.useContext(SplitEditContext);
}

export function SplitEditProvider({ children }: { children: React.ReactNode }) {
  const [editingSplit, setEditingSplit] = React.useState<any | null>(null);
  return (
    <SplitEditContext.Provider value={{ editingSplit, setEditingSplit }}>
      {children}
    </SplitEditContext.Provider>
  );
}

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { setEditingSplit } = useSplitEdit();
  const deleteSplit = useMutation(api.splits.deleteSplit);
  const recentSplits = useQuery(
    api.splits.getRecentSplits,
    user?.id ? { userId: user.id as any } : "skip"
  );

  const handleEdit = (split: any) => {
    setEditingSplit(split);
  };

  const handleDelete = async (splitId: Id<"splits">) => {
    try {
      await deleteSplit({ id: splitId });
      toast.success("Split deleted");
    } catch (error) {
      console.error("Failed to delete split:", error);
      toast.error("Failed to delete split");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="hidden md:flex py-2 items-center border-b">
        <SidebarTrigger className="self-start" />
      </SidebarHeader>
      <SidebarContent className="flex flex-col-reverse md:flex-col justify-start">
        {/* Nav Items - appears at bottom on mobile, top on desktop */}
        <SidebarGroup className="order-1 md:order-1">
          <SidebarMenu className="gap-4 md:gap-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton className="text-lg md:text-sm" asChild tooltip={item.title}>
                  <Link href={item.url}>
                    <HugeiconsIcon className="block md:hidden" icon={item.icon} size={22} />
                    <HugeiconsIcon className="hidden md:block" icon={item.icon} size={18} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Recent Splits - appears at top on mobile, bottom on desktop */}
        <SidebarGroup className="order-2 md:order-2 border-b md:border-b-0 md:border-t flex-1 overflow-hidden">
          <SidebarGroupLabel>Recent Splits</SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full max-h-[calc(100vh-280px)]">
              <SidebarMenu>
                {recentSplits?.map((split) => (
                  <SidebarMenuItem
                    key={split._id}
                    className="group/split"
                  >
                    <div className="grid grid-cols-[1fr_auto] items-center w-full rounded-md hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:hidden">
                      {/* Text content - truncates in first column */}
                      <div className="min-w-0 py-2 px-2">
                        <p className="text-sm font-medium truncate">{split.description}</p>
                        <p className="text-xs text-muted-foreground">${split.amount.toFixed(2)} • {split.date}</p>
                      </div>

                      {/* Action buttons - fixed in second column */}
                      <div className="flex items-center pr-1 opacity-100 md:opacity-0 md:group-hover/split:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-primary hover:bg-transparent cursor-pointer"
                          onClick={() => handleEdit(split)}
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-red-500 hover:bg-transparent cursor-pointer"
                          onClick={() => handleDelete(split._id)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                        </Button>
                      </div>
                    </div>
                  </SidebarMenuItem>
                ))}
                {(!recentSplits || recentSplits.length === 0) && (
                  <div className="px-4 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    No recent splits
                  </div>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-2">
        <SidebarMenu>
          <SidebarMenuItem className="group/item">
            <div className="flex items-center gap-2 py-1.5 overflow-hidden">
              <Avatar className="scale-75">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate">
                  {user?.name || "Guest"}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 group-data-[collapsible=icon]:hidden"
                    onClick={() => signOut()}
                  >
                    <HugeiconsIcon icon={Logout01Icon} size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Sign out</TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
