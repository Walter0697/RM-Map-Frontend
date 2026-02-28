import React from 'react'
import { animated } from '@react-spring/web'

import constants from '../../../constant'
import RoomIcon from '@mui/icons-material/Room'

function MarkerOverlay({
    delta
}) {
    return (
        <animated.div style={{
            position: 'absolute',
            zIndex: 900,
            top: delta.to({
                range: [0, 1],
                output: ['-30%', '130%'],
            }),
            scale: '15',
            left: '50%',
        }}>
            <RoomIcon sx={{ color: constants.colors.HomeButtonOverlayIcon }} />
        </animated.div>
    )
}

export default MarkerOverlay