import { Box, Chip, Typography } from '@mui/joy'
import { useContext, useMemo } from 'react'
import CollapsingProgress from '../components/display/collapsing-progress'
import PlaybackControls from '../components/queue/playback'
import StartPanel from '../components/queue/start'
import { TrackRibbon } from '../components/track-ribbon'
import useIsMobile from '../hooks/is_mobile'
import { RoomContext } from '../state/room'

export default function QueuePage(props: { loading: boolean; refresh: () => void }) {
  const { loading, refresh } = props
  const [roomState] = useContext(RoomContext)
  const isMobile = useIsMobile()

  const lastQueueIndex: number = useMemo(() => {
    let index = -1
    if (roomState) {
      roomState.queue?.forEach((entry, i) => {
        if (entry.added_by) {
          index = i
        }
      })
    }
    return index
  }, [roomState])

  if (
    !roomState ||
    !roomState.currentlyPlaying ||
    ((!roomState?.queue || roomState.queue.length === 0) && roomState.currentlyPlaying?.id === '')
  ) {
    return <StartPanel loading={loading} refresh={refresh} />
  }

  return (
    <Box width={isMobile ? '97%' : '100%'} mt={1}>
      <CollapsingProgress loading={loading} />
      <Typography fontWeight="bold" mb={1}>
        Now Playing
      </Typography>
      <PlaybackControls refresh={refresh} />
      {roomState.queue && lastQueueIndex !== -1 ? (
        <div>
          <Typography fontWeight="bold" mb={1}>
            Queue
          </Typography>
          {roomState.queue.slice(0, lastQueueIndex + 1).map((entry, i) => (
            <TrackRibbon
              key={`queue_${i}`}
              track={entry}
              rightComponent={entry.added_by ? <Chip>{entry.added_by}</Chip> : undefined}
            />
          ))}
        </div>
      ) : (
        <div />
      )}
      {roomState.queue && lastQueueIndex < roomState.queue.length ? (
        <div>
          <Typography fontWeight="bold" mb={1}>
            Up Next
          </Typography>
          {roomState.queue.slice(lastQueueIndex === -1 ? 0 : lastQueueIndex + 1).map((entry, i) => (
            <TrackRibbon
              key={`queue_${lastQueueIndex === -1 ? i : lastQueueIndex + 1 + i}`}
              track={entry}
              rightComponent={entry.added_by ? <Chip>{entry.added_by}</Chip> : undefined}
            />
          ))}
        </div>
      ) : (
        <div />
      )}
    </Box>
  )
}
