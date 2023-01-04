import React from 'react'
import {
    Button
} from '@mui/material'
import DoneAllIcon from '@mui/icons-material/DoneAll'

function PreviousRoroadListButton({
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
         <DoneAllIcon sx={{ marginRight: '15px' }} /> Previous RoroadLists
      </Button>
    )
}

export default PreviousRoroadListButton