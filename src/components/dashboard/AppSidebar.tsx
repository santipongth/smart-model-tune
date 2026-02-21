import {
  LayoutDashboard,
  FolderKanban,
  Box,
  MessageSquare,
  Key,
  Settings,
  Zap,
  BarChart3,
  Database,
  Calculator,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { mockUsageStats } from "@/data/mockData";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Models", url: "/models", icon: Box },
  { title: "Playground", url: "/playground", icon: MessageSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Datasets", url: "/datasets", icon: Database },
  { title: "Cost Calculator", url: "/calculator", icon: Calculator },
  { title: "API Keys", url: "/api-keys", icon: Key },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { creditsRemaining, creditsTotal, planTier } = mockUsageStats;
  const creditPercent = (creditsRemaining / creditsTotal) * 100;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm text-foreground">SLM Studio</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Credits</span>
            <span className="font-medium text-foreground">{creditsRemaining} / {creditsTotal}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{planTier} Plan</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
