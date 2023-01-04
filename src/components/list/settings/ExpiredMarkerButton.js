import React from 'react'
import {
    Button
} from '@mui/material'
import AvTimerIcon from '@mui/icons-material/AvTimer'

function ExpiredMarkerButton({
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
         <AvTimerIcon sx={{ marginRight: '15px' }} /> Expired Markers
      </Button>
    )
}

export default ExpiredMarkerButton