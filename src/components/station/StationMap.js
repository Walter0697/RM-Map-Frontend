import React, { useMemo, useCallback, useRef } from 'react'

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
}) {
    const elementRef = useRef(null)

    const expectedWidth = useMemo(() => {
        return window.innerWidth * 0.9
    }, [])

    const expectedHeight = useMemo(() => {
        return expectedWidth * (dimension.height / dimension.width)
    }, [dimension, expectedWidth])

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
                    <img
                        style={{
                            position: 'absolute',
                            width: expectedWidth,
                            height: expectedHeight,
                        }}
                        src={mapImage}
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