"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthDrawer } from "./auth-drawer";

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  pageName?: string;
}

export function ProtectedPageWrapper({ children, pageName }: ProtectedPageWrapperProps) {
  const { user, loading } = useAuth();
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only show auth drawer if we're not loading and there's no user
    if (!loading && !user) {
      setShowAuthDrawer(true);
    } else if (!loading && user) {
      setShowAuthDrawer(false);
    }
  }, [user, loading]);

  const handleClose = () => {
    setShowAuthDrawer(false);
    // Navigate back to search page when user dismisses auth drawer
    router.push("/");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto md:p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? children : null}
      <AuthDrawer isOpen={showAuthDrawer} onClose={handleClose} offerTitle={pageName} />
    </>
  );
}
