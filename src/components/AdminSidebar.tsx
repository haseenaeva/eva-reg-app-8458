import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Users, 
  UserCheck, 
  Building2, 
  CheckSquare, 
  Shield, 
  Settings,
  BarChart3,
  FileText,
  Bell
} from "lucide-react";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "User Approvals", url: "/admin/approvals", icon: UserCheck },
  { title: "Team Management", url: "/admin/teams", icon: Building2 },
  { title: "Task Management", url: "/admin/tasks", icon: CheckSquare },
  { title: "Panchayaths", url: "/admin/panchayaths", icon: Building2 },
  { title: "Permissions", url: "/admin/permissions", icon: Shield },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavClass}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}