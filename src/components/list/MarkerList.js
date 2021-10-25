import React, { useState } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import RandomFadeIn from '../wrapper/RandomFadeIn'

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
  markers,
}) {
    return (
        <div 
            style={{
                position: 'absolute',
                height: '80%',
                width: '95%',
                paddingLeft: '5%',
                paddingTop: '20px',
                overflow: 'auto',
            }}
        >
            <RandomFadeIn>
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
                    onClick={() => {}}
                  >
                    <Grid
                      container
                      fullWidth
                    >
                      <Grid item xs={3}>
                        <img
                          width={'100px'}
                          src={process.env.REACT_APP_IMAGE_LINK + '/' + item.image_link}
                        />
                      </Grid>
                      <Grid item xs={9}>{item.label}</Grid>
                    </Grid>
                  </Button>
                </ButtonBox>
              ))}
            </RandomFadeIn>
        </div>
    )
}

export default MarkerList