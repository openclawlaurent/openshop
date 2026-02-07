"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
// import { Separator } from "@/lib/ui/data-display/separator";
import { TooltipProvider } from "@/lib/ui/overlay/tooltip";
import { ResponsiveSidebar, MobileSidebarTrigger } from "./responsive-sidebar";
import { SearchDialogContainer } from "@/lib/search/feature";
import { Button } from "@/lib/ui/data-display/button";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.svg";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const pathname = usePathname();
  const mainRef = React.useRef<HTMLElement>(null);

  // Prevent hydration flash on mobile
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show/hide header based on scroll position
  React.useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const scrollTop = mainElement.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;

      // Hide header when scrolling down, show when scrolling up
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down & past threshold
        setHeaderVisible(false);
      } else if (scrollTop < lastScrollTop) {
        // Scrolling up
        setHeaderVisible(true);
      }

      lastScrollTopRef.current = scrollTop;
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't render navigation shell on auth pages and waitlist
  if (pathname?.startsWith("/auth") || pathname === "/waitlist") {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <ResponsiveSidebar isCollapsed={false} mobileOpen={false} onMobileOpenChange={() => {}} />
        </div>

        {/* Mobile sheet - only render after mount to prevent flash */}
        {mounted && (
          <div className="md:hidden">
            <ResponsiveSidebar
              isCollapsed={false}
              mobileOpen={mobileOpen}
              onMobileOpenChange={setMobileOpen}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header
            className={`fixed top-0 right-0 left-0 md:left-auto z-10 flex h-16 items-center gap-2 bg-background border-b transition-transform duration-300 ease-in-out ${
              headerVisible ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="flex items-center gap-2 px-4 md:hidden">
              <MobileSidebarTrigger onOpen={() => setMobileOpen(true)} />
            </div>
            {/* Centered logo on mobile */}
            <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
              <Link href="/" className="flex items-center gap-2">
                <Image src={logo} alt="Fiber" width={28} height={28} className="rounded" />
                <span className="font-semibold text-lg">Fiber</span>
              </Link>
            </div>
            {/* Search button - right aligned on mobile */}
            <div className="ml-auto flex items-center gap-4 mr-4 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                title="Search offers (⌘K)"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search offers</span>
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main ref={mainRef} className="flex-1 overflow-auto px-6 py-8 lg:px-8 lg:py-8 pt-24">
            {children}
          </main>
        </div>

        {/* Search Dialog */}
        <React.Suspense fallback={null}>
          <SearchDialogContainer open={searchOpen} onOpenChange={setSearchOpen} />
        </React.Suspense>
      </div>
    </TooltipProvider>
  );
}
