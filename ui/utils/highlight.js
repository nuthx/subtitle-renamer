import { diffChars } from "diff"

// 比较同列文件名的差异并高亮
export function highlightDiff(data, ignoreCase, numbersOnly) {
  if (data.length === 0) return data

  const highlighted = data.map((row) => ({ ...row }))
  const keys = Object.keys(data[0])

  keys.forEach((key) => {
    const diffMap = new Map()
    const values = data.map((row) => row[key] || "")
    const uniqueValues = values.filter(Boolean)

    // 跳过只有一个或没有值的列
    if (uniqueValues.length <= 1) return

    // 计算每个值的差异位置
    uniqueValues.forEach((value) => {
      const diffPositions = new Set()
      uniqueValues.forEach((other) => {
        if (value === other) return

        // // 将当前值与其他值进行两两比较，计算字符级差异
        let pos = 0
        diffChars(
          ignoreCase ? value.toLowerCase() : value,
          ignoreCase ? other.toLowerCase() : other
        ).forEach((part) => {
          if (part.removed) {
            for (let i = 0; i < part.value.length; i++) {
              diffPositions.add(pos + i)
            }
          }
          if (!part.added) {
            pos += part.value.length
          }
        })
      })
      diffMap.set(value, diffPositions)
    })

    // 应用高亮
    highlighted.forEach((row, index) => {
      const value = values[index]
      const diffs = diffMap.get(value)

      if (diffs?.size) {
        row[key] = value
          .split("")
          .map((char, i) => {
            const shouldHighlight = diffs.has(i) && (!numbersOnly || /\d/.test(char))
            return shouldHighlight ? `<strong>${char}</strong>` : char
          })
          .join("")
          .replace(/<\/strong><strong>/g, "") // 合并相邻的标签
      }
    })
  })

  return highlighted
}
