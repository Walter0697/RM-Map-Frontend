import React from 'react'
import { animated } from '@react-spring/web'

import constants from '../../../constant'
import FlightIcon from '@mui/icons-material/Flight' 

function PlaneOverlay({
    delta
}) {
    return (
        <animated.div style={{
            position: 'absolute',
            zIndex: 900,
            scale: '15',
            top: delta.to({
                range: [0, 1],
                output: ['130%', '-30%'],
            }),
            left: delta.to({
                range: [0, 1],
                output: ['100%', '00%'],
            }),
            transform: 'rotate(-15deg)',
        }}>
            <FlightIcon sx={{ color: constants.colors.HomeButtonOverlayIcon }} />
        </animated.div>
    )
}

export default PlaneOverlay