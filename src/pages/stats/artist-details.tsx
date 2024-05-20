import { Person } from '@mui/icons-material'
import { Card, Grid, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { max, mean, min, range, sum } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CollapsingProgress from '../../components/collapsing-progress'
import MonthlyRankingCal from '../../components/monthly-ranking-cal'
import YearGraph, { ItemCounts } from '../../components/stats/year-graph'
import { TrackRibbonNarrow } from '../../components/track-ribbon-narrow'
import StreamWithCaption from '../../components/track-with-caption'
import useIsMobile from '../../hooks/is_mobile'
import { MonthRanking } from '../../service/stats'
import { ArtistStats, GetArtistRankings, GetArtistStats } from '../../service/stats/artists'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { MinEntry } from '../../types/stats'
import { displayError } from '../../util/errors'
import { spotifyIDFromURI } from '../../util/spotify'

type StreamsByYearAndDate = { [year: number]: { [date: string]: ItemCounts } }

export default function ArtistDetails() {
  const { spotify_uri } = useParams()
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [artistData, setArtistData] = useState<ArtistStats>()
  const [rankings, setRankings] = useState<MonthRanking[]>()
  const [loading, setLoading] = useState(false)
  const [statsFriendState] = useContext(StatFriendContext)
  const isMobile = useIsMobile()

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    setLoading(true)
    const response = await GetArtistStats(
      authState.access_token,
      spotify_uri,
      statsFriendState.friend?.id
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setArtistData(response)
  }, [error, authState, spotify_uri, statsFriendState])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchData()
  }, [spotify_uri, error, authState, statsFriendState])

  const fetchRankings = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    setLoading(true)
    const response = await GetArtistRankings(
      authState.access_token,
      spotify_uri,
      statsFriendState.friend?.id
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setRankings(response)
  }, [error, authState, spotify_uri, statsFriendState])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchRankings()
  }, [spotify_uri, error, authState, statsFriendState])

  const minYear = useMemo(
    () => min(artistData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [artistData]
  ).year()

  const maxYear = useMemo(
    () => max(artistData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [artistData]
  ).year()

  const streamsByDate: StreamsByYearAndDate = useMemo(() => {
    const data: StreamsByYearAndDate = {}
    artistData?.streams.forEach((stream) => {
      const dateString = stream.timestamp.format('YYYY-MM-DD')
      const streamYear = stream.timestamp.year()
      if (!(streamYear in data)) {
        data[streamYear] = {}
      }
      if (dateString in data[streamYear]) {
        if (stream.track_name in data[streamYear][dateString]) {
          data[streamYear][dateString][stream.track_name] += 1
        } else {
          data[streamYear][dateString][stream.track_name] = 1
        }
      } else {
        data[streamYear][dateString] = {
          [stream.track_name]: 1,
        }
      }
    })
    return data
  }, [artistData])

  const maxCount = useMemo(
    () =>
      max(
        Object.values(streamsByDate).flatMap((yearStreams) =>
          Object.values(yearStreams).flatMap((itemCounts) => sum(Object.values(itemCounts)))
        )
      ),
    [streamsByDate]
  )

  const averageTimeOfDayHours = useMemo(
    () =>
      artistData
        ? mean(
            artistData.streams.map(
              (stream) => stream.timestamp.hour() + stream.timestamp.minute() / 60
            )
          )
        : 0,
    [artistData]
  )

  const topTracks = useMemo(() => {
    const streamsByURI: { [key: string]: MinEntry } = {}
    const trackCountByURI: { [key: string]: number } = {}
    // const tracksByISRC: {[isrc: string]: TrackData[]}
    artistData?.streams.forEach((stream) => {
      streamsByURI[stream.spotify_track_uri] = stream
      if (!(stream.spotify_track_uri in trackCountByURI)) {
        trackCountByURI[stream.spotify_track_uri] = 1
      } else {
        trackCountByURI[stream.spotify_track_uri] += 1
      }

      // const track = artistData.tracks[spotifyIDFromURI(stream.spotify_track_uri)]
      // if (track.isrc && (!(track.isrc in tracksByISRC) || tracksByISRC[track.isrc]))
    })
    return Object.entries(trackCountByURI)
      .map(([uri, count]) => ({
        ...streamsByURI[uri],
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)
  }, [artistData])

  const topAlbums = useMemo(() => {
    const streamsByURI: { [key: string]: MinEntry } = {}
    const albumCountByURI: { [key: string]: number } = {}
    artistData?.streams.forEach((stream) => {
      streamsByURI[stream.spotify_album_uri] = stream
      if (!(stream.spotify_album_uri in albumCountByURI)) {
        albumCountByURI[stream.spotify_album_uri] = 1
      } else {
        albumCountByURI[stream.spotify_album_uri] += 1
      }
    })
    return Object.entries(albumCountByURI)
      .map(([uri, count]) => ({
        ...streamsByURI[uri],
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [artistData])

  const firstStream = useMemo(() => {
    if (!artistData?.streams.length) return undefined
    return artistData.streams[0]
  }, [artistData])

  const latestStream = useMemo(() => {
    if (!artistData?.streams.length) return undefined
    return artistData.streams[artistData.streams.length - 1]
  }, [artistData])

  return (
    <div
      style={{
        flex: 1,
        width: 0,
        padding: 16,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <CollapsingProgress loading={loading} />
      {error ??
        (artistData && (
          <Grid container columnSpacing={2} rowSpacing={2} style={{ overflowY: 'auto' }}>
            <Grid item xs={12} md={6}>
              <Stack>
                <Card>
                  <Stack direction="row">
                    {artistData.artist.images.length ? (
                      <img
                        src={artistData.artist.images[0].url}
                        height={isMobile ? 64 : 128}
                        width={isMobile ? 64 : 128}
                      />
                    ) : (
                      <div
                        style={{
                          height: isMobile ? 64 : 128,
                          width: isMobile ? 64 : 128,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#ccc9',
                        }}
                      >
                        <Person style={{ fontSize: 96 }} />
                      </div>
                    )}
                    <Stack spacing={1}>
                      <div style={{ fontSize: 24 }}>{artistData.artist.name}</div>
                      <div style={{ fontSize: 18 }}>Popularity: {artistData.artist.popularity}</div>
                      <Typography variant="body1">{artistData.streams.length} streams</Typography>
                    </Stack>
                  </Stack>
                </Card>
                <Card>
                  <Stack>
                    {firstStream && (
                      <StreamWithCaption
                        stream={firstStream}
                        track={artistData.tracks[spotifyIDFromURI(firstStream.spotify_track_uri)]}
                        caption="First Stream"
                      />
                    )}
                    {latestStream && (
                      <StreamWithCaption
                        stream={latestStream}
                        track={artistData.tracks[spotifyIDFromURI(latestStream.spotify_track_uri)]}
                        caption="Latest Stream"
                      />
                    )}
                    {firstStream && (
                      <div>
                        Average Time of Day:{' '}
                        {dayjs(
                          `00-01-01 ${averageTimeOfDayHours.toPrecision(2)}:${(
                            (averageTimeOfDayHours * 60) %
                            60
                          )
                            .toFixed(0)
                            .padStart(2, '0')}`
                        ).format('h:mm a')}
                      </div>
                    )}
                  </Stack>
                </Card>
                {artistData.streams.length > 0 && (
                  <MonthlyRankingCal
                    rankings={rankings}
                    loading={loading}
                    firstStream={artistData.streams[0].timestamp}
                    lastStream={artistData.streams[artistData.streams.length - 1].timestamp}
                  />
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack>
                <Card>
                  <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                    <Typography>Top Tracks</Typography>
                    <Link to={`/stats/songs-by-month?artist_uris=${artistData.artist.uri}`}>
                      <button style={{ marginTop: -6 }}>View By Month</button>
                    </Link>
                  </Stack>
                  <Stack spacing={1}>
                    {topTracks.map((trackData, i) => (
                      <Stack direction="row" width="100%" alignItems="center">
                        <div style={{ width: 30, textAlign: 'right' }}>{i + 1}. </div>
                        <TrackRibbonNarrow
                          song={artistData.tracks[spotifyIDFromURI(trackData.spotify_track_uri)]}
                          rightComponent={<div>x{trackData.count}</div>}
                          cardVariant="outlined"
                          style={{ width: '100%' }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                  <Typography>Top Albums</Typography>
                  <Link to={`/stats/albums-by-month?artist_uri=${artistData.artist.uri}`}>
                    <button style={{ marginTop: -6 }}>View By Month</button>
                  </Link>
                </Stack>
                <Stack>
                  <Grid container>
                    {topAlbums.map((albumData, i) => (
                      <>
                        <Grid item xs={9} key={`name_${i}`}>
                          <Link
                            to={`/stats/album/${albumData.spotify_album_uri}`}
                            style={{
                              textDecoration: isMobile ? 'underline' : undefined,
                            }}
                          >
                            {i + 1}. {albumData.album_name}
                          </Link>
                        </Grid>
                        <Grid item xs={3} key={`streams_${i}`}>
                          {albumData.count} streams
                        </Grid>
                      </>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <Typography>All Streams</Typography>
                <div
                  style={{
                    overflowY: 'auto',
                    height: '100%',
                    overflowX: 'hidden',
                  }}
                >
                  {range(maxYear, minYear - 1, -1).map((year) => {
                    const yearData = Object.entries(streamsByDate[year] ?? {}).map(
                      ([date, itemCounts]) => ({
                        date: dayjs(date),
                        itemCounts,
                      })
                    )
                    return yearData.length ? (
                      <YearGraph key={year} year={year} data={yearData} maxCount={maxCount ?? 10} />
                    ) : (
                      <div />
                    )
                  })}
                </div>
              </Card>
            </Grid>
          </Grid>
        ))}
    </div>
  )
}
