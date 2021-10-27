import React, { useState } from 'react'
import {
    Grid,
    IconButton,
    Button,
} from '@mui/material'

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

function MarkerList({
  height,
  markers,
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
                    <Button
                      variant='contained'
                      size='large'
                      style={{
                        backgroundColor: '#48acdb',
                        borderRadius: '5px',
                        height: '100%',
                        width: '100%',
                        boxShadow: '2px 2px 6px',
                      }}
                      onClick={() => { setSelectedById(item.id) }}
                    >
                      <Grid
                        container
                        fullWidth
                      >
                        <Grid item xs={3}>
                          <img
                            width={'100px'}
                            src={process.env.REACT_APP_IMAGE_LINK + item.image_link}
                          />
                        </Grid>
                        <Grid item xs={9}>{item.label}</Grid>
                      </Grid>
                    </Button>
                  </ButtonBox>
                ))}
              </BottomUpTrail>
          </div>
        </>
    )
}

export default MarkerList