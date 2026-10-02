import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-50 shadow-2xs hover:bg-zinc-800",
        secondary:
          "border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100/80",
        outline: "border-zinc-300 text-zinc-900",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/80",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80",
        neutral:
          "border-zinc-200 bg-zinc-100 text-zinc-600 font-mono text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
