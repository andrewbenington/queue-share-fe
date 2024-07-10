import { Badge, Card, Container, Option, Select, Stack, Tab, TabList, Tabs } from '@mui/joy'
import dayjs from 'dayjs'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Album, Artist } from 'spotify-types'
import { AlbumRibbon } from '../../components/album-ribbon'
import { ArtistRibbon } from '../../components/artist-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import UserIcon from '../../components/friends/user-icon'
import { TrackRibbon } from '../../components/track-ribbon'
import useIsMobile from '../../hooks/is_mobile'
import { usePersistentStringQuery } from '../../hooks/useQueryParam'
import { CompareFriendAlbumStats, FriendAlbumComparison } from '../../service/stats/albums'
import { CompareFriendArtistStats, FriendArtistComparison } from '../../service/stats/artists'
import { CompareFriendTrackStats, FriendTrackComparison } from '../../service/stats/tracks'
import { UserData } from '../../service/user'
import { AuthContext, AuthState } from '../../state/auth'
import { ArtistData, TrackData } from '../../types/spotify'
import { Timeframe } from '../../types/stats'
import { displayError } from '../../util/errors'
import { spotifyIDFromURI } from '../../util/spotify'

type TrackWithUserCounts = {
  track: TrackData
} & UserCounts

type ArtistWithUserCounts = {
  artist: ArtistData | Artist
} & UserCounts

type AlbumWithUserCounts = {
  album: Album
} & UserCounts

type UserCounts = {
  streams: { user: UserData; count: number }[]
  ranks: { user: UserData; rank: number }[]
}

export default function ComparePage() {
  const [trackCompare, setTrackCompare] = useState<FriendTrackComparison>()
  const [artistCompare, setArtistCompare] = useState<FriendArtistComparison>()
  const [albumCompare, setAlbumCompare] = useState<FriendAlbumComparison>()
  const [loading, setLoading] = useState(false)
  const [authState] = useContext(AuthContext)
  const [tab, setTab] = useState('artist')
  const [end] = useState(dayjs())
  const [timeframe, setTimeframe] = usePersistentStringQuery('timeframe', 'this_month')
  const isMobile = useIsMobile()

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

  const fetchTrackData = useCallback(async () => {
    if (loading || !authState.access_token) return
    setLoading(true)
    const response = await CompareFriendTrackStats(authState.access_token, start)
    if ('error' in response) {
      displayError(response.error)
      return
    }
    setLoading(false)
    setTrackCompare(response)
  }, [loading, authState, start, end])

  const fetchArtistData = useCallback(async () => {
    if (loading || !authState.access_token) return
    setLoading(true)
    const response = await CompareFriendArtistStats(authState.access_token, start)
    if ('error' in response) {
      displayError(response.error)
      return
    }
    setLoading(false)
    setArtistCompare(response)
  }, [loading, authState, start, end])

  const fetchAlbumData = useCallback(async () => {
    if (loading || !authState.access_token) return
    setLoading(true)
    const response = await CompareFriendAlbumStats(authState.access_token, start)
    if ('error' in response) {
      displayError(response.error)
      return
    }
    setLoading(false)
    setAlbumCompare(response)
  }, [loading, authState, start, end])

  useEffect(() => {
    if (authState.access_token) {
      fetchTrackData()
      fetchArtistData()
      fetchAlbumData()
    }
  }, [authState, start, end])

  const tracksWithData: TrackWithUserCounts[] = useMemo(() => {
    const authUserID = authState.userID
    if (!trackCompare || !authUserID) return []
    return Object.entries(trackCompare.streams_by_uri)
      .sort(([, streamsA], [, streamsB]) => streamsB[authUserID] - streamsA[authUserID])
      .map(([uri, streams]) => {
        const trackData: TrackWithUserCounts = {
          track: trackCompare.track_data[spotifyIDFromURI(uri)],
          streams: [],
          ranks: [],
        }
        Object.entries(streams)
          .sort(
            ([userIDA], [userIDB]) =>
              trackCompare.ranks_by_uri[uri][userIDA] - trackCompare.ranks_by_uri[uri][userIDB]
          )
          .forEach(([userID, streamCount]) => {
            const user: UserData =
              userID === authState.userID
                ? userDataFromAuthState(authState)
                : trackCompare.friend_data[userID]

            trackData.streams.push({ user, count: streamCount })
            trackData.ranks.push({ user, rank: trackCompare.ranks_by_uri[uri][userID] })
          })
        return trackData
      })
  }, [trackCompare])

  const artistsWithData: ArtistWithUserCounts[] = useMemo(() => {
    const authUserID = authState.userID
    if (!artistCompare || !authUserID) return []
    return Object.entries(artistCompare.streams_by_uri)
      .sort(([, streamsA], [, streamsB]) => streamsB[authUserID] - streamsA[authUserID])
      .map(([uri, streams]) => {
        const artistData: ArtistWithUserCounts = {
          artist: artistCompare.artist_data[spotifyIDFromURI(uri)],
          streams: [],
          ranks: [],
        }
        Object.entries(streams)
          .sort(
            ([userIDA], [userIDB]) =>
              artistCompare.ranks_by_uri[uri][userIDA] - artistCompare.ranks_by_uri[uri][userIDB]
          )
          .forEach(([userID, streamCount]) => {
            const user: UserData =
              userID === authState.userID
                ? userDataFromAuthState(authState)
                : artistCompare.friend_data[userID]

            artistData.streams.push({ user, count: streamCount })
            artistData.ranks.push({ user, rank: artistCompare.ranks_by_uri[uri][userID] })
          })
        return artistData
      })
  }, [artistCompare, authState])

  const albumsWithData: AlbumWithUserCounts[] = useMemo(() => {
    const authUserID = authState.userID
    if (!albumCompare || !authUserID) return []
    return Object.entries(albumCompare.streams_by_uri)
      .sort(([, streamsA], [, streamsB]) => streamsB[authUserID] - streamsA[authUserID])
      .map(([uri, streams]) => {
        const albumData: AlbumWithUserCounts = {
          album: albumCompare.album_data[spotifyIDFromURI(uri)],
          streams: [],
          ranks: [],
        }
        Object.entries(streams)
          .sort(
            ([userIDA], [userIDB]) =>
              albumCompare.ranks_by_uri[uri][userIDA] - albumCompare.ranks_by_uri[uri][userIDB]
          )
          .forEach(([userID, streamCount]) => {
            const user: UserData =
              userID === authState.userID
                ? userDataFromAuthState(authState)
                : albumCompare.friend_data[userID]

            albumData.streams.push({ user, count: streamCount })
            albumData.ranks.push({ user, rank: albumCompare.ranks_by_uri[uri][userID] })
          })
        return albumData
      })
  }, [albumCompare, authState])

  return (
    <Container
      style={{
        width: '100%',
        paddingTop: 16,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CollapsingProgress loading={loading} />
      <Card style={{ padding: 0, maxWidth: 400, paddingBottom: 16 }}>
        <Tabs value={tab} onChange={(_, val) => setTab(val as string)}>
          <TabList>
            <Tab value="track">Tracks</Tab>
            <Tab value="artist">Artists</Tab>
            <Tab value="album">Albums</Tab>
          </TabList>
        </Tabs>
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
      </Card>
      <Stack
        width="100%"
        alignItems="center"
        height="100%"
        overflow="auto"
        padding={2}
        spacing={isMobile ? 4 : 2}
      >
        {tab === 'track' && trackCompare && authState.userID
          ? tracksWithData.map((trackWithData) => (
              <UserTrackComparison data={trackWithData} key={trackWithData.track.uri} />
            ))
          : tab === 'artist' && artistCompare && authState.userID
            ? artistsWithData.map((artistWithData) => (
                <UserArtistComparison data={artistWithData} key={artistWithData.artist.uri} />
              ))
            : albumCompare &&
              albumsWithData.map((albumWithData) => (
                <UserAlbumComparison data={albumWithData} key={albumWithData.album.uri} />
              ))}
      </Stack>
    </Container>
  )
}

function userDataFromAuthState(authState: AuthState): UserData {
  return {
    display_name: authState.userDisplayName ?? '',
    id: authState.userID ?? '',
    username: authState.username ?? '',
    spotify_image_url: authState.userSpotifyImageURL,
  }
}

export type UserTrackComparisonProps = {
  data: TrackWithUserCounts
}

export function UserTrackComparison(props: UserTrackComparisonProps) {
  const { track, ...data } = props.data

  const RibbonComponent = useMemo(
    () => <TrackRibbon track={track} imageSize={48} width={240} link />,
    [data]
  )

  return <UserComparison data={data} ribbonComponent={RibbonComponent} />
}

export type UserArtistComparisonProps = {
  data: ArtistWithUserCounts
}

export function UserArtistComparison(props: UserArtistComparisonProps) {
  const { artist, ...data } = props.data

  const RibbonComponent = useMemo(
    () => <ArtistRibbon artist={artist} imageSize={48} width={240} />,
    [data]
  )

  return <UserComparison data={data} ribbonComponent={RibbonComponent} />
}

export type UserAlbumComparisonProps = {
  data: AlbumWithUserCounts
}

export function UserAlbumComparison(props: UserAlbumComparisonProps) {
  const { album, ...data } = props.data

  const RibbonComponent = useMemo(
    () => <AlbumRibbon album={album} imageSize={48} width={240} />,
    [data]
  )

  return <UserComparison data={data} ribbonComponent={RibbonComponent} />
}
export type UserComparisonProps = {
  data: UserCounts
  ribbonComponent: JSX.Element
}

export function UserComparison(props: UserComparisonProps) {
  const { data, ribbonComponent } = props
  const isMobile = useIsMobile()

  const RankingsComponent = useMemo(
    () => (
      <Stack direction="row">
        {data.ranks.map(({ user, rank }) => (
          <Badge badgeContent={`#${rank}`} color="warning" max={9999}>
            <UserIcon user={user} size={48} />
          </Badge>
        ))}
      </Stack>
    ),
    [data]
  )

  const StreamsComponent = useMemo(
    () => (
      <Stack direction="row">
        {data.streams.map(({ user, count }) => (
          <Badge badgeContent={`x${count}`} color="primary" max={9999}>
            <UserIcon user={user} size={48} />
          </Badge>
        ))}
      </Stack>
    ),
    [data]
  )

  return (
    <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 2 : 4}>
      {isMobile ? ribbonComponent : RankingsComponent}
      {isMobile ? RankingsComponent : ribbonComponent}
      {StreamsComponent}
    </Stack>
  )
}
