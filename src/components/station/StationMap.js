import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react'

import QuickPinchZoom, {
    make2dTransformValue,
    make3dTransformValue,
    hasTranslate3DSupport
  } from 'react-quick-pinch-zoom'
  
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  
  const use3DTransform = hasTranslate3DSupport() && !isSafari
  
  const makeTransformValue = use3DTransform
    ? make3dTransformValue
    : make2dTransformValue
  

import StationButton from './StationButton'

function StationMap({
    mapImage,
    stations,
    dimension,
    pinchZoomRef,
    onItemClickHandler,
    isMobile,
}) {
    const FADE_DURATION_MS = 700
    const elementRef = useRef(null)
    const fadeTimeoutRef = useRef(null)
    const [ viewport, setViewport ] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })
    const [ activeImage, setActiveImage ] = useState(mapImage || '')
    const [ previousImage, setPreviousImage ] = useState(null)
    const [ activeOpacity, setActiveOpacity ] = useState(1)

    useEffect(() => {
        const onResize = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        if (!mapImage) return
        if (!activeImage) {
            setActiveImage(mapImage)
            setActiveOpacity(1)
            return
        }
        if (mapImage === activeImage) return

        if (fadeTimeoutRef.current) {
            window.clearTimeout(fadeTimeoutRef.current)
            fadeTimeoutRef.current = null
        }

        setPreviousImage(activeImage)
        setActiveImage(mapImage)
        setActiveOpacity(0)
    }, [mapImage, activeImage])

    useEffect(() => (
        () => {
            if (fadeTimeoutRef.current) {
                window.clearTimeout(fadeTimeoutRef.current)
            }
        }
    ), [])

    const expectedWidth = useMemo(() => {
        const viewportWidth = Math.max(320, viewport.width || 320)
        const viewportHeight = Math.max(480, viewport.height || 480)
        const horizontalRatio = isMobile ? 0.94 : 0.9
        const maxHeightRatio = isMobile ? 0.44 : 0.5
        const naturalWidth = Math.min(viewportWidth * horizontalRatio, 1200)
        const naturalHeight = naturalWidth * (dimension.height / dimension.width)
        const maxHeight = viewportHeight * maxHeightRatio

        if (naturalHeight <= maxHeight) {
            return naturalWidth
        }
        return maxHeight * (dimension.width / dimension.height)
    }, [dimension, isMobile, viewport])

    const expectedHeight = useMemo(() => (
        expectedWidth * (dimension.height / dimension.width)
    ), [dimension, expectedWidth])

    const ratio = useMemo(() => {
        return expectedWidth / dimension.width
    }, [expectedWidth, dimension])

    const onUpdate = useCallback(({ x, y, scale }) => {
        const element = elementRef.current

        if (element) {
            const value = makeTransformValue({ x, y, scale })
            element.style.setProperty('transform', value)
        }
    }, [])

    const onActiveImageLoaded = () => {
        // Force a frame boundary so cached-image loads still animate visibly.
        window.requestAnimationFrame(() => {
            setActiveOpacity(1)
        })

        if (!previousImage) return
        if (fadeTimeoutRef.current) {
            window.clearTimeout(fadeTimeoutRef.current)
        }
        fadeTimeoutRef.current = window.setTimeout(() => {
            setPreviousImage(null)
            fadeTimeoutRef.current = null
        }, FADE_DURATION_MS + 60)
    }

    return (
        <div
            style={{
                width: expectedWidth,
                height: expectedHeight,
                backgroundColor: '#00000099',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '2px 2px 6px',
            }}
        >
            <QuickPinchZoom
                ref={pinchZoomRef}
                draggableUnzoomed={false}
                onUpdate={onUpdate}
            >
                <div ref={elementRef}
                    style={{
                        width: expectedWidth,
                        height: expectedHeight,
                        position: 'relative',
                    }}
                >
                    {previousImage ? (
                        <img
                            style={{
                                position: 'absolute',
                                width: expectedWidth,
                                height: expectedHeight,
                                opacity: 1 - activeOpacity,
                                transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
                                willChange: 'opacity',
                            }}
                            src={previousImage}
                            alt='Previous station map'
                        />
                    ) : null}
                    <img
                        style={{
                            position: 'absolute',
                            width: expectedWidth,
                            height: expectedHeight,
                            opacity: activeOpacity,
                            transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
                            willChange: 'opacity',
                        }}
                        src={activeImage || mapImage}
                        alt='Station map'
                        onLoad={onActiveImageLoaded}
                    />
                    {stations.map((station, index) => (
                        <StationButton
                            key={index}
                            position={{ x: station.photo_x, y: station.photo_y}}
                            ratio={ratio}
                            size={5}
                            active={station.active}
                            value={station.identifier}
                            onClickHandler={onItemClickHandler}
                        />
                    ))}
                </div>
            </QuickPinchZoom>
        </div>
    )
}

export default StationMap
