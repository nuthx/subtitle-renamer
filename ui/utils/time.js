export function elapsedTime(startTime) {
  const elapsed = Date.now() - startTime
  return elapsed > 1000 ? `${(elapsed / 1000).toFixed(2)} 秒` : `${elapsed} 毫秒`
}
