import React, { useState } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'
import { 
    useTrail, 
    animated, 
} from '@react-spring/web'

function SettingTrail({ 
  children,
}) {
  const items = React.Children.toArray(children)
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: 1,
    y: 0,
    from: { opacity: 0, y: 500 },
  })
  return (
    <div>
      {trail.map(({ ...style }, index) => (
        <animated.div key={index} style={style}>
            {items[index]}
        </animated.div>
      ))}
    </div>
  )
}

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
            height: '90%',
            width: '95%',
            paddingLeft: '5%',
            paddingTop: '20px',
        }}
    >
      <SettingTrail>
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
      </SettingTrail>
    </div>
  )
}

export default SettingList