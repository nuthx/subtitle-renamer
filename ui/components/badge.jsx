import { cn } from "@/utils/cn"

export function Badge({ children, variant = "default", className, ...props }) {
  const variants = {
    default: "bg-accent border-accent text-background dark:text-white",
    outline: "border-muted/80 text-primary/80"
  }

  return (
    <span
      className={cn("flex-center h-7 px-4 border rounded-full", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
