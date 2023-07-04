import React from 'react'

import constants from '../../constant'

function RoundImage({
    style,
    width,
    height,
    maxHeight,
    src,
    onError,
}) {
    return (
        <img
            style={{
                ...style,
                maxHeight: maxHeight ?? null,
                borderRadius: '5px',
            }}
            width={width ?? null}
            height={height ?? null}
            src={constants.BackendImageLink + src}
            onError={onError ?? null}
        />
    )
}

export default RoundImage