import { cn } from "@/utils/cn"

export function Badge({ children, variant = "default", className, onClick, ...props }) {
  const variants = {
    default: "bg-accent border-accent text-background dark:text-white",
    outline: "border-muted/80 text-primary/80"
  }

  const buttonClassName = onClick && "hover:bg-background-dark/50 hover:border-muted cursor-pointer"

  return (
    <span
      className={cn(
        "flex-center h-7 px-4 border text-[13px] rounded-full transition",
        variants[variant],
        buttonClassName,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </span>
  )
}
