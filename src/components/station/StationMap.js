import React, { useState, useCallback, useRef } from 'react'

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

    const onUpdate = useCallback(({ x, y, scale }) => {
        const element = elementRef.current

        if (element) {
            const value = makeTransformValue({ x, y, scale })
            element.style.setProperty('transform', value)
        }
    }, [])

    return (
        <QuickPinchZoom
            ref={pinchZoomRef}
            draggableUnzoomed={false}
            onUpdate={onUpdate}
        >
            <div ref={elementRef}
                style={{
                    width: dimension.width,
                    height: dimension.height,
                    position: 'relative',
                }}
            >
                <img
                    style={{
                        position: 'absolute',
                    }}
                    src={mapImage}
                />
                {stations.map((station, index) => (
                    <StationButton
                        key={index}
                        position={{ x: station.photo_x, y: station.photo_y}}
                        size={30}
                        active={station.active}
                        value={station.identifier}
                        onClickHandler={onItemClickHandler}
                    />
                ))}
            </div>
        </QuickPinchZoom>
    )
}

export default StationMap