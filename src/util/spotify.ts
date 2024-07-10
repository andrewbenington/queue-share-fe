export function spotifyIDFromURI(uri: string) {
  const segments = uri.split(':')
  if (segments.length < 3) return ''
  return segments[2]
}
