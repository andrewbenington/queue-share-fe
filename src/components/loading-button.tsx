import { Box, CircularProgress } from '@mui/material'
import { useMemo, useState } from 'react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: () => Promise<void>
  onClick?: () => void
  variant?: 'destructive' | 'contained' | 'outlined'
}

export default function LoadingButton(props: LoadingButtonProps) {
  const { onClick, onClickAsync, children, variant, ...attributes } = props
  const [loading, setLoading] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClickAsync) {
      setLoading(true)
      onClickAsync()
        .then(() => {
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

  const className = useMemo(() => {
    if (props.disabled) return 'button-disabled'
    switch (variant) {
      case 'destructive':
        return 'button-destructive'
      case 'contained':
        return 'button-contained'
      case 'outlined':
        return 'button-outlined'
      default:
        return undefined
    }
  }, [variant])

  return (
    <button className={className} onClick={handleClick} {...attributes} disabled={loading}>
      <Box position="relative">
        <div style={{ visibility: loading ? 'hidden' : 'visible' }}>{children}</div>
        <Box position="absolute" top={0} width="100%" visibility={loading ? 'visible' : 'hidden'}>
          <CircularProgress size={18} color="inherit" />
        </Box>
      </Box>
    </button>
  )
}
