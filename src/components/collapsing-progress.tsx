import { CircularProgress, Collapse, Fade } from '@mui/material'

export type CollapsingProgressProps = {
  loading?: boolean
}

export default function CollapsingProgress(props: CollapsingProgressProps) {
  const { loading } = props
  return (
    <Collapse in={loading} style={{ display: 'grid', justifyContent: 'center' }}>
      <Fade in={loading} style={{ margin: 10 }}>
        <CircularProgress />
      </Fade>
    </Collapse>
  )
}
