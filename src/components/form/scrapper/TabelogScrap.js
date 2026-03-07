import React, { useEffect } from 'react'

import scrapper from '../../../scripts/scrapper'

function TabelogScrap({
    content,
    setFetchInfo,
    findInfoFailed,
    onDataSame,
    sourceId,
}) {
    useEffect(() => {
        if (content) {
            const data = scrapper.tabelog.scrap(content)
            if (data) {
                const currentSourceID = data.source_id
                const linkStr = data.link
                if (sourceId === currentSourceID) {
                    onDataSame && onDataSame()
                } else {
                    setFetchInfo && setFetchInfo(currentSourceID, linkStr)
                }
            } else {
                findInfoFailed && findInfoFailed()
            }
        }
    }, [content])

    return null
}

export default TabelogScrap
