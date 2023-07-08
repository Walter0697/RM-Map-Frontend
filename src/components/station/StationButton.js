import React, { useMemo } from 'react'

function StationButton({
    position,
    size,
    ratio, 
    active,
    value,
    onClickHandler,
}) {

    const top = useMemo(() => {
        return (position.y * ratio) - size / 2
    }, [position, size, ratio])

    const left = useMemo(() => {
        return (position.x * ratio) - size / 2
    }, [position, size, ratio])
    
    if (active) {
        return (
            <div style={{
                    position: 'absolute',
                    height: size,
                    width: size,
                    top: top,
                    left: left,
                    backgroundColor: '#001cb4cc',
                    borderRadius: '50%',
                }}
                onClick={() => onClickHandler(value)}
            >
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