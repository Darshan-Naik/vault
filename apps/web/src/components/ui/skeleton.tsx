import { cn } from "@vault/shared"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
