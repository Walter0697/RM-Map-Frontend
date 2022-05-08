import React from 'react'
import {
    IconButton,
} from '@mui/material'

function CircleIconButton({
    onClickHandler,
    background,
    disabled,
    float,
    children,
}) {
    return (
        <IconButton
            size='large'
            style={{
                float: float ?? 'left',
                backgroundColor: background ?? 'white',
                boxShadow: '2px 2px 6px',
            }}
            onClick={onClickHandler}
            disabled={disabled}
        >
            {children}
        </IconButton>
    )
}

export default CircleIconButton