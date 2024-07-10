export function formatStreamsChange(change?: number): string {
  if (change === undefined) return ''
  if (change > 0) return ` (+${change})`
  if (change === 0) return ` (±${change})`
  return ` (${change})`
}

export function formatRankChange(change?: number): string {
  if (change === undefined) return '(new)'
  if (change > 0) return `+${change} ↗`
  if (change === 0) return `±0`
  return `${change} ↘`
}

export function formatRank(rank: number, up: boolean): string {
  if (up) return `${rank} ↗`
  return `${rank} ↘`
}

export function rankChangeColor(change?: number): string | undefined {
  if (change === undefined) return '#ffcc00'
  if (change > 0) return '#00ff00'
  if (change === 0) return undefined
  return '#ff0000'
}
