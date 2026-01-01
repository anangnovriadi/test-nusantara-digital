"use client"

import * as React from "react";
import {
  Settings2,
  Users,
  School,
  LayoutDashboard
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { useSelector } from "react-redux";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: any) => state.auth.user);

  const navData = {
    user: {
      name: user?.name || "",
      email: "Administrator",
      avatar: user?.avatar || "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: ROUTES.ADMIN.DASHBOARD,
        icon: LayoutDashboard,
        isActive: true,
        items: [],
      },
      {
        title: "Karyawan",
        url: ROUTES.ADMIN.EMPLOYEES,
        icon: Users,
        items: [],
      },
      {
        title: "Settings",
        url: ROUTES.ADMIN.SETTINGS,
        icon: Settings2,
        items: []
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="">
                <div className="bg-sidebar-primary dark:text-white text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <School className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-md font-bold">Manajemen Karyawan</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
