import React, { useMemo } from 'react'
import {
    IconButton,
    Badge,
} from '@mui/material'

function CircleIconButton({
    onClickHandler,
    background,
    disabled,
    badgeNumber,
    float,
    children,
}) {
    const buttonComponent = useMemo(() => {
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
    }, [onClickHandler, background, disabled, float, children])

    if (!badgeNumber) {
        return buttonComponent
    }
    return (
        <Badge badgeContent={badgeNumber} color="primary">
            {buttonComponent}
        </Badge>
    )
}

export default CircleIconButton