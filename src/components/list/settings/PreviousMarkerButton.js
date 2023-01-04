import React from 'react'
import {
    Button
} from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

function PreviousMarkerButton({
    onClickHandler,
}) {
    return (
        <Button 
          variant='contained'
          size='large'
          style={{
              backgroundColor: '#48acdb',
              height: '100%',
              width: '100%',
              boxShadow: '2px 2px 6px',
              textTransform: 'none',
              color: '#1c76d2',
          }}
          onClick={onClickHandler}
      >
         <FlagIcon sx={{ marginRight: '15px' }} /> Previous Markers
      </Button>
    )
}

export default PreviousMarkerButton