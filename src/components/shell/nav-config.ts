/**
 * Shell nav config — single source of truth for primary navigation.
 * All shell components (PrimaryRail, WorkspacePanel, MobileNavDrawer) derive
 * their items from here.
 */

import {
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart3,
  Bell,
  BookOpen,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short label for the rail tooltip */
  tooltip: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/",                label: "Repositories",  icon: LayoutDashboard, tooltip: "Repositories" },
  { href: "/team",            label: "Team Insights", icon: Users,           tooltip: "Team" },
  { href: "/cost-analytics",  label: "Cost Analytics",icon: DollarSign,      tooltip: "Cost" },
  { href: "/reports",         label: "Reports",       icon: BarChart3,       tooltip: "Reports" },
  { href: "/alerts",          label: "Alerts",        icon: Bell,            tooltip: "Alerts" },
  { href: "/docs",            label: "Docs",          icon: BookOpen,        tooltip: "Docs" },
  { href: "/settings",        label: "Settings",      icon: Settings,        tooltip: "Settings" },
];
