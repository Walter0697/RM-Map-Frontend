import React, { useState } from 'react'
import {
    Grid,
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

function SettingList({
  relationUser,
  openRelationChange,
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
      <BottomUpTrail>
        <ButtonBox
          height={90}
        >
            <Button
                variant='contained'
                size='large'
                style={{
                    backgroundColor: '#48acdb',
                    height: '100%',
                    width: '100%',
                    boxShadow: '2px 2px 6px'
                }}
                onClick={openRelationChange}
            >
              <Grid 
                container 
                fullWidth
              >
                <Grid item xs={12}>Sharing markers with:</Grid>
                <Grid item xs={12}>{relationUser ?? '<nobody>'}</Grid>
              </Grid>
            </Button>
        </ButtonBox>
      </BottomUpTrail>
    </div>
  )
}

export default SettingList