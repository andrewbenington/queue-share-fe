import { Typography } from '@mui/joy'
import { MdLaptop, MdQuestionMark, MdSmartphone, MdTv } from 'react-icons/md'
import { Device } from 'spotify-types'

export default function SpotifyDevice(props: Device) {
  function getDeviceIcon(label: string) {
    switch (label) {
      case 'Smartphone': {
        return <MdSmartphone />
      }
      case 'Computer': {
        return <MdLaptop />
      }
      case 'TV': {
        return <MdTv />
      }
      default: {
        return <MdQuestionMark />
      }
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Typography paddingRight={2}>{props.name}</Typography>
      {getDeviceIcon(props.type)}
    </div>
  )
}
