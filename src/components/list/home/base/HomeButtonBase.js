import React from 'react'
import {
    Button,
} from '@mui/material'

import constants from '../../../../constant'

function HomeButtonBase({
    width,
    left,
    label,
    icon,
    fontSize,
    iconScale,
    onClickHandler,
}) {
    return (
        <Button 
            style={{
                width: width,
                left: left,
                backgroundColor: constants.colors.CardBackground,
                height: '100%',
                position: 'relative',
                textTransform: 'none',
                overflow: 'hidden',
            }}
            onClick={onClickHandler}
        >
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: fontSize,
            }}>{label}</div>
            <div style={{
                position: 'absolute',
                left: '82%',
                top: '60%',
                scale: iconScale ?? '3.8',
                transform: 'rotate(343deg)',
            }}>
                {icon}
            </div>
        </Button>
    )
}

export default HomeButtonBase