import { Alert, Stack, Typography } from '@mui/joy'
import { debounce } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { ArtistRibbon } from '../../components/artist-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import { GetNewArtists, NewArtistEntry } from '../../service/stats/events'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { displayError } from '../../util/errors'

export default function NewPage() {
  const [newArtists, setNewArtists] = useState<NewArtistEntry[]>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [authState] = useContext(AuthContext)
  const [statsFriendState] = useContext(StatFriendContext)
  // const [start, setStart] = useState(dayjs().add(-14, 'day'))
  // const [end, setEnd] = useState(dayjs())

  const fetchData = useCallback(
    debounce(async () => {
      if (!authState.access_token) return
      setLoading(true)
      const response = await GetNewArtists(authState.access_token, statsFriendState.friend?.id)
      setLoading(false)
      if ('error' in response) {
        displayError(response.error)
        setError(response.error)
        return
      }
      setNewArtists(response)
      return
    }, 500),
    [authState.access_token, statsFriendState.friend?.id]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
      {/* <Card
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
            <MdArrowBack />
          </Button>
          <Button
            onClick={() => {
              setStart(start.add(7, 'day'))
              setEnd(end.add(7, 'day'))
            }}
            style={{ height: 'fit-content' }}
            size="sm"
          >
            <MdArrowForward />
          </Button>
        </Stack>
        <div>
          {start.format('MMM D, YYYY')} - {end.format('MMM D, YYYY')}
        </div>
      </Card> */}
      <CollapsingProgress loading={loading} style={{ paddingTop: 8 }} />
      <Stack
        style={{
          overflowY: 'auto',
          margin: 'auto',
          height: 'calc(100% - 100px)',
          paddingBottom: 100,
          width: 300,
        }}
        alignItems="center"
      >
        <Typography>New Artists This Month</Typography>
        {newArtists &&
          newArtists.map((newArtistData) => (
            <ArtistRibbon artist={newArtistData.artist} imageSize={48} />
          ))}
      </Stack>
    </div>
  )
}
