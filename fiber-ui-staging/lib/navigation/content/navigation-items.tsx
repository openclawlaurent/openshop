import { Search, User, ShieldCheck, Coins } from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
  adminOnly?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Search",
    href: "/",
    icon: Search,
    requiresAuth: false,
  },
  {
    title: "Tokens",
    href: "/tokens",
    icon: Coins,
    requiresAuth: true,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    requiresAuth: true,
  },

  {
    title: "Admin",
    href: "/admin",
    icon: ShieldCheck,
    requiresAuth: true,
    adminOnly: true,
  },
];
