import React, { useEffect } from 'react'
import {
    Grid,
} from '@mui/material'

import RestaurantCard from '../../card/RestaurantCard'
import OpenRiceInstruction from '../../../images/openrice.jpg'

function OpenriceScrap({
    showInstruction,
    content,
    setFetchInfo,
    findInfoFailed,
    restaurant
}) {
    useEffect(() => {
        const baseURL = 'https://s.openrice.com/'
        const arrInfo = content.split('\n')
        let linkStr = ''
        for (let i = 0; i < arrInfo.length; i++) {
            const info = arrInfo[i]
            const index = info.indexOf(baseURL)
            if (index !== -1) {
                linkStr = info.substring(index)
            }
        }

        if (linkStr) {
            const sourceId = linkStr.replace(baseURL, '')
            setFetchInfo && setFetchInfo(sourceId, linkStr)
        } else {
            findInfoFailed && findInfoFailed()
        }
    }, [content])

    return (
        <>
            {showInstruction && (
                <>
                    <img 
                        style={{
                            width: '100%',
                            objectFit: 'contain'
                        }}
                        src={OpenRiceInstruction} 
                    />
                    {'Click on "Share" then "Copy"'}
                </>
            )}
            {restaurant && restaurant.restaurant && (
                <RestaurantCard
                    restaurant={restaurant.restaurant}
                />
            )}
        </>
    )
}

export default OpenriceScrap