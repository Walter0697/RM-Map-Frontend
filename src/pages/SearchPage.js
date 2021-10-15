import React, { useCallback } from 'react'
import SearchMap from '../components/map/SearchMap'
import Base from './Base'

function SearchPage() {
    const MemoMap = useCallback(<SearchMap />, [])

    return (
        <Base>
           {MemoMap}
        </Base>
    )
}

export default SearchPage