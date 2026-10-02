import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--orb-radius-sm)] bg-[var(--orb-bg-muted)]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
