import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-400/10 text-gray-400 inset-ring inset-ring-gray-400/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-red-400/10 text-red-400 inset-ring inset-ring-red-400/20",
        outline: "text-foreground border border-border",
        gray: "bg-gray-400/10 text-gray-400 inset-ring inset-ring-gray-400/20",
        red: "bg-red-400/10 text-red-400 inset-ring inset-ring-red-400/20",
        yellow: "bg-yellow-400/10 text-yellow-500 inset-ring inset-ring-yellow-400/20",
        green: "bg-green-400/10 text-green-400 inset-ring inset-ring-green-500/20",
        blue: "bg-blue-400/10 text-blue-400 inset-ring inset-ring-blue-400/30",
        indigo: "bg-indigo-400/10 text-indigo-400 inset-ring inset-ring-indigo-400/30",
        purple: "bg-purple-400/10 text-purple-400 inset-ring inset-ring-purple-400/30",
        pink: "bg-pink-400/10 text-pink-400 inset-ring inset-ring-pink-400/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
