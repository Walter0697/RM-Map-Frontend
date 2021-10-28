import React from 'react'
import {
    IconButton,
} from '@mui/material'

function CircleIconButton({
    onClickHandler,
    float,
    children,
}) {
    return (
        <IconButton
            size='large'
            style={{
                float: float ?? 'left',
                backgroundColor: 'white',
                boxShadow: '2px 2px 6px',
            }}
            onClick={onClickHandler}
        >
            {children}
        </IconButton>
    )
}

export default CircleIconButton