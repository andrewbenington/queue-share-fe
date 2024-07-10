import { ArrowBack, ArrowForward } from '@mui/icons-material'
import { Button, Card, Container, Stack } from '@mui/joy'
import dayjs, { Dayjs } from 'dayjs'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArtistRibbon } from '../../components/artist-ribbon'
import QSDataGrid from '../../components/display/qs-data-grid'
import UserDisplay from '../../components/friends/user-display'
import { TrackRibbon } from '../../components/track-ribbon'
import { GetLogEntries, LogEntry } from '../../service/admin'
import { GetArtistsByURIs } from '../../service/artists'
import { GetTracksByURIs } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { ArtistData, TrackData } from '../../types/spotify'
import { displayError } from '../../util/errors'
import { dayjsSorter, filterUndefined, SortableColumn, stringSorter } from '../../util/sort'

function trackIDFromEndpoint(endpoint: string) {
  const index = endpoint.indexOf('spotify:track:')
  if (index === -1) return { id: undefined, trimmed: undefined }
  return { id: endpoint.slice(index + 14, index + 36), trimmed: endpoint.slice(0, index) }
}

function artistIDFromEndpoint(endpoint: string) {
  const index = endpoint.indexOf('spotify:artist:')
  if (index === -1) return { id: undefined, trimmed: undefined }
  return { id: endpoint.slice(index + 15, index + 37), trimmed: endpoint.slice(0, index) }
}

export default function LogsPage() {
  const [authState] = useContext(AuthContext)
  const [logData, setLogData] = useState<LogEntry[]>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [date, setDate] = useState(
    searchParams.get('date') ? dayjs(searchParams.get('date')) : dayjs()
  )
  const [trackData, setTrackData] = useState<Record<string, TrackData>>()
  const [artistData, setArtistData] = useState<Record<string, ArtistData>>()

  const fetchData = useCallback(async () => {
    if (!authState.access_token) return
    const response = await GetLogEntries(authState.access_token, date)
    if ('error' in response) {
      displayError(response.error)
      return
    }
    setLogData(response)
  }, [authState.access_token, date])

  const trackURIs = useMemo(
    () =>
      logData
        ?.map((log) => {
          const index = log.endpoint.indexOf('spotify:track:')
          if (index === -1) return undefined
          return log.endpoint.slice(index, index + 36)
        })
        .filter(filterUndefined),
    [logData]
  )

  const fetchTracks = useCallback(async () => {
    if (!authState.access_token || !trackURIs?.length) return
    const response = await GetTracksByURIs(authState.access_token, trackURIs)

    if ('error' in response) {
      displayError(response.error as string)
      return
    }

    setTrackData(response)
  }, [authState, trackURIs])

  const artistURIs = useMemo(
    () =>
      logData
        ?.map((log) => {
          const index = log.endpoint.indexOf('spotify:artist:')
          if (index === -1) return ''
          return log.endpoint.slice(index, index + 37)
        })
        .filter(filterUndefined),
    [logData]
  )

  const fetchArtists = useCallback(async () => {
    if (!authState.access_token || !artistURIs?.length) return
    const response = await GetArtistsByURIs(authState.access_token, artistURIs)

    if ('error' in response) {
      displayError(response.error as string)
      return
    }

    setArtistData(response)
  }, [authState.access_token, artistURIs])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  const columns: SortableColumn<LogEntry>[] = useMemo(
    () => [
      {
        key: 'timestamp',
        name: 'Timestamp',
        width: 120,
        sortFunction: dayjsSorter((val) => val.timestamp),
        renderCell: (val) => val.row.timestamp.format('h:mm a'),
      },
      {
        key: 'user',
        name: 'User',
        sortFunction: stringSorter((val) => val.user.display_name),
        renderCell: (val) => <UserDisplay user={val.row.user} size={24} />,
        width: 180,
        cellClass: 'centered-cell',
      },
      {
        key: 'endpoint',
        name: 'Endpoint',
        minWidth: 280,
        sortFunction: stringSorter((val) => val.endpoint),
        renderCell: (val) => {
          const queryIndex = val.row.endpoint.indexOf('?')

          const { id: trackID, trimmed: trackTrimmed } = trackIDFromEndpoint(val.row.endpoint)
          if (trackID) {
            if (!trackData) return val.row.endpoint
            if (!trackID) return val.row.endpoint
            return (
              <Stack direction="row" alignItems="center">
                {trackTrimmed}
                <TrackRibbon
                  track={trackData[trackID]}
                  compact
                  imageSize={20}
                  cardVariant="plain"
                />
              </Stack>
            )
          }

          const { id: artistID, trimmed: artistTrimmed } = artistIDFromEndpoint(val.row.endpoint)
          if (artistID) {
            if (!artistData) return val.row.endpoint
            if (!artistID) return val.row.endpoint
            return (
              <Stack direction="row" alignItems="center">
                {artistTrimmed}
                <ArtistRibbon
                  artist={artistData[artistID]}
                  compact
                  imageSize={20}
                  cardVariant="plain"
                />
              </Stack>
            )
          }

          return queryIndex > 0 ? val.row.endpoint.slice(0, queryIndex) : val.row.endpoint
        },
      },
      {
        key: 'friend',
        name: 'Friend',
        sortFunction: stringSorter((val) => val.friend?.display_name),
        renderCell: (val) =>
          val.row.friend ? <UserDisplay user={val.row.friend} size={24} /> : '',
        width: 180,
        cellClass: 'centered-cell',
      },
    ],
    [artistData, trackData]
  )

  const updateDate = useCallback(
    (newDate: Dayjs) => {
      searchParams.set('date', newDate.format('YYYY-MM-DD'))
      setSearchParams(searchParams)
      setDate(newDate)
    },
    [searchParams, setSearchParams]
  )

  return (
    logData && (
      <Container style={{ width: 0, flex: 1 }}>
        <Stack style={{ height: '100%' }} justifyContent="center" spacing={1}>
          <Card style={{ padding: '12px 4px 4px 4px', marginTop: 8 }}>
            <div
              style={{
                justifyContent: 'center',
                marginBottom: 8,
                display: 'flex',
              }}
            >
              <Button
                onClick={() => updateDate(date.add(-1, 'day'))}
                style={{ minWidth: 0, marginRight: 8 }}
                size="sm"
              >
                <ArrowBack />
              </Button>
              <input
                type="date"
                value={date.format('YYYY-MM-DD')}
                onChange={(val) => {
                  updateDate(dayjs(val.target.value))
                }}
              />
              <Button
                onClick={() => updateDate(date.add(1, 'day'))}
                style={{ minWidth: 0, marginLeft: 8 }}
                size="sm"
              >
                <ArrowForward />
              </Button>
              <Button onClick={() => updateDate(dayjs())} size="sm">
                Today
              </Button>
            </div>
          </Card>
          <div style={{ flex: 1, height: 0 }}>
            <QSDataGrid
              columns={columns}
              rows={logData}
              defaultSort="timestamp"
              defaultSortDir="DESC"
              style={{ height: '100%' }}
            />
          </div>
        </Stack>
      </Container>
    )
  )
}
