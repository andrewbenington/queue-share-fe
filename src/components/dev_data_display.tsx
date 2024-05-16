import { DataObject } from '@mui/icons-material'
import { Button, Dialog } from '@mui/material'
import { DeveloperOnlyContent } from '../state/auth'
import { useState } from 'react'
import { InfoGrid } from './info-grid'

type DevDataDisplayProps = {
  data?: object
  icon?: JSX.Element
}

export function DevDataDisplay(props: DevDataDisplayProps) {
  const [debugModal, setDebugModal] = useState(false)
  return (
    <DeveloperOnlyContent>
      <Button
        variant="outlined"
        style={{
          padding: '0px 8px',
          minWidth: 0,
          minHeight: 0,
          height: 'fit-content',
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
        onClick={() => console.info(props.data)}
      >
        {props.icon ?? <DataObject />}
      </Button>
      <Dialog open={debugModal} onClose={() => setDebugModal(false)} fullWidth>
        <InfoGrid labelBreakpoints={{ xs: 4 }} data={props.data ?? {}} />
      </Dialog>
    </DeveloperOnlyContent>
  )
}
