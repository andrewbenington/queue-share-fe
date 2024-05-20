import { Stack } from '@mui/material'
import useIsMobile from '../hooks/is_mobile'
import { TrackData } from '../types/spotify'
import { MinEntry } from '../types/stats'
import { TrackRibbonNarrow } from './track-ribbon-narrow'

export type TrackWithCaptionProps = {
  track: TrackData
  stream: MinEntry
  caption: string
}

export default function StreamWithCaption(props: TrackWithCaptionProps) {
  const { track, stream, caption } = props
  const isMobile = useIsMobile()
  return (
    <Stack spacing={1}>
      <div>{caption}: </div>
      <TrackRibbonNarrow
        song={track}
        rightComponent={
          <div>{stream.timestamp.format(isMobile ? 'MMM DD, YYYY' : 'MMM DD, YYYY h:mm a')}</div>
        }
        cardVariant="outlined"
        style={{ width: '100%' }}
      />
    </Stack>
  )
}
