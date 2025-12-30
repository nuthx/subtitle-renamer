import { toast as sonnerToast } from "sonner"
import { cn } from "@/utils/cn"
import { CircleNotchIcon, CheckCircleIcon, WarningCircleIcon, XCircleIcon, XIcon } from "@phosphor-icons/react"

const DURATION_TIME = 2000

export function toast({ title, description, type }, toastOptions) {
  const itemType = {
    success: "bg-green-50 text-green-900",
    warning: "bg-yellow-50 text-yellow-900",
    error: "bg-red-50 text-red-900"
  }

  const itemIcon = {
    loading: <CircleNotchIcon className="size-5 animate-spin" />,
    success: <CheckCircleIcon weight="fill" className="size-5 text-green-700" />,
    warning: <WarningCircleIcon weight="fill" className="size-5 text-yellow-700" />,
    error: <XCircleIcon weight="fill" className="size-5 text-red-700" />
  }

  return sonnerToast.custom((id) => (
    <div className={`flex-center gap-3 w-150 p-3 pl-4 bg-background border rounded-md shadow-md transition ${itemType[type]}`}>
      {itemIcon[type]}

      <div className="flex-1">
        <p className="font-medium transition">{title}</p>
        {description && <p className="text-[13px] text-secondary">{description}</p>}
      </div>

      <button
        className={cn(
          "flex-center size-8 text-secondary rounded-sm transition",
          type === "loading" ? "opacity-0" : "cursor-pointer hover:bg-muted/40"
        )}
        onClick={() => { sonnerToast.dismiss(id) }}
        disabled={type === "loading"}
      >
        <XIcon className="size-5" />
      </button>
    </div>
  ), { duration: DURATION_TIME, ...toastOptions })
}

toast.success = ({ title, description }, toastOptions) => {
  return toast({ title, description, type: "success" }, toastOptions)
}

toast.warning = ({ title, description }, toastOptions) => {
  return toast({ title, description, type: "warning" }, toastOptions)
}

toast.error = ({ title, description }, toastOptions) => {
  return toast({ title, description, type: "error" }, toastOptions)
}

toast.promise = (promise, { loading, success, error }) => {
  const loadingToast = toast({
    title: loading.title,
    description: loading.description,
    type: "loading"
  }, { duration: Infinity, dismissible: false })

  promise
    .then((data) => {
      toast.success({
        title: typeof success.title === "function" ? success.title(data) : success.title,
        description: typeof success.description === "function" ? success.description(data) : success.description
      }, { id: loadingToast, duration: DURATION_TIME })
    })
    .catch((err) => {
      const errorType = error.type || "error"
      const toastMethod = toast[errorType] || toast.error
      toastMethod({
        title: typeof error.title === "function" ? error.title(err) : error.title,
        description: typeof error.description === "function" ? error.description(err) : error.description
      }, { id: loadingToast, duration: DURATION_TIME })
    })

  return loadingToast
}
