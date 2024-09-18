import { Button, Modal } from '@mui/joy'
import { useState } from 'react'
import { MdDataObject } from 'react-icons/md'
import { DeveloperOnlyContent } from '../../state/auth'
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
        {props.icon ?? <MdDataObject />}
      </Button>
      <Modal open={debugModal} onClose={() => setDebugModal(false)}>
        <InfoGrid labelBreakpoints={{ xs: 4 }} data={props.data ?? {}} />
      </Modal>
    </DeveloperOnlyContent>
  )
}
