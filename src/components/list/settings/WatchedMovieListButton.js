import React from 'react'
import {
    Button
} from '@mui/material'
import MovieIcon from '@mui/icons-material/Movie'

function WatchedMovieListButton({
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
         <MovieIcon sx={{ marginRight: '15px' }} /> Watched Movies
      </Button>
    )
}

export default WatchedMovieListButton