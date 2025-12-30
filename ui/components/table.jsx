import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/utils/cn"

export function Table({ columns, data, selectedIndex, onClick, onContextMenu }) {
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const bodyRef = useRef(null)
  const [columnWidths, setColumnWidths] = useState([])
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  // 提取表头
  const header = columns.map((col) => col.title)

  // 计算总宽度
  const totalWidth = useMemo(() => columnWidths.reduce((sum, width) => sum + width, 0), [columnWidths])

  // 计算滚动条宽度
  const calculateScrollbarWidth = () => {
    if (!containerRef.current || !bodyRef.current) return 0
    return containerRef.current.offsetWidth - bodyRef.current.clientWidth
  }

  // 优化：提取列宽计算逻辑
  const calculateColumnWidths = useCallback((containerWidth, headerLength) => {
    const systemScrollbarWidth = calculateScrollbarWidth()
    const availableWidth = containerWidth - 8 - systemScrollbarWidth
    const defaultWidth = Math.floor(availableWidth / headerLength)
    return Array(headerLength).fill(Math.max(100, defaultWidth))
  }, [])

  // 初始化列宽
  useEffect(() => {
    if (columnWidths.length === 0 && header.length > 0 && containerRef.current) {
      const newWidths = calculateColumnWidths(containerRef.current.clientWidth, header.length)
      setColumnWidths(newWidths)
    }
  }, [header.length, columnWidths.length, calculateColumnWidths])

  // 优化：拖拽处理函数
  const handleResizeColumn = useCallback((index, event) => {
    event.preventDefault()

    const startX = event.clientX
    const startWidth = columnWidths[index]

    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.max(50, startWidth + moveEvent.clientX - startX)
      setColumnWidths((widths) => {
        const newWidths = [...widths]
        newWidths[index] = newWidth
        return newWidths
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "default"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.body.style.cursor = "col-resize"
  }, [columnWidths])

  // 优化：滚动条宽度检测和横向滚动同步
  useEffect(() => {
    const body = bodyRef.current
    const headerEl = headerRef.current
    if (!body || !headerEl) return

    const updateScrollbarWidth = () => setScrollbarWidth(calculateScrollbarWidth())
    const handleScroll = () => headerEl.scrollLeft = body.scrollLeft

    updateScrollbarWidth()

    const resizeObserver = new ResizeObserver(updateScrollbarWidth)
    resizeObserver.observe(body)
    body.addEventListener("scroll", handleScroll)

    return () => {
      body.removeEventListener("scroll", handleScroll)
      resizeObserver.disconnect()
    }
  }, [data])

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
      {/* 表头 */}
      <div className="sticky top-0 z-10 border-b">
        <div ref={headerRef} className="px-1 min-w-full overflow-hidden" style={{ paddingRight: `${scrollbarWidth + 4}px` }}>
          <div className="flex h-9 select-none" style={{ width: `${totalWidth}px` }}>
            {header.map((item, index) => (
              <div key={index} className="relative flex items-center border-r" style={{ width: columnWidths[index] }}>
                <p className="px-3 text-sm text-left">{item}</p>
                <div className="absolute -right-px h-full w-1 rounded-full cursor-col-resize hover:bg-accent active:bg-accent transition-all" onMouseDown={(e) => handleResizeColumn(index, e)}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 表单 */}
      <div ref={bodyRef} className="flex-1 overflow-auto p-1">
        <div className="flex flex-col gap-1" style={{ minWidth: `${totalWidth}px` }}>
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={cn(
                "flex odd:bg-muted/20 hover:bg-muted/40 rounded-sm transition",
                selectedIndex === rowIndex && "bg-muted/60!"
              )}
            >
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className="flex items-center h-8 px-3"
                  style={{ width: `${columnWidths[colIndex]}px` }}
                  onClick={() => onClick?.({ row: rowIndex, col: colIndex })}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    onContextMenu?.({ x: e.clientX, y: e.clientY, row: rowIndex, col: colIndex })
                  }}
                >
                  <p className="truncate">{row[col.key] || ""}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
