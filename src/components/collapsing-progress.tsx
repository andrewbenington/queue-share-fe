import { CircularProgress } from '@mui/joy'

export type CollapsingProgressProps = {
  loading?: boolean
}

export default function CollapsingProgress(props: CollapsingProgressProps) {
  const { loading } = props
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        justifyContent: 'center',
        height: loading ? 50 : 0,
        transition: 'height 0.3s, opacity 0.3s',
        opacity: loading ? 1 : 0,
      }}
    >
      <CircularProgress />
    </div>
  )
}
