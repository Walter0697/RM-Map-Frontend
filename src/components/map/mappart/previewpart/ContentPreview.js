import React from 'react'
import MarkerPreview from './MarkerPreview'
import StationPreview from './StationPreview'

import constants from '../../../../constant'

function ContentPreview({
    imageExist,
    typeIcon,
    marker
}) {
    if (!marker) return false
    if (marker?.type === 'marker') {
        return (
            <MarkerPreview
                imageExist={imageExist}
                typeIcon={typeIcon}
                label={marker?.item?.label}
                address={marker?.item?.address}
            />
        )
    } else if (marker?.type === constants.overlay.typeStation) {
        return (
            <StationPreview
                imageExist={imageExist}
                localName={marker?.item?.local_name}
                label={marker?.item?.label}
            />
        )
    }
    return false
}

export default ContentPreview