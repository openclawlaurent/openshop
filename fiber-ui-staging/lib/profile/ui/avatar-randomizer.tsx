"use client";

import { useState, useEffect } from "react";
import { Button } from "@/lib/ui/data-display/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/lib/ui/data-display/avatar";
import { Dices, Save, Loader2 } from "lucide-react";
import { getRandomAvatarId, getAvatarUrl } from "@/lib/utils/avatar-pregenerated";
import { toast } from "@/lib/toast";

export interface AvatarRandomizerProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  onSidebarRefresh?: () => void;
  onCancel?: () => void;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function AvatarRandomizer({
  currentAvatarUrl,
  onAvatarUpdate,
  onSidebarRefresh,
  onCancel,
}: AvatarRandomizerProps) {
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate initial avatar on mount
  useEffect(() => {
    generateNewAvatar();
  }, []);

  const generateNewAvatar = () => {
    const avatarId = getRandomAvatarId();
    const avatarUrl = getAvatarUrl(avatarId, SUPABASE_URL);
    setPreviewAvatarUrl(avatarUrl);
  };

  const handleSaveAvatar = async () => {
    if (!previewAvatarUrl) return;

    setIsSaving(true);

    try {
      // Update user profile with new avatar URL via API
      const response = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarUrl: previewAvatarUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      // Notify parent component
      onAvatarUpdate?.(previewAvatarUrl);

      // Refresh sidebar avatar with a small delay to ensure DB update
      console.log("AvatarRandomizer: Calling onSidebarRefresh");
      setTimeout(() => {
        console.log("AvatarRandomizer: Triggering sidebar refresh after delay");
        onSidebarRefresh?.();
      }, 500);

      toast.success("Avatar updated", {
        description: "Your new avatar has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast.error("Error", {
        description: "Failed to save avatar. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4">
        {/* Current Avatar */}
        {currentAvatarUrl && (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm text-muted-foreground">Current</span>
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentAvatarUrl} alt="Current avatar" />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Preview Avatar */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-muted-foreground">Preview</span>
          <Avatar className="w-16 h-16">
            {previewAvatarUrl ? (
              <AvatarImage src={previewAvatarUrl} alt="Preview avatar" />
            ) : (
              <AvatarFallback>?</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <Button
          size="default"
          onClick={generateNewAvatar}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Dices className="w-4 h-4 mr-2 animate-spin" />
          Randomize ✨
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            size="default"
            onClick={handleSaveAvatar}
            disabled={!previewAvatarUrl || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
