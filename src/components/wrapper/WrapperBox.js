import React from 'react'

function WrapperBox({
    minHeight,
    height,
    marginBottom,
    children
}) {
    return (
        <div style={{
            minHeight: minHeight,
            height,
            marginBottom,
        }}>
            {children}
        </div>
    )
}

export default WrapperBox