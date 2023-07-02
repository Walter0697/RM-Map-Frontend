import React, { useMemo, useEffect, useRef, useState } from 'react'

function useCountryPoint({
    headerHeight,
    trigger,
    visibleBoundary,
    displayInfo,
}) {
    const mapPointerRef = useRef(null)
    const [ currentPointer, setPointer ] = useState({ x: 0, y: 0})
    
    useEffect(() => {
        if (mapPointerRef.current) {
            const topPos = mapPointerRef.current.getBoundingClientRect().top + window.scrollY
            const leftPos = mapPointerRef.current.getBoundingClientRect().left + window.scrollX
            setPointer({
                x: leftPos,
                y: topPos - headerHeight,
            })
        }
    }, [mapPointerRef, trigger])

    const shouldShowPointer = useMemo(() => {
        if (!displayInfo) return false
        if (currentPointer.x > visibleBoundary.left && currentPointer.x < visibleBoundary.right) {
            if (currentPointer.y > visibleBoundary.top && currentPointer.y < visibleBoundary.bottom) {
                return true
            }
        }
        return false
    }, [visibleBoundary, currentPointer, displayInfo])

    return [mapPointerRef, currentPointer, shouldShowPointer]
}

export default useCountryPoint