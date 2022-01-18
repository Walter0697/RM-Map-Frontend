import React, { useEffect } from 'react'

import OpenRiceInstruction from '../../../images/openrice.jpg'

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
                const current_source_id = linkStr.replace(baseURL, '')
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