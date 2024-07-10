import { CircularProgress } from '@mui/joy'
import { CSSProperties } from 'react'

export type CollapsingProgressProps = {
  loading?: boolean
  style?: CSSProperties
}

export default function CollapsingProgress(props: CollapsingProgressProps) {
  const { loading, style } = props
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        justifyContent: 'center',
        height: loading ? 50 : 0,
        transition: 'height 0.3s, visibility 0.3s',
        visibility: loading ? 'visible' : 'collapse',
        ...style,
      }}
    >
      <CircularProgress />
    </div>
  )
}
