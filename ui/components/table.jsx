import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers"
import { DragDropProvider } from "@dnd-kit/react"
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/utils/cn"
import { getTableWidths, saveTableWidths } from "@/utils/storage"

const MIN_COLUMN_WIDTH = 200

function TableCell({ id, columnKey, index, value, canDrag, isFirstColumn, isLastColumn, onClick, onContextMenu }) {
  const { ref, isDragSource, isDropTarget } = useSortable({
    id,
    index,
    group: columnKey,
    type: columnKey,
    accept: columnKey,
    data: { columnKey, isEmpty: !canDrag },
    disabled: canDrag ? false : { draggable: true },
    transition: { duration: 160, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  })

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex items-center h-8 transition-colors shrink-0",
        isFirstColumn && "rounded-l-sm",
        isLastColumn && "rounded-r-sm",
        canDrag && "px-3 hover:bg-muted/40 cursor-grab active:cursor-grabbing",
        index % 2 === 0 && "bg-muted/20",
        isDragSource && "opacity-35",
        isDropTarget && "bg-muted/40",
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {value && <span className="truncate cursor-[inherit]">{value}</span>}
    </button>
  )
}

export function Table({ columns, data, cellIds, onClick, onContextMenu, onReorder }) {
  const [columnWidths, setColumnWidths] = useState([])
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const bodyRef = useRef(null)
  const columnWidthsRef = useRef([])

  const header = useMemo(() => columns.map((col) => col.title), [columns])
  const columnKeys = useMemo(() => columns.map((col) => col.key), [columns])
  const totalWidth = useMemo(() => columnWidths.reduce((sum, width) => sum + width, 0), [columnWidths])
  const { baseOrders, itemMaps } = useMemo(() => {
    const baseOrders = {}
    const itemMaps = {}

    for (const columnKey of columnKeys) {
      const items = data.flatMap((row, rowIndex) => {
        const value = row[columnKey]
        if (!value) return []

        const rawId = cellIds?.[rowIndex]?.[columnKey] || `${rowIndex}:${value}`
        return [{ id: `${columnKey}:${rawId}`, value }]
      })

      baseOrders[columnKey] = items.map(({ id }) => id)
      itemMaps[columnKey] = new Map(items.map((item) => [item.id, item]))
    }

    return { baseOrders, itemMaps }
  }, [cellIds, columnKeys, data])

  useEffect(() => {
    columnWidthsRef.current = columnWidths
  }, [columnWidths])

  // 初始化列宽和滚动条宽度，优先使用本地保存的列宽
  useEffect(() => {
    if (data.length > 0 && header.length > 0 && containerRef.current && bodyRef.current) {
      const scrollbar = containerRef.current.offsetWidth - bodyRef.current.clientWidth
      const availableWidth = containerRef.current.clientWidth - scrollbar - 8
      const defaultWidth = Math.floor(availableWidth / header.length)
      const remainder = availableWidth - defaultWidth * header.length
      const storedWidths = getTableWidths()
      const defaultWidths = Array(header.length)
        .fill(defaultWidth)
        .map((w, i) => (i === header.length - 1 ? w + remainder : w))

      setColumnWidths(columnKeys.map((key, i) => storedWidths[key] ?? defaultWidths[i]))
    }
  }, [columnKeys, data.length, header.length])

  // 横向滚动同步
  useEffect(() => {
    const body = bodyRef.current
    const header = headerRef.current

    if (body && header) {
      const handleScroll = () => (header.scrollLeft = body.scrollLeft)
      body.addEventListener("scroll", handleScroll)
      return () => body.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // 拖拽调整列宽
  const handleResizeColumn = (index, event) => {
    event.preventDefault()

    const controller = new AbortController()
    const startX = event.clientX
    const startWidth = columnWidths[index]

    const handleMouseMove = (e) => {
      const nextWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + e.clientX - startX)
      const nextWidths = columnWidthsRef.current.map((w, i) => (i === index ? nextWidth : w))
      columnWidthsRef.current = nextWidths
      setColumnWidths(nextWidths)
    }

    const handleMouseUp = () => {
      saveTableWidths(Object.fromEntries(columnKeys.map((key, i) => [key, columnWidthsRef.current[i]])))
      controller.abort()
    }

    document.addEventListener("mousemove", handleMouseMove, { signal: controller.signal })
    document.addEventListener("mouseup", handleMouseUp, { signal: controller.signal })
  }

  const handleDragEnd = (event) => {
    if (event.canceled || !isSortableOperation(event.operation)) return

    const { source } = event.operation
    const columnKey = source.initialGroup
    const fromIndex = source.initialIndex
    const targetIndex = source.index

    if (columnKey !== source.group || fromIndex === targetIndex) return

    onReorder?.({
      columnKey,
      fromIndex,
      targetIndex,
    })
  }

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
      <div ref={headerRef} className="sticky top-0 z-10 pl-1 border-b overflow-hidden">
        <div className="flex h-9" style={{ width: totalWidth }}>
          {header.map((item, index) => (
            <div
              key={index}
              className="relative flex items-center border-r shrink-0"
              style={{
                width:
                  columnWidths[index] !== undefined
                    ? index === header.length - 1
                      ? columnWidths[index] + 5
                      : columnWidths[index]
                    : undefined,
              }}
            >
              <p className="px-3 text-left">{item}</p>
              <button
                type="button"
                className="group absolute -right-2 z-10 h-full w-5 px-2 cursor-col-resize"
                onMouseDown={(e) => handleResizeColumn(index, e)}
              >
                <div className="w-1 h-full rounded-full transition group-hover:bg-accent" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 flex overflow-auto p-1">
        <DragDropProvider modifiers={[RestrictToVerticalAxis]} onDragEnd={handleDragEnd}>
          <div className="flex" style={{ minWidth: totalWidth }}>
            {columns.map((col, colIndex) => {
              const order = baseOrders[col.key] || []
              const itemMap = itemMaps[col.key] || new Map()
              const emptyCount = Math.max(0, data.length - order.length)

              return (
                <div key={col.key} className="flex flex-col gap-1 shrink-0" style={{ width: columnWidths[colIndex] }}>
                  {[
                    ...order.map((id, rowIndex) => ({ id, rowIndex, item: itemMap.get(id) })),
                    ...Array.from({ length: emptyCount }, (_, i) => ({
                      id: `${col.key}:empty:${order.length + i}`,
                      rowIndex: order.length + i,
                      item: null,
                    })),
                  ].map(({ id, rowIndex, item }) => (
                    <TableCell
                      key={id}
                      id={id}
                      columnKey={col.key}
                      index={rowIndex}
                      value={item?.value || ""}
                      canDrag={!!item}
                      isFirstColumn={colIndex === 0}
                      isLastColumn={colIndex === columns.length - 1}
                      onClick={() => onClick?.({ row: rowIndex, col: colIndex })}
                      onContextMenu={(event) => {
                        event.preventDefault()
                        onContextMenu?.({ x: event.clientX, y: event.clientY, row: rowIndex, col: colIndex })
                      }}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </DragDropProvider>
      </div>
    </div>
  )
}
