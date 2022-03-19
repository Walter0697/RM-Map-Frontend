import React, { useMemo } from 'react'

import StationContentDisplay from './StationContentDisplay'

import maphelper from '../../../../scripts/map'
import constants from '../../../../constant'

function ExtraContentDisplay({
    extraContent,
}) {
    const displayImage = useMemo(() => {
        if (!extraContent) return null
        const image = maphelper.sprite.getPinSprite(extraContent?.type)
        return image
    }, [extraContent])

    if (extraContent?.type === constants.overlay.station.HKMTR) {
        return (
            <StationContentDisplay 
                icon={displayImage}
                localName={extraContent?.item?.local_name}
                label={extraContent?.item?.label}
            />    
        )
    }
    return false
}

export default ExtraContentDisplay