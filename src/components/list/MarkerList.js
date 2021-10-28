import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import StarIcon from '@mui/icons-material/Star'

import BottomUpTrail from '../animatein/BottomUpTrail'

function ButtonBox({
    height,
    children,
  }) {
  return (
    <div style={{
      height,
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function MarkerItem({
  item,
  onClickHandler,
}) {
  const [ imageExist, setImageExist ] = useState(false)
  
  useEffect(() => {
    if (item?.image_link) {
      setImageExist(true)
    } else {
      setImageExist(false)
    }
  }, [item])

  const onImageFailedToLoad = () => {
    setImageExist(false)
  }

  return (
    <Button
      variant='contained'
      size='large'
      style={{
        position: 'relative',
        backgroundColor: '#48acdb',
        borderRaduis: '5px',
        height: '100%',
        width: '100%',
        boxShadow: '2px 2px 6px',
        alignItems: 'flex-start',
      }}
      onClick={onClickHandler}
    >
      <Grid
        container
        fullWidth
      >
        { imageExist && (
          <Grid 
            item xs={3}
            style={{ marginTop: '15px' }}
          >
            <img
              width={'100%'}
              src={process.env.REACT_APP_IMAGE_LINK + item.image_link}
              onError={onImageFailedToLoad}
            />
          </Grid>
        )}
        <Grid 
          item 
          xs={imageExist ? 9 : 12}
          style={{
            marginTop: '15px',
          }}
        >
          {item.label}
        </Grid>
      </Grid>
      {item.is_fav && (
         <div
            style={{ 
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
          <StarIcon sx={{ color: 'yellow' }}/>
        </div>
      )}
     
    </Button>
  )
}

function MarkerList({
  height,
  markers,
  toMapView,
  setSelectedById,
}) {
    return (
        <>
          <div 
              style={{
                  position: 'absolute',
                  height: height,
                  width: '95%',
                  paddingLeft: '5%',
                  paddingTop: '20px',
                  overflow: 'auto',
              }}
          >
              <BottomUpTrail>
                {markers.map((item, index) => (
                  <ButtonBox
                    key={index}
                    height='150px'
                  >
                    <MarkerItem
                      item={item}
                      onClickHandler={() => setSelectedById(item.id)}
                    />
                  </ButtonBox>
                ))}
              </BottomUpTrail>
          </div>
        </>
    )
}

export default MarkerList