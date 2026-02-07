"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/lib/ui/data-display/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/ui/overlay/dialog";
import { Edit } from "lucide-react";
import { UserProfile } from "../content/types";
import { AvatarRandomizer } from "./avatar-randomizer";

export interface UserProfileCardProps {
  profile: UserProfile | null;
  onRefetch: () => void;
  currentAvatarUrl?: string | null;
  setCurrentAvatarUrl: (url: string) => void;
  memberSince: string;
  children?: React.ReactNode; // For boost tier section
}

export function UserProfileCard({
  profile,
  onRefetch,
  currentAvatarUrl,
  setCurrentAvatarUrl,
  memberSince,
  children,
}: UserProfileCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Loading Profile...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <Avatar className="w-16 h-16 transition-opacity group-hover:opacity-75">
                    <AvatarImage src={currentAvatarUrl || undefined} alt="Profile" />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Edit className="h-3 w-3" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Avatar</DialogTitle>
                  <DialogDescription>
                    Choose a new avatar from our collection of unique designs.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <AvatarRandomizer
                    currentAvatarUrl={currentAvatarUrl}
                    onAvatarUpdate={(newUrl) => {
                      setCurrentAvatarUrl(newUrl);
                      setIsDialogOpen(false);
                    }}
                    onSidebarRefresh={() => {
                      console.log("UserProfileCard: Triggering refetch from AvatarRandomizer");
                      onRefetch();
                    }}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <CardTitle className="text-xl">{profile.full_name || "User"}</CardTitle>
            <CardDescription className="select-text" style={{ pointerEvents: "none" }}>
              {profile.email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Member Since */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Member Since</p>
            <p className="text-sm text-muted-foreground">{memberSince}</p>
          </div>
        </div>

        {/* Boost Tier - Rendered by parent via children */}
        {children}
      </CardContent>
    </Card>
  );
}
