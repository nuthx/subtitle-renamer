import { useEffect, useRef, useCallback, createContext, useContext } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/utils/cn"

const ContextMenuContext = createContext(null)

export function ContextMenu({ cell, onClose, children, className }) {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!cell) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [cell, onClose])

  return createPortal(
    <ContextMenuContext.Provider value={{ onClose }}>
      <div
        ref={menuRef}
        style={{ left: cell?.x, top: cell?.y }}
        className={cn(
          "fixed z-50 min-w-52 p-1 bg-background-dark border shadow-lg/10 rounded-md transition",
          cell ? "opacity-100" : "opacity-0 pointer-events-none",
          className
        )}
      >
        {children}
      </div>
    </ContextMenuContext.Provider>,
    document.body
  )
}

export function ContextItem({ title, icon, onClick, danger }) {
  const { onClose } = useContext(ContextMenuContext) || {}

  const handleClick = useCallback(() => {
    onClick?.()
    onClose?.()
  }, [onClick, onClose])

  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-3 h-8 hover:bg-muted/40 rounded-sm cursor-pointer transition",
        danger && "hover:text-error"
      )}
      onClick={handleClick}
    >
      {icon}
      {title}
    </button>
  )
}

export function ContextSeparator() {
  return <div className="mx-1 my-1.5 h-px bg-border" />
}
