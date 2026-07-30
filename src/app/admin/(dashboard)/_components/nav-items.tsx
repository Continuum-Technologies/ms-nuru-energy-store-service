import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  Boxes,
  ShoppingCart,
  FileText,
  Users,
  Globe,
  BarChart3,
  UserCog,
  Settings,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export type NavSectionKey = "overview" | "catalog" | "sales" | "system";

export interface NavSection {
  key: NavSectionKey;
  label: string;
}

export const NAV_SECTIONS: NavSection[] = [
  { key: "overview", label: "Overview" },
  { key: "catalog", label: "Catalog & Inventory" },
  { key: "sales", label: "Sales & Operations" },
  { key: "system", label: "System & Management" },
];

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section: NavSectionKey;
  /** Omitted means visible to any logged-in staff member, regardless of role. */
  permission?: Permission;
  badgeKey?: "pendingOrders" | "newQuotations" | "lowStock";
}

/** Primary admin navigation, shared by the desktop sidebar and mobile bottom nav. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "overview" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "reports.view", section: "overview" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products.view", section: "catalog" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, permission: "categories.manage", section: "catalog" },
  { href: "/admin/brands", label: "Brands", icon: Award, permission: "brands.manage", section: "catalog" },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, permission: "inventory.view", section: "catalog", badgeKey: "lowStock" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "orders.view", section: "sales", badgeKey: "pendingOrders" },
  { href: "/admin/quotations", label: "Quotations", icon: FileText, permission: "quotations.view", section: "sales", badgeKey: "newQuotations" },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers.view", section: "sales" },
  { href: "/admin/website", label: "Website", icon: Globe, permission: "content.manage", section: "system" },
  { href: "/admin/staff", label: "Staff", icon: UserCog, permission: "staff.manage", section: "system" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage", section: "system" },
];

/** Whether `href` should be highlighted as active for the current `pathname`. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
