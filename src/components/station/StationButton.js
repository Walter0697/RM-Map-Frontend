import React, { useMemo } from 'react'
import DoneIcon from '@mui/icons-material/Done'

function StationButton({
    position,
    size,
    active,
    value,
    onClickHandler,
}) {
    const top = useMemo(() => {
        return position.y - size / 2
    }, [position, size])

    const left = useMemo(() => {
        return position.x - size / 2
    }, [position, size])
    
    if (active) {
        return (
            <div style={{
                position: 'absolute',
                height: size,
                width: size,
                top: top,
                left: left,
            }}>
                <DoneIcon sx={{ fontSize: size, color: 'blue' }}/>
            </div>
        )
    }
    return (
        <div
            style={{
                position: 'absolute',
                height: size,
                width: size,
                backgroundColor: 'transparent',
                top: top,
                left: left,
            }}
            onClick={() => onClickHandler(value)}
        >
        </div>
    )
}

export default StationButton