import packageJson from "#/package.json"
import { openUrl } from "@tauri-apps/plugin-opener"
import { useState, useEffect, cloneElement } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/utils/cn"
import { Button } from "@/components/button"
import { RocketIcon } from "@phosphor-icons/react"

export function Nav({ children }) {
  return (
    <nav className="flex flex-col gap-1 w-50 pb-2 shrink-0">
      {children}
    </nav>
  )
}

export function NavSpace() {
  return <div className="w-full flex-1" />
}

export function NavButton({ path, title, icon, disabled }) {
  const pathname = useLocation().pathname
  const isSelected = pathname === path || pathname.startsWith(`${path}/`)

  if (disabled) return null

  return (
    <Link
      to={path}
      draggable={false}
      className={cn(
        "group relative flex items-center gap-2 h-9 px-3 rounded-md hover:bg-primary/10 transition",
        isSelected && "bg-primary/10"
      )}
    >
      {cloneElement(icon, { size: 20 })}
      {title}
      {isSelected && <div className="absolute left-0 w-0.75 h-4 rounded-full bg-accent group-active:h-3 transition-all"></div>}
    </Link>
  )
}

export function NavUpgrade() {
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    fetch("https://api.github.com/repos/nuthx/subtitle-renamer/releases/latest", {
      headers: {
        "User-Agent": "subtitle-renamer"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const latestVersion = data.tag_name
        if (latestVersion && latestVersion !== packageJson.version) {
          setHasUpdate(true)
        }
      })
      .catch(() => {})
  }, [])

  if (!hasUpdate) return null

  return (
    <Button
      variant="primary"
      className="justify-start h-11 px-3 mb-1 border-none rounded-md"
      onClick={() => openUrl("https://github.com/nuthx/subtitle-renamer/releases/latest")}
    >
      <RocketIcon size={20} />
      发现新版本
    </Button>
  )
}
