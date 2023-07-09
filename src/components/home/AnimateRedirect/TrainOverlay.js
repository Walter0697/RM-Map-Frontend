import React from 'react'
import { animated } from '@react-spring/web'

import constants from '../../../constant'
import TrainIcon from '@mui/icons-material/Train'

function TrainOverlay({
    delta
}) {
    return (
        <animated.div style={{
            position: 'absolute',
            top: '50%',
            scale: '15',
            zIndex: 900,
            left: delta.to({
                range: [0, 1],
                output: ['-30%', '130%'],
            }),
            transform: delta.to({
                range: [0, 0.25, 0.5, 0.75, 1],
                output: ['rotate(0deg)', 'rotate(-15deg)', 'rotate(0deg)', 'rotate(15deg)', 'rotate(0deg)'],
            })
        }}>
            <TrainIcon sx={{ color: constants.colors.HomeButtonOverlayIcon }} />
        </animated.div>
    )
}

export default TrainOverlay