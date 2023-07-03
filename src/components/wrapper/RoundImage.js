import React from 'react'

import constant from '../../scripts/constant'

function RoundImage({
    style,
    width,
    height,
    src,
    onError,
}) {
    return (
        <img
            style={{
                ...style,
                borderRadius: '5px',
            }}
            width={width ?? null}
            height={height ?? null}
            src={constant.BackendImageLink + src}
            onError={onError ?? null}
        />
    )
}

export default RoundImage