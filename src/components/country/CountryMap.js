import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'

import JapanMap from '../../images/country/japan.png'

import QuickPinchZoom, {
    make2dTransformValue,
    make3dTransformValue,
    hasTranslate3DSupport
} from 'react-quick-pinch-zoom'

import CircleIconButton from '../field/CircleIconButton'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap'

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

const use3DTransform = hasTranslate3DSupport() && !isSafari

const makeTransformValue = use3DTransform
? make3dTransformValue
: make2dTransformValue


function CountryMap({
    pointerRef,
    pointerRef2,
    displayInfo1,
    displayInfo2,
    dimension,
    setTrigger,
    onItemClickHandler,
    onMapClickHandler,
    addingPosition,
}) {
    const [position, setPosition] = useState(null)
    const parentRef = useRef(null)
    const elementRef = useRef(null)
    
    const transformRef = useRef({
        x: 0, y: 0, scale: 1
    })

    // for settinng reset zoom
    const pinchZoomRef = useRef(null)
    useEffect(() => {
        if (pinchZoomRef && pinchZoomRef.current) {
            reset()
        }
    }, [pinchZoomRef])

    const reset = () => {
        pinchZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1 })
    }

    const expectedWidth = useMemo(() => {
        return window.innerWidth * 0.9
    }, [])

    const expectedHeight = useMemo(() => {
        return expectedWidth * (dimension.height / dimension.width)
    }, [dimension, expectedWidth])

    const onUpdate = useCallback(({ x, y, scale }) => {
        const element = elementRef.current

        if (element) {
            transformRef.current = { x, y, scale }
            setTrigger((prev) => (prev + 1) % 10)
            const value = makeTransformValue({ x, y, scale })
            element.style.setProperty('transform', value)
        }
    }, [])

    return (
        <div
            ref={parentRef}
            style={{
                width: expectedWidth,
                height: expectedHeight,
                backgroundColor: '#00000099',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '2px 2px 6px',
                position: 'relative',
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
                        src={JapanMap}
                        onClick={(e) => {
                            const parent = parentRef.current
                            let bounds = parent.getBoundingClientRect()
                            let originX = e.clientX - bounds.left
                            let originY = e.clientY - bounds.top
                            const { x, y, scale } = transformRef.current
                            const finalX = originX / scale - x
                            const finalY = originY / scale - y
                            onMapClickHandler({ x: finalX, y: finalY })
                        }}
                    />
                    {addingPosition && (
                        <div
                            style={{
                                position: 'absolute',
                                left: addingPosition.x - 5,
                                top: addingPosition.y - 5,
                                pointerEvents: 'none',
                            }}
                        >
                            <ZoomInMapIcon fontSize='10px' color={'error'} />
                        </div>
                    )}
                    <CountryPointDot displayInfo={displayInfo1} pointerRef={pointerRef} />                   
                    <CountryPointDot displayInfo={displayInfo2} pointerRef={pointerRef2} />                   
                </div>
            </QuickPinchZoom>
            <div
                style={{ 
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                }}
            >
                <CircleIconButton
                    onClickHandler={reset}
                >
                    <CenterFocusStrongIcon />
                </CircleIconButton>
            </div>
        </div>
    )
}

function CountryPointDot({
    displayInfo,
    pointerRef,
}) {
    if (!displayInfo) return false
    return (
        <div 
            ref={pointerRef}
            style={{
                position: 'absolute',
                left: displayInfo.x,
                top: displayInfo.y,
                width: '10px',
                height: '10px',            
                pointerEvents: 'none',
            }}
        >
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'red',
                borderRadius: '5px',
                transform: 'translate(-50%, -50%)',
            }}></div>
        </div>
    )
}

export default CountryMap