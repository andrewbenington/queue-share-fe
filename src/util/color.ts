export function userColor(id: string) {
  const segments = id.split('-')
  if (segments.length !== 5) return '#ff0050'
  const num = parseInt(segments[4], 16)
  return `hsl(${num % 256}, 100%, 30%)`
}
