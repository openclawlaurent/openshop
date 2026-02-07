"use client";

import { Button } from "@/lib/ui/data-display/button";

export function TempAssignAvatar() {
  const handleAssignAvatar = async () => {
    try {
      const response = await fetch("/api/user/assign-avatar", {
        method: "POST",
      });

      if (response.ok) {
        alert("Avatar assigned! Refresh the page.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <Button onClick={handleAssignAvatar}>Assign Random Avatar (Temp)</Button>;
}
