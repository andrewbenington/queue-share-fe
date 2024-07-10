import { Modal, ModalDialog, Stack, Typography } from '@mui/joy'
import { countBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GetTracksByURIs } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { TrackData } from '../../types/spotify'
import { displayError } from '../../util/errors'
import { spotifyIDFromURI } from '../../util/spotify'
import LoadingContainer from '../loading-container'
import { TrackRibbonNarrow } from '../track-ribbon-narrow'

type StreamCountModalProps = {
  title?: string
  trackURIs?: string[]
  onClose: () => void
}

export default function StreamCountModal(props: StreamCountModalProps) {
  const { title, trackURIs, onClose } = props
  const [trackData, setTrackData] = useState<Record<string, TrackData>>()
  const [authState] = useContext(AuthContext)

  const trackCounts = useMemo(() => countBy(trackURIs), [trackURIs])

  const fetchTracks = useCallback(async () => {
    if (!authState.access_token || !trackURIs) return
    const response = await GetTracksByURIs(authState.access_token, trackURIs)

    if ('error' in response) {
      displayError(response.error as string)
      return
    }

    setTrackData(response)
  }, [authState, trackURIs])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  return (
    <Modal open={!!trackURIs} onClose={onClose}>
      <ModalDialog style={{ overflow: 'auto' }} maxWidth={400}>
        <LoadingContainer loading={!trackData}>
          <Typography fontSize={22} marginBottom={1}>
            {title}
          </Typography>
          {trackData && (
            <Stack spacing={1}>
              {Object.entries(trackCounts)
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([uri, count]) => (
                  <TrackRibbonNarrow
                    key={uri}
                    track={trackData[spotifyIDFromURI(uri)]}
                    rightComponent={<div style={{ marginLeft: 8 }}>x{count}</div>}
                    cardVariant="plain"
                  />
                ))}
            </Stack>
          )}
        </LoadingContainer>
      </ModalDialog>
    </Modal>
  )
}
