import React, { useMemo } from 'react'

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
    return (
        <div
            style={{
                position: 'absolute',
                height: size,
                width: size,
                backgroundColor: active ? 'blue' : 'green',
                top: top,
                left: left,
            }}
            onClick={() => onClickHandler(value)}
        >
        </div>
    )
}

export default StationButton