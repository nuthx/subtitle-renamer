import { RocketIcon } from "@phosphor-icons/react"
import { cloneElement, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import packageJson from "#/package.json"
import { Button } from "@/components/button"
import { UpdateDialog } from "@/dialogs/update"
import { cn } from "@/utils/cn"

const releaseUrls = [
  "https://api.github.com/repos/nuthx/subtitle-renamer/releases/latest",
  "https://gh-proxy.org/https://api.github.com/repos/nuthx/subtitle-renamer/releases/latest",
]

export function Nav({ children }) {
  return <nav className="flex flex-col gap-1 w-46 pb-2 shrink-0">{children}</nav>
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
        isSelected && "bg-primary/10",
      )}
    >
      {cloneElement(icon, { size: 20 })}
      {title}
      {isSelected && (
        <div className="absolute left-0 w-0.75 h-4 rounded-full bg-accent group-active:h-3 transition-all" />
      )}
    </Link>
  )
}

export function NavUpgrade() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [release, setRelease] = useState(null)

  useEffect(() => {
    ;(async () => {
      for (const url of releaseUrls) {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "subtitle-renamer" },
            signal: AbortSignal.timeout(5000),
          })
          if (!res.ok) continue

          const data = await res.json()
          if (!data.tag_name || data.tag_name === packageJson.version) return

          setRelease({
            latestVersion: data.tag_name,
            publishDate: data.published_at.split("T")[0],
            releaseNotes: data.body || "",
          })
          return
        } catch {}
      }
    })()
  }, [])

  if (!release) return null

  return (
    <>
      <Button
        variant="primary"
        className="justify-start h-15 px-3 mb-1 border-none rounded-md"
        onClick={() => setIsDialogOpen(true)}
      >
        <RocketIcon size={20} />
        <div className="flex flex-col items-start gap-0.5">
          <div className="font-medium">发现新版本</div>
          <div className="text-[11px] opacity-90">
            v{release.latestVersion} ({release.publishDate})
          </div>
        </div>
      </Button>

      <UpdateDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} {...release} />
    </>
  )
}
