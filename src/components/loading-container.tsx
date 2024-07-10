import { Box, CircularProgress } from '@mui/joy'
import { CSSProperties } from 'react'

interface LoadingContainerProps extends React.PropsWithChildren {
  loading?: boolean
  overlay?: boolean
  style?: CSSProperties
}

export default function LoadingContainer(props: LoadingContainerProps) {
  const { loading, overlay, children, style } = props
  return (
    <Box style={{ position: 'relative', width: 'inherit', height: 'inherit' }}>
      <div
        style={{
          visibility: loading && !overlay ? 'collapse' : 'visible',
          width: 'inherit',
          height: 'inherit',
          ...style,
        }}
      >
        {children}
      </div>
      {loading && (
        <Box
          position="absolute"
          display="grid"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          top={0}
          bottom={0}
          color="white"
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </Box>
  )
}
