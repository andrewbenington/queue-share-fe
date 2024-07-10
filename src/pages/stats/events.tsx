import { Album, ArrowBack, ArrowForward, MusicNote, Person } from '@mui/icons-material'
import { Alert, Button, Card, Stack } from '@mui/joy'
import dayjs, { Dayjs } from 'dayjs'
import { debounce, groupBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AlbumRibbon } from '../../components/album-ribbon'
import { ArtistRibbon } from '../../components/artist-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import { TrackRibbon } from '../../components/track-ribbon'
import { AlbumEvent, ArtistEvent, GetEvents, TrackEvent } from '../../service/stats/events'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { displayError } from '../../util/errors'
import { formatRank, rankChangeColor } from '../../util/format'

export default function EventsPage() {
  const [events, setEvents] = useState<(ArtistEvent | TrackEvent | AlbumEvent)[]>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [authState] = useContext(AuthContext)
  const [statsFriendState] = useContext(StatFriendContext)
  const [start, setStart] = useState(dayjs().add(-14, 'day'))
  const [end, setEnd] = useState(dayjs())

  const fetchData = useCallback(
    debounce(async (startTime: Dayjs, endTime: Dayjs) => {
      if (!authState.access_token) return
      setLoading(true)
      const response = await GetEvents(
        authState.access_token,
        startTime,
        endTime,
        statsFriendState.friend?.id
      )
      setLoading(false)
      if ('error' in response) {
        displayError(response.error)
        setError(response.error)
        return
      }
      setEvents(response.reverse())
      return
    }, 500),
    [authState.access_token, statsFriendState.friend?.id]
  )

  useEffect(() => {
    fetchData(start, end)
  }, [fetchData, start, end])

  const grouped = useMemo(
    () => groupBy(events, (event) => dayjs.unix(event.date_unix).format('YYYY-MM-DD')),
    [events]
  )

  return error ? (
    <Alert>{error}</Alert>
  ) : (
    <div
      style={{
        overflowY: 'hidden',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Card
        style={{
          position: 'absolute',
          bottom: 15,
          left: '50%',
          zIndex: 1,
          transform: 'translate(-50%)',
          width: 'fit-content',
          height: 50,
          padding: 8,
        }}
        variant="outlined"
      >
        <Stack direction="row" justifyContent="space-evenly" width="100%" spacing={0} height={20}>
          <Button
            onClick={() => {
              setStart(start.add(-7, 'day'))
              setEnd(end.add(-7, 'day'))
            }}
            size="sm"
            style={{ height: 'fit-content' }}
          >
            <ArrowBack />
          </Button>
          <Button
            onClick={() => {
              setStart(start.add(7, 'day'))
              setEnd(end.add(7, 'day'))
            }}
            style={{ height: 'fit-content' }}
            size="sm"
          >
            <ArrowForward />
          </Button>
        </Stack>
        <div>
          {start.format('MMM D, YYYY')} - {end.format('MMM D, YYYY')}
        </div>
      </Card>
      <CollapsingProgress loading={loading} style={{ paddingTop: 8 }} />
      <Stack
        style={{
          overflowY: 'auto',
          margin: 'auto',
          height: 'calc(100% - 100px)',
          paddingBottom: 100,
        }}
        alignItems="center"
      >
        {events &&
          Object.entries(grouped).map(([date, dateEvents]) => (
            <>
              <Card style={{ padding: '4px 8px', minHeight: 30 }}>
                <div style={{ fontSize: 20 }}>{dayjs(date).format('MMM D, YYYY')}</div>
              </Card>
              <Stack style={{ width: 360 }}>
                {dateEvents.map((event) => (
                  <Card style={{ padding: 12 }}>
                    {/* <div>{dayjs(event.date_unix * 1000).format('h:mm a')}</div> */}
                    <Stack direction="row" width="100%" alignItems="center">
                      {'artist' in event ? (
                        <Person />
                      ) : 'track' in event ? (
                        <MusicNote />
                      ) : (
                        <Album />
                      )}
                      <Stack spacing={0.5} flex={1} width={0}>
                        <Stack direction="row">
                          <div style={{ color: rankChangeColor(1), width: 48 }}>
                            #{formatRank(event.rank, true)}
                          </div>
                          {'artist' in event ? (
                            <ArtistRibbon
                              artist={event.artist}
                              imageSize={24}
                              cardVariant="plain"
                              compact
                              rightComponent={<div>{event.streams}</div>}
                              height="fit-content"
                              flex={1}
                            />
                          ) : 'track' in event ? (
                            <TrackRibbon
                              track={event.track}
                              imageSize={24}
                              cardVariant="plain"
                              compact
                              rightComponent={<div>{event.streams}</div>}
                              height="fit-content"
                              flex={1}
                              link
                            />
                          ) : (
                            <AlbumRibbon
                              album={event.album}
                              imageSize={24}
                              cardVariant="plain"
                              compact
                              rightComponent={<div>{event.streams}</div>}
                              height="fit-content"
                              flex={1}
                            />
                          )}
                        </Stack>
                        {event.surpassed?.map((surpassed) => (
                          <Stack direction="row">
                            <div style={{ color: rankChangeColor(-1), width: 48 }}>
                              #{formatRank(surpassed.rank, false)}
                            </div>
                            {'artist' in surpassed ? (
                              <ArtistRibbon
                                artist={surpassed.artist}
                                imageSize={24}
                                cardVariant="plain"
                                height="fit-content"
                                marginLeft={32}
                                compact
                                rightComponent={<div>{surpassed.streams}</div>}
                                flex={1}
                              />
                            ) : 'track' in surpassed ? (
                              <TrackRibbon
                                track={surpassed.track}
                                imageSize={24}
                                cardVariant="plain"
                                height="fit-content"
                                marginLeft={32}
                                compact
                                rightComponent={<div>{surpassed.streams}</div>}
                                flex={1}
                                link
                              />
                            ) : (
                              <AlbumRibbon
                                album={surpassed.album}
                                imageSize={24}
                                cardVariant="plain"
                                height="fit-content"
                                marginLeft={32}
                                compact
                                rightComponent={<div>{surpassed.streams}</div>}
                                flex={1}
                              />
                            )}
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </>
          ))}
      </Stack>
    </div>
  )
}
