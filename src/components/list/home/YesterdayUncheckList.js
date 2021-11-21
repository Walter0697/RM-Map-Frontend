import React from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import NotificationImportantIcon from '@mui/icons-material/NotificationImportant'

function YesterdayUncheckList({
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
              color: 'yellow',
          }}
          onClick={onClickHandler}
      >
          <NotificationImportantIcon style={{ marginRight: '10px' }}/> 
          Fill in status for yesterday!  
      </Button>
  )
}

export default YesterdayUncheckList