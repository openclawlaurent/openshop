"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useOnboarding } from "@/lib/onboarding/feature";
import { openIntercom } from "@/lib/analytics/feature";
import { hasEnvVars, cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/layout/data-access";
import { Avatar, AvatarImage, AvatarFallback } from "@/lib/ui/data-display/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/lib/ui/overlay/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/ui/overlay/tooltip";
import { navigationItems } from "../content";
import logo from "@/public/logo.svg";
import { Button } from "@/lib/ui/data-display/button";
import { TierBadge } from "@/lib/tiers/ui";
import { BoostTiersDrawer } from "@/lib/tiers/feature";
import { useBoostTiers } from "@/lib/tiers/data-access";

interface ResponsiveSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function ResponsiveSidebar({
  isCollapsed,
  mobileOpen,
  onMobileOpenChange,
}: Omit<ResponsiveSidebarProps, "onToggle">) {
  const { user, loading } = useAuth();
  const { showOnboarding } = useOnboarding();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [profileData, setProfileData] = React.useState<{
    avatar_url?: string | null;
    full_name?: string | null;
    boost_tier_id?: string | null;
    payout_partner_token_id?: string | null;
  }>({});
  const [boostTierDrawerOpen, setBoostTierDrawerOpen] = React.useState(false);
  const [payoutTokenLabel, setPayoutTokenLabel] = React.useState<string>("Token");
  const { boostTiers } = useBoostTiers();

  // Check if user is a Fiber admin (same logic as admin page)
  const isAdmin = user?.email?.endsWith("@fiber.shop") ?? false;

  // Filter navigation items based on admin status
  const visibleItems = navigationItems.filter((item) => !item.adminOnly || isAdmin);

  // Fetch user profile data
  React.useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const profile = await response.json();
          setProfileData(profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch payout token label when profile is loaded
  React.useEffect(() => {
    if (!profileData.payout_partner_token_id) return;

    const fetchTokenLabel = async () => {
      try {
        const response = await fetch("/api/partner-tokens");
        if (response.ok) {
          const tokens = await response.json();
          const token = tokens.find(
            (t: { id: string; display_label: string }) =>
              t.id === profileData.payout_partner_token_id,
          );
          if (token) {
            setPayoutTokenLabel(token.display_label);
          }
        }
      } catch (error) {
        console.error("Error fetching token label:", error);
      }
    };

    fetchTokenLabel();
  }, [profileData.payout_partner_token_id]);

  // Desktop sidebar content
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header - only show on desktop */}
      {!isMobile && (
        <div className="p-2">
          <Link href="/">
            <div
              className={cn(
                "flex items-center gap-1 px-4 py-3 cursor-pointer hover:bg-accent/50 rounded-md transition-colors",
                isCollapsed && "justify-center px-3",
              )}
            >
              <Image
                src={logo}
                alt="Fiber"
                width={25}
                height={25}
                className="rounded flex-shrink-0"
              />
              {!isCollapsed && <span className="font-semibold text-xl">Fiber</span>}
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          const navItem = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onMobileOpenChange(false)}
              data-testid={`nav-link-${item.href.replace("/", "") || "home"}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-medium",
                isCollapsed && "justify-center px-3",
              )}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );

          if (isCollapsed && !isMobile) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          }

          return navItem;
        })}
      </nav>

      {/* Footer links section - only show when expanded */}
      {!isCollapsed && (
        <div className="border-t p-2">
          <div className="space-y-1">
            <button
              onClick={() => {
                showOnboarding();
                onMobileOpenChange(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors w-full",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              )}
            >
              <span>What&apos;s Fiber?</span>
            </button>
            <Link
              href="/faq"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
                pathname === "/faq" && "bg-accent text-accent-foreground",
              )}
            >
              <span className="text-sm">FAQ</span>
            </Link>
            <Link
              href="/terms"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
                pathname === "/terms" && "bg-accent text-accent-foreground",
              )}
            >
              <span className="text-sm">Terms</span>
            </Link>
            <Link
              href="/privacy"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
                pathname === "/privacy" && "bg-accent text-accent-foreground",
              )}
            >
              <span className="text-sm">Privacy</span>
            </Link>
            <button
              onClick={() => {
                openIntercom();
                onMobileOpenChange(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors w-full text-left",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              )}
            >
              <span className="text-sm">Need help?</span>
            </button>
          </div>
        </div>
      )}

      {/* User section */}
      {loading ? (
        <div className="border-t p-2">
          <div
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2",
              isCollapsed && "justify-center px-2",
            )}
          >
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            {!isCollapsed && <div className="h-4 w-8 bg-muted rounded animate-pulse ml-auto" />}
          </div>
        </div>
      ) : user && hasEnvVars ? (
        <div className="border-t p-2">
          <Link href="/profile" onClick={() => onMobileOpenChange(false)}>
            <div
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer",
                isCollapsed && "justify-center px-2",
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={profileData.avatar_url || undefined} alt="Profile" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!isCollapsed &&
                profileData.boost_tier_id &&
                boostTiers.length > 0 &&
                (() => {
                  const currentTier = boostTiers.find((t) => t.id === profileData.boost_tier_id);
                  return (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBoostTierDrawerOpen(true);
                      }}
                    >
                      <TierBadge
                        tierName={currentTier?.name || "Tier"}
                        onClick={() => {}}
                        payoutTokenBoost={currentTier?.payout_token_boost_multiplier}
                        platformTokenBoost={currentTier?.platform_token_boost_multiplier}
                        payoutTokenLabel={payoutTokenLabel}
                        showMultipliers={true}
                      />
                    </div>
                  );
                })()}
            </div>
          </Link>
        </div>
      ) : (
        <div className="border-t p-2">
          <Link href="/auth/login" onClick={() => onMobileOpenChange(false)}>
            <Button variant="default" className={cn("w-full justify-center gap-2")}>
              <User className="h-4 w-4" />
              {!isCollapsed && <span>Sign In</span>}
            </Button>
          </Link>
        </div>
      )}

      {/* Boost Tiers Drawer */}
      {profileData.boost_tier_id && (
        <BoostTiersDrawer
          open={boostTierDrawerOpen}
          onOpenChange={setBoostTierDrawerOpen}
          boostTiers={boostTiers}
          currentTierId={profileData.boost_tier_id}
          userAvatarUrl={profileData.avatar_url}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Main navigation menu</SheetDescription>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "h-full bg-background border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {sidebarContent}
    </div>
  );
}

interface MobileSidebarTriggerProps {
  onOpen: () => void;
}

export function MobileSidebarTrigger({ onOpen }: MobileSidebarTriggerProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onOpen} className="md:hidden">
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  );
}
