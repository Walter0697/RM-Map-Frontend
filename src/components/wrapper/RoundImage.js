import React from 'react'

import constant from '../../scripts/constant'

const buildImageSrc = (src) => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src

    const base = (constant.BackendImageLink || '').replace(/\/+$/, '')
    const imagePath = `${base}/`
    if (src.startsWith(imagePath)) {
        return src
    }

    if (src.startsWith('/image/')) {
        const baseRoot = base.endsWith('/image') ? base.slice(0, -6) : ''
        return `${baseRoot}${src}`
    }

    const path = `${src}`.replace(/^\/+/, '')
    return `${base}/${path}`
}

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
            src={buildImageSrc(src)}
            onError={onError ?? null}
        />
    )
}

export default RoundImage
