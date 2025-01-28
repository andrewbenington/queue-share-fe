import {
  Badge,
  Button,
  Card,
  CircularProgress,
  Grid,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'
import dayjs from 'dayjs'
import { max, mean, min, range, sum } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MdPerson } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { AlbumRibbon, MinAlbumData } from '../../components/album-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import MonthlyRankingCal from '../../components/monthly-ranking-cal'
import YearGraph, { ComponentsWithCount } from '../../components/stats/year-graph'
import { TrackRibbonNarrow } from '../../components/track-ribbon-narrow'
import StreamWithCaption from '../../components/track-with-caption'
import useIsMobile from '../../hooks/is_mobile'
import { usePersistentStringQuery } from '../../hooks/useQueryParam'
import { MonthRanking } from '../../service/stats'
import {
  ArtistStats,
  CompareFriendArtistStats,
  GetArtistRankings,
  GetArtistStats,
} from '../../service/stats/artists'
import { UserData } from '../../service/user'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { Timeframe } from '../../types/stats'
import { displayError } from '../../util/errors'
import { spotifyIDFromURI } from '../../util/spotify'

type RibbonsByYearAndDate = { [year: number]: { [date: string]: ComponentsWithCount } }

export default function ArtistDetails() {
  const { spotify_uri } = useParams()
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [artistData, setArtistData] = useState<ArtistStats>()
  const [rankings, setRankings] = useState<MonthRanking[]>()
  const [loading, setLoading] = useState(false)
  const [statsFriendState] = useContext(StatFriendContext)
  const isMobile = useIsMobile()

  const [allTimeRanksByUser, setAllTimeRanksByUser] = useState<Record<string, number>>()
  const [friendData, setFriendData] = useState<Record<string, UserData>>()
  const [timeframe, setTimeframe] = usePersistentStringQuery('timeframe', 'this_month')

  const start = useMemo(() => {
    const now = dayjs()
    switch (timeframe) {
      case 'today':
        return now.subtract(1, 'day')
      case 'this_week':
        return now.subtract(1, 'week')
      case 'this_month':
        return dayjs(new Date(now.year(), now.month(), 1))
      case 'this_year':
        return dayjs(new Date(now.year(), 0, 1))
      case 'all_time':
        return dayjs.unix(0)
    }
  }, [timeframe])

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    setLoading(true)
    const response = await GetArtistStats(
      authState.access_token,
      spotify_uri,
      statsFriendState.friend?.id,
      start
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setArtistData(response)
  }, [error, authState, spotify_uri, statsFriendState, start])

  const fetchRanks = useCallback(async () => {
    if (loading || !authState.access_token || !spotify_uri) return
    const response = await CompareFriendArtistStats(
      authState.access_token,
      start,
      dayjs(),
      false,
      200
    )
    if ('error' in response) {
      displayError(response.error)
      return
    }
    if (spotify_uri in response.ranks_by_uri) {
      setAllTimeRanksByUser(response.ranks_by_uri[spotify_uri])
    } else {
      setAllTimeRanksByUser({})
    }
    setFriendData(response.friend_data)
  }, [authState, spotify_uri, start])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchRanks()
  }, [authState, error, fetchRanks])

  const fetchRankings = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    setLoading(true)
    const response = await GetArtistRankings(
      authState.access_token,
      spotify_uri,
      'month',
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

  const streamsByDate: RibbonsByYearAndDate = useMemo(() => {
    const data: RibbonsByYearAndDate = {}
    artistData?.streams.forEach((stream) => {
      const dateString = stream.timestamp.format('YYYY-MM-DD')
      const streamYear = stream.timestamp.year()
      if (!(streamYear in data)) {
        data[streamYear] = {}
      }

      const track = artistData.tracks[spotifyIDFromURI(stream.spotify_track_uri)]
      let count = 1

      if (!(dateString in data[streamYear])) {
        data[streamYear][dateString] = {}
      } else if (stream.spotify_track_uri in data[streamYear][dateString]) {
        count = data[streamYear][dateString][stream.spotify_track_uri].count + 1
      }

      data[streamYear][dateString][stream.spotify_track_uri] = {
        count,
        component: (
          <TrackRibbonNarrow
            track={track}
            rightComponent={<div>x{count}</div>}
            cardVariant="plain"
          />
        ),
      }
    })
    return data
  }, [artistData])

  const maxCount = useMemo(
    () =>
      max(
        Object.values(streamsByDate).flatMap((yearStreams) =>
          Object.values(yearStreams).flatMap((componentsWithCounts) =>
            sum(Object.values(componentsWithCounts).map((data) => data.count))
          )
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

  const topAlbums = useMemo(() => {
    if (!artistData) return []
    const albumsByURI: { [key: string]: MinAlbumData } = {}
    const albumCountByURI: { [key: string]: number } = {}
    artistData?.streams
      .filter((stream) => stream.timestamp.isAfter(start))
      .forEach((stream) => {
        const track = artistData.tracks[spotifyIDFromURI(stream.spotify_track_uri)]
        albumsByURI[stream.spotify_album_uri] = {
          name: track.album_name,
          id: spotifyIDFromURI(track.album_uri),
          image_url: track.image_url,
          artists: [
            { name: track.artist_name, uri: track.artist_uri },
            ...(track.other_artists ?? []),
          ],
        }
        if (!(stream.spotify_album_uri in albumCountByURI)) {
          albumCountByURI[stream.spotify_album_uri] = 1
        } else {
          albumCountByURI[stream.spotify_album_uri] += 1
        }
      })

    const albumsWithRanks = []
    let currentRank = 0
    let prevStreams = Number.POSITIVE_INFINITY

    for (const [uri, streamCount] of Object.entries(albumCountByURI).sort(
      ([, countA], [, countB]) => countB - countA
    )) {
      const album = albumsByURI[uri]
      if (streamCount < prevStreams) {
        currentRank++
      }

      albumsWithRanks.push({ ...album, streams: streamCount, rank: currentRank })
      prevStreams = streamCount
    }

    return albumsWithRanks
  }, [artistData, start])

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
            <Grid xs={12} md={6}>
              <Stack>
                <Card id="artist-info">
                  <Stack direction="row">
                    {artistData.artist.image_url ? (
                      <img
                        src={artistData.artist.image_url}
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
                        <MdPerson style={{ fontSize: 96 }} />
                      </div>
                    )}

                    <Stack spacing={1}>
                      <div style={{ fontSize: 24 }}>{artistData.artist.name}</div>
                      <div style={{ fontSize: 18 }}>Popularity: {artistData.artist.popularity}</div>
                      <Typography>{artistData.streams.length} streams</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row">
                    <div style={{ fontSize: 16, marginTop: 4 }}>Overall Ranking:</div>
                    <Select
                      value={timeframe}
                      onChange={(_, val) => setTimeframe(val as Timeframe)}
                      size="sm"
                      sx={{ margin: '0px 8px 8px 8px' }}
                    >
                      <Option value="today">Today</Option>
                      <Option value="this_week">This Week</Option>
                      <Option value="this_month">This Month</Option>
                      <Option value="this_year">This Year</Option>
                      <Option value="all_time">All Time</Option>
                    </Select>
                  </Stack>
                  <Stack direction="row" marginTop={1} id="all-time-ranks">
                    {allTimeRanksByUser && !loading ? (
                      friendData &&
                      Object.entries(allTimeRanksByUser)
                        .sort(([, rankA], [, rankB]) => rankA - rankB)
                        .map(([userID, rank]) => (
                          <Badge badgeContent={`#${rank}`} color="warning" max={9999}>
                            <img
                              src={
                                userID === authState.userID
                                  ? authState.userSpotifyImageURL
                                  : friendData[userID].spotify_image_url
                              }
                              height={48}
                              width={48}
                              style={{ borderRadius: 4 }}
                            />
                          </Badge>
                        ))
                    ) : (
                      <CircularProgress />
                    )}
                  </Stack>
                </Card>
                <Card id="stream-info">
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
                    rankings={rankings?.map((ranking) => ({
                      ...ranking,
                      month: ranking.timestamp.month(),
                      year: ranking.timestamp.year(),
                    }))}
                    loading={loading}
                    firstStream={artistData.streams[0].timestamp}
                    lastStream={artistData.streams[artistData.streams.length - 1].timestamp}
                  />
                )}
              </Stack>
            </Grid>
            <Grid xs={12} md={6}>
              <Stack>
                <Card id="top-tracks">
                  <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                    <Typography>Top Tracks</Typography>
                    <Select
                      value={timeframe}
                      onChange={(_, val) => setTimeframe(val as Timeframe)}
                      size="sm"
                      sx={{ margin: '0px 8px 8px 8px' }}
                    >
                      <Option value="today">Today</Option>
                      <Option value="this_week">This Week</Option>
                      <Option value="this_month">This Month</Option>
                      <Option value="this_year">This Year</Option>
                      <Option value="all_time">All Time</Option>
                    </Select>
                    <Link
                      to={`/stats/track-rankings?artist_uris=${artistData.artist.uri}`}
                      style={{ flex: 1, display: 'grid', justifyContent: 'end' }}
                    >
                      <Button style={{ marginTop: -6 }} variant="outlined">
                        View By Month
                      </Button>
                    </Link>
                  </Stack>
                  <Stack spacing={1}>
                    {Object.values(artistData.track_ranks).map((trackData) => (
                      <Stack direction="row" width="100%" alignItems="center">
                        <div style={{ width: 30, textAlign: 'right' }}>{trackData.rank}. </div>
                        <TrackRibbonNarrow
                          track={artistData.tracks[trackData.spotify_id]}
                          rightComponent={<div>x{trackData.stream_count}</div>}
                          cardVariant="outlined"
                          style={{ width: '100%' }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            <Grid xs={12} md={6}>
              <Card id="top-albums">
                <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                  <Typography>Top Albums</Typography>
                  <Select
                    value={timeframe}
                    onChange={(_, val) => setTimeframe(val as Timeframe)}
                    size="sm"
                    sx={{ margin: '0px 8px 8px 8px' }}
                  >
                    <Option value="today">Today</Option>
                    <Option value="this_week">This Week</Option>
                    <Option value="this_month">This Month</Option>
                    <Option value="this_year">This Year</Option>
                    <Option value="all_time">All Time</Option>
                  </Select>
                  <Link
                    to={`/stats/album-rankings?artist_uri=${artistData.artist.uri}`}
                    style={{ flex: 1, display: 'grid', justifyContent: 'end' }}
                  >
                    <Button style={{ marginTop: -6 }} variant="outlined">
                      View By Month
                    </Button>
                  </Link>
                </Stack>
                <Stack spacing={1}>
                  {topAlbums.map((albumData) => (
                    <Stack direction="row" width="100%" alignItems="center">
                      <div style={{ width: 30, textAlign: 'right' }}>{albumData.rank}. </div>
                      <AlbumRibbon
                        compact
                        album={albumData}
                        cardVariant="outlined"
                        rightComponent={<div>x{albumData.streams}</div>}
                        key={albumData.id}
                        width="100%"
                      />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Grid>
            <Grid xs={12}>
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
                      ([date, componentsWithCount]) => ({
                        date: dayjs(date),
                        componentsWithCount,
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
