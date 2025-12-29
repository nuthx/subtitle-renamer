import { cn } from "@/utils/cn"

export function Switch({ checked, onChange }) {
  const handleClick = (e) => {
    e.stopPropagation() // 阻止事件冒泡
    onChange?.(!checked)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative flex items-center h-5 w-10 border rounded-full px-0.5 cursor-pointer transition-all",
        checked ? "bg-accent border-accent justify-end" : "bg-background border-secondary/70 justify-start"
      )}
    >
      <div
        className={cn(
          "size-3.5 ring rounded-full transition-all group-active:w-5 group-active:scale-y-95",
          checked ? "bg-background ring-border/50" : "bg-secondary/70 ring-transparent"
        )}
      />
    </button>
  )
}
