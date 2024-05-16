import { Components, Theme, ThemeOptions } from '@mui/material'

const components: Components<Omit<Theme, 'components'>> = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        transition: 'border 0.25s',
      },
    },
  },
  MuiTypography: {
    defaultProps: {
      variant: 'h5',
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiCard: {
    defaultProps: {
      sx: {
        padding: 2,
      },
    },
  },
  MuiStack: {
    defaultProps: {
      spacing: 2,
    },
  },
  MuiListItemIcon: {
    defaultProps: {
      style: {
        minWidth: 'fit-content',
        maxWidth: 'fit-content',
      },
    },
  },
  MuiListSubheader: {
    defaultProps: {
      sx: {
        backgroundColor: 'transparent',
      },
    },
  },
}

export const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#e0e',
    },
    background: {
      default: '#3a3a3a',
      paper: '#131313',
    },
    text: { primary: '#fff', secondary: '#fff' },
  },
  components,
}

export const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#e0e',
    },
    background: {
      default: '#666',
      paper: '#fff',
    },
    text: { primary: '#000c', secondary: '#000c' },
  },
  components,
}
