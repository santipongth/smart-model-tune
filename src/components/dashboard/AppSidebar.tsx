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
  Rocket,
  Trophy,
  Tag,
  LayoutTemplate,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { mockUsageStats } from "@/data/mockData";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.projects", url: "/projects", icon: FolderKanban },
  { titleKey: "nav.templates", url: "/templates", icon: LayoutTemplate },
  { titleKey: "nav.models", url: "/models", icon: Box },
  { titleKey: "nav.playground", url: "/playground", icon: MessageSquare },
  { titleKey: "nav.analytics", url: "/analytics", icon: BarChart3 },
  { titleKey: "nav.datasets", url: "/datasets", icon: Database },
  { titleKey: "nav.calculator", url: "/calculator", icon: Calculator },
  { titleKey: "nav.deployment", url: "/deployment", icon: Rocket },
  { titleKey: "nav.leaderboard", url: "/leaderboard", icon: Trophy },
  { titleKey: "nav.annotate", url: "/annotate", icon: Tag },
  { titleKey: "nav.apiKeys", url: "/api-keys", icon: Key },
  { titleKey: "nav.settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { creditsRemaining, creditsTotal, planTier } = mockUsageStats;
  const creditPercent = (creditsRemaining / creditsTotal) * 100;
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

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
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{t(item.titleKey)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border space-y-3">
        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("nav.credits")}</span>
            <span className="font-medium text-foreground">{creditsRemaining} / {creditsTotal}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{planTier} {t("nav.plan")}</p>
        </div>

        {user && (
          <div className="flex items-center gap-2 pt-2 border-t border-border group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:border-t-0 group-data-[collapsible=icon]:pt-0">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleSignOut}
              title={t("auth.signOut")}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
