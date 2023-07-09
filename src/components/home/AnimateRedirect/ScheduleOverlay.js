import React from 'react'
import { animated } from '@react-spring/web'

import constants from '../../../constant'
import TodayIcon from '@mui/icons-material/Today'

function ScheduleOverlay({
    delta
}) {
    return (
        <animated.div style={{
            position: 'absolute',
            scale: delta.to({
                range: [0, 1],
                output: ['0', '5'],
            }),
            transform: delta.to({
                range: [0, 1],
                output: ['rotate(0deg)', 'rotate(720deg)']
            }),
            top: '50%',
            left: '50%',
        }}>
            <TodayIcon sx={{ color: constants.colors.HomeButtonOverlayIcon }} />
        </animated.div>
    )
}

export default ScheduleOverlay