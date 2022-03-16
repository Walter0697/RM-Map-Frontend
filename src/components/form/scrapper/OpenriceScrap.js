import React, { useEffect } from 'react'

import OpenRiceInstruction from '../../../images/scrapper/openrice.jpg'
import scrapper from '../../../scripts/scrapper'

function OpenriceScrap({
    showInstruction,
    content,
    setFetchInfo,
    findInfoFailed,
    onDataSame,
    sourceId,
}) {
    useEffect(() => {
        if (content) {
            const data = scrapper.openrice.scrap(content)
            if (data) {
                const current_source_id = data.source_id
                const linkStr = data.link
                if (sourceId === current_source_id) {
                    onDataSame && onDataSame()
                } else {
                    setFetchInfo && setFetchInfo(current_source_id, linkStr)
                }
            } else {
                findInfoFailed && findInfoFailed()
            } 
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
        </>
    )
}

export default OpenriceScrap