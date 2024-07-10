import { Components, CssVarsThemeOptions, Theme } from '@mui/joy'
import { ColorSystemOptions } from '@mui/joy/styles/extendTheme'

export const components: Components<Theme> = {
  JoyChip: {
    styleOverrides: {
      root: {
        transition: 'border 0.25s',
      },
    },
  },
  JoyCard: {
    styleOverrides: {
      root: {
        overflow: 'hidden',
      },
    },
    defaultProps: {
      variant: 'soft',
    },
  },
  JoyListItemDecorator: {
    styleOverrides: {
      root: {
        minInlineSize: 0,
      },
    },
  },
  JoySelect: { defaultProps: { variant: 'plain' } },
  JoyInput: { defaultProps: { variant: 'plain' } },
  JoySheet: { defaultProps: { variant: 'soft' } },
  JoyStack: {
    defaultProps: {
      spacing: 2,
    },
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        fontSize: 24,
      },
    },
  },
  // JoyListItemIcon: {
  //   defaultProps: {
  //     style: {
  //       minWidth: 'fit-content',
  //       maxWidth: 'fit-content',
  //     },
  //   },
  // },
  JoyListSubheader: {
    defaultProps: {
      sx: {
        backgroundColor: 'transparent',
      },
    },
  },
}

export const darkTheme: ColorSystemOptions = {
  palette: {
    mode: 'dark',
    primary: {
      50: '#fee0fc',
      100: '#fee0fc',
      200: '#f9b2f7',
      300: '#f476f2',
      400: '#f060f0',
      500: '#e0e',
      600: '#e800ea',
      700: '#d700dc',
      800: '#c500d9',
      900: '#6700c9',
      // solidBg: '#e0e',
      // plainBg: 'orange',
      // plainColor: 'green',
      // outlinedBg: 'purple',
      // outlinedBorder: '#e0e',
    },
    neutral: {
      100: '#fff',
      200: '#fff',
      300: '#fff',
      400: '#fff',
      500: '#fff',
      600: '#fff',
      700: '#555',
      800: '#3a3a3a',
      900: '#131313',
      softBg: '#222',
      softActiveBg: '#444',
      plainBg: '#444',
    },
    background: {
      body: '#131313',
      surface: '#222',
      // paper: '#131313',
    },
    text: { primary: '#fff', secondary: '#fff' },
  },
}

export const lightTheme: ColorSystemOptions = {
  palette: {
    mode: 'light',
    primary: {
      50: '#fee0fc',
      100: '#fee0fc',
      200: '#f9b2f7',
      300: '#f476f2',
      400: '#f060f0',
      500: '#e0e',
      600: '#e800ea',
      700: '#d700dc',
      800: '#c500d9',
      900: '#6700c9',
    },
    neutral: {
      100: '#fff',
      200: '#fff',
      300: '#ccc',
      400: '#555',
      500: '#555',
      600: '#555',
      700: '#555',
      800: '#3a3a3a',
      900: '#666',
      plainBg: '#eee',
      plainActiveBg: '#aaa',
      plainHoverBg: '#ccc',
      plainColor: '#666',
      plainHoverColor: '#666',
      softBg: '#fff',
      softColor: '#666',
      softActiveBg: '#aaa',
      softHoverBg: '#ccc',
      outlinedBorder: '#ccc',
      outlinedColor: '#666',
    },
    background: {
      body: '#fff',
      surface: '#fff',
      // paper: '#fff',
    },
    text: { primary: '#333', secondary: '#333', tertiary: '#333', icon: '#666' },
  },
}

export const QSTheme: CssVarsThemeOptions = {
  colorSchemes: {
    dark: darkTheme,
    light: lightTheme,
  },
  components,
}
