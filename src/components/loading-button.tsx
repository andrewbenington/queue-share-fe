import { Box, Button, ButtonProps, CircularProgress } from '@mui/joy'
import { useState } from 'react'

interface LoadingButtonProps extends ButtonProps {
  onClickAsync?: () => Promise<void> | undefined
  onClick?: () => void
}

export default function LoadingButton(props: LoadingButtonProps) {
  const { onClick, onClickAsync, children, ...attributes } = props
  const [loading, setLoading] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClickAsync) {
      setLoading(true)
      onClickAsync()
        ?.then(() => {
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
      return
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <Button onClick={handleClick} {...attributes} disabled={loading}>
      <Box position="relative">
        <div style={{ visibility: loading ? 'hidden' : 'visible' }}>{children}</div>
        <Box position="absolute" top={0} width="100%" visibility={loading ? 'visible' : 'hidden'}>
          <CircularProgress size="sm" color="primary" />
        </Box>
      </Box>
    </Button>
  )
}
