import { useState, useRef, useEffect, useMemo } from "react"

export function Table({ columns, data, onClick, onContextMenu }) {
  const [columnWidths, setColumnWidths] = useState([])
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const bodyRef = useRef(null)

  const header = columns.map((col) => col.title)
  const totalWidth = useMemo(() => columnWidths.reduce((sum, width) => sum + width, 0), [columnWidths])

  // 初始化列宽和滚动条宽度
  useEffect(() => {
    if (data.length > 0 && header.length > 0 && containerRef.current && bodyRef.current) {
      const scrollbar = containerRef.current.offsetWidth - bodyRef.current.clientWidth
      const availableWidth = containerRef.current.clientWidth - scrollbar - 8
      const defaultWidth = Math.floor(availableWidth / header.length)
      const remainder = availableWidth - defaultWidth * header.length

      setColumnWidths(
        Array(header.length).fill(defaultWidth).map((w, i) =>
          i === header.length - 1 ? w + remainder : w
        )
      )
    }
  }, [header.length, data.length])

  // 横向滚动同步
  useEffect(() => {
    const body = bodyRef.current
    const header = headerRef.current

    if (body && header) {
      const handleScroll = () => header.scrollLeft = body.scrollLeft
      body.addEventListener("scroll", handleScroll)
      return () => body.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // 拖拽调整列宽
  const handleResizeColumn = (index, event) => {
    const controller = new AbortController()
    const startX = event.clientX
    const startWidth = columnWidths[index]

    const handleMouseMove = (e) => {
      setColumnWidths((widths) =>
        widths.map((w, i) => i === index ? Math.max(200, startWidth + e.clientX - startX) : w)
      )
    }

    document.addEventListener("mousemove", handleMouseMove, { signal: controller.signal })
    document.addEventListener("mouseup", () => controller.abort(), { signal: controller.signal })
  }

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
      <div ref={headerRef} className="sticky top-0 z-10 pl-1 border-b overflow-hidden">
        <div className="flex h-9" style={{ width: totalWidth }}>
          {header.map((item, index) => (
            <div key={index} className="relative flex items-center border-r shrink-0" style={{ width: columnWidths[index] !== undefined ? (index === header.length - 1 ? columnWidths[index] + 5 : columnWidths[index]) : undefined }}>
              <p className="px-3 text-left">{item}</p>
              <div
                className="group absolute -right-2 z-10 h-full w-5 px-2 cursor-col-resize"
                onMouseDown={(e) => handleResizeColumn(index, e)}
              >
                <div className="w-1 h-full rounded-full transition group-hover:bg-accent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 flex overflow-auto p-1">
        <div className="flex flex-col gap-1" style={{ minWidth: totalWidth }}>
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex odd:bg-muted/20 hover:bg-muted/40 rounded-sm transition">
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className="flex items-center h-8 px-3"
                  style={{ width: columnWidths[colIndex] }}
                  onClick={() => onClick?.({ row: rowIndex, col: colIndex })}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    onContextMenu?.({ x: e.clientX, y: e.clientY, row: rowIndex, col: colIndex })
                  }}
                >
                  <p className="truncate" dangerouslySetInnerHTML={{ __html: row[col.key] || "" }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
