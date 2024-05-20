import { Refresh } from '@mui/icons-material'
import { Box, Button, Option, Select, SelectProps } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'
import { Device } from 'spotify-types'
import { PlaybackDevices } from '../../service/playback'
import { AuthContext } from '../../state/auth'
import { RoomContext } from '../../state/room'
import SpotifyDevice from './device'

interface DeviceSelectProps extends SelectProps<string, false> {
  onDeviceSelect: (id: string) => void
}

const DeviceSelect = (props: DeviceSelectProps) => {
  const { onDeviceSelect, ...fieldProps } = props
  const [devices, setDevices] = useState<Device[]>()
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!devices && !error) {
      getUserDevices()
    }
  }, [devices, error])

  const getUserDevices = () => {
    if (roomState && authState.access_token) {
      PlaybackDevices(roomState?.code, authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          setError(true)
          return
        }
        const device = res.find((device) => device.is_active)?.id ?? res[0]?.id ?? ''
        setSelectedDevice(device)
        onDeviceSelect(device)
        setDevices(res)
      })
    }
  }

  return (
    <Box display="flex" alignItems="center">
      <Select
        placeholder="Device"
        value={selectedDevice ?? 'none'}
        onChange={(_, val) => {
          setSelectedDevice(val as string)
          onDeviceSelect(val as string)
        }}
        {...fieldProps}
        sx={{ m: 1.5, mt: 2 }}
      >
        {devices ? (
          devices.map((device) => (
            <Option key={device.id ?? ''} value={device.id ?? ''}>
              <SpotifyDevice {...device} />
            </Option>
          ))
        ) : (
          <Option value={'none'} disabled>
            No devices available
          </Option>
        )}
      </Select>
      <Button
        size="sm"
        color="neutral"
        onClick={getUserDevices}
        sx={{ mt: 2, mb: 1.5, ml: 0, mr: 1.5, width: 40, height: 40 }}
      >
        <Refresh />
      </Button>
    </Box>
  )
}

export default DeviceSelect
