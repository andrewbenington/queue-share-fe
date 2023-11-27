import { Laptop, QuestionMark, Refresh, Smartphone } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
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
    if (!devices && !error) {
      getUserDevices();
    }
  }, [devices, error]);

  const getUserDevices = () => {
    if (roomState && authState.access_token) {
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
  };

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
    <Box display="flex" alignItems="center">
      <TextField
        label="Device"
        value={selectedDevice}
        select
        onChange={(e) => {
          setSelectedDevice(e.target.value);
          onDeviceSelect(e.target.value);
        }}
        {...fieldProps}
        fullWidth
        sx={{ m: 1.5, mt: 2 }}
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
      <IconButton
        // variant="outlined"
        size="small"
        color="secondary"
        onClick={getUserDevices}
        sx={{ mt: 2, mb: 1.5, ml: 0, mr: 1.5, width: 40, height: 40 }}
      >
        <Refresh />
      </IconButton>
    </Box>
  ) : (
    <div />
  );
};

export default DeviceSelect;
