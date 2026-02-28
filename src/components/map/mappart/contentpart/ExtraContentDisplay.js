import React, { useMemo } from 'react'

import StationContentDisplay from './StationContentDisplay'

import maphelper from '../../../../scripts/map'
import constants from '../../../../constant'

function ExtraContentDisplay({
    extraContent,
}) {
    const displayImage = useMemo(() => {
        if (!extraContent) return null
        switch (extraContent?.type) {
            case constants.overlay.typeStation:
                return maphelper.sprite.getPinSprite(extraContent?.type, extraContent?.item?.map_name)
        }
        return null
    }, [extraContent])

    if (extraContent?.type === constants.overlay.typeStation) {
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