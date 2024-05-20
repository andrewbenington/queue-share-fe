import { Container } from '@mui/joy'
import { Dayjs } from 'dayjs'
import { useContext, useEffect, useState } from 'react'
import CollapsingProgress from '../../components/collapsing-progress'
import { TrackRibbon } from '../../components/track-ribbon'
import useIsMobile from '../../hooks/is_mobile'
import { GetAllHistory } from '../../service/stats'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { MinEntry } from '../../types/stats'
import { displayError } from '../../util/errors'

export default function HistoryPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<MinEntry[]>()
  const [lastFetched, setLastFetched] = useState<Dayjs>()
  const [statsFriendState] = useContext(StatFriendContext)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    GetAllHistory(authState.access_token, statsFriendState.friend?.id).then((response) => {
      setLoading(false)
      if ('error' in response) {
        displayError(response.error)
        setError(response.error)
        return
      }
      setHistoryEntries(response.history)
      setLastFetched(response.last_fetched)
      return
    })
  }, [authState, error, statsFriendState])

  return (
    <Container style={{ height: '100%', overflowY: 'auto', maxWidth: 500 }}>
      <CollapsingProgress loading={loading} />
      {historyEntries && (
        <div style={{ margin: '8px 0px' }}>
          Last fetched: {lastFetched ? lastFetched.format('MMM D, YYYY h:mm a') : 'unknown'}
        </div>
      )}
      {historyEntries?.map((entry) => (
        <TrackRibbon
          song={{
            name: entry.track_name,
            uri: entry.spotify_track_uri,
            artists: entry.artists,
            image_url: entry.image_url,
            id: entry.spotify_track_uri.split(':')[2],
          }}
          imageSize={48}
          link
          rightComponent={
            <div style={{ textAlign: 'right', opacity: 0.8 }}>
              <div>{entry.timestamp.format(isMobile ? 'M/D, h:mm a' : 'MMM D, YYYY h:mm a')}</div>
              <div>
                {Math.floor(entry.ms_played / 60000)}:
                {((entry.ms_played % 60000) / 1000).toFixed(0).padStart(2, '0')} Played
              </div>
            </div>
          }
        />
      ))}
    </Container>
  )
}
