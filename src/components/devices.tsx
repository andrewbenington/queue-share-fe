import { Laptop, QuestionMark, Smartphone } from '@mui/icons-material';
import { MenuItem, TextField, TextFieldProps, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { PlaybackDevice, PlaybackDevices } from '../service/playback';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';

interface DeviceSelectProps extends TextFieldProps<'standard'> {
  onDeviceSelect: (id: string) => void;
}

const DeviceSelect = (props: DeviceSelectProps) => {
  const { onDeviceSelect, ...fieldProps } = props;
  const [devices, setDevices] = useState<PlaybackDevice[]>();
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!devices && roomState?.code && authState.access_token && !error) {
      PlaybackDevices(roomState?.code, authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          setError(true);
          return;
        }
        const device = res.find((device) => device.is_active)?.id ?? res[0]?.id;
        setSelectedDevice(device);
        onDeviceSelect(device);
        setDevices(res);
      });
    }
  });

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

  return devices ? (
    <TextField
      label="Device"
      value={selectedDevice}
      select
      onChange={(e) => {
        setSelectedDevice(e.target.value);
        onDeviceSelect(e.target.value);
      }}
      {...fieldProps}
    >
      {devices.map((device) => (
        <MenuItem value={device.id} selected={device.is_active}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Typography paddingRight={2}>{device.name}</Typography>
            {getDeviceIcon(device.type)}
          </div>
        </MenuItem>
      ))}
    </TextField>
  ) : (
    <div />
  );
};

export default DeviceSelect;
