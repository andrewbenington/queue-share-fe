import { Smartphone, Laptop, QuestionMark } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Device } from 'spotify-types';

export default function SpotifyDevice(props: Device) {
  function getDeviceIcon(label: string) {
    switch (label) {
      case 'Smartphone': {
        return <Smartphone />;
      }
      case 'Computer': {
        return <Laptop />;
      }
      default: {
        return <QuestionMark />;
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
  );
}
