import React from 'react'

function WrapperBox({
    height,
    marginBottom,
    children
}) {
    return (
        <div style={{
            height,
            marginBottom,
        }}>
            {children}
        </div>
    )
}

export default WrapperBox