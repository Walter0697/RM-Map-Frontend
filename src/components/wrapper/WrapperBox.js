import React from 'react'

function WrapperBox({
    minHeight,
    height,
    marginBottom,
    isCenter,
    children
}) {
    return (
        <div style={{
            minHeight: minHeight,
            height,
            marginBottom,
            display: isCenter ? 'flex' : '',
            justifyContent: isCenter ? 'center' : '',
        }}>
            {children}
        </div>
    )
}

export default WrapperBox