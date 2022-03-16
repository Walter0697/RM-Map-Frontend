import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import useBoop from '../hooks/useBoop'
import StationButton from '../components/station/StationButton'

import QuickPinchZoom, { make2dTransformValue } from 'react-quick-pinch-zoom'
import MTRImage from '../images/station/hkmtr.jpeg'

import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'

function StationPage() {
    const history = useHistory()

    const [ station, setStations ] = useState([])

    const elementRef = useRef(null)
    const pinZoomRef = useRef(null)

    useEffect(() => {
        if (pinZoomRef && pinZoomRef.current) {
            reset()
        }
    }, [pinZoomRef])

    const onLocationClick = (item) => {
        console.log(item)
    }

    const reset = () => {
        pinZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1 })
    }

    const onUpdate = useCallback(({ x, y, scale }) => {
        const element = elementRef.current
    
        if (element) {
            const value = make2dTransformValue({ x, y, scale })
            element.style.setProperty('transform', value)
        }
      }, [])

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers')}
                label='Station Page'
            />
            <div style={{
                height: '100%',
                width: '100%',
                paddingTop: '10px',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div 
                    style={{
                        height: '50%',
                        width: '100%',
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '90%',
                            height: '100%',
                            backgroundColor: 'red',
                            borderRadius: '10px',
                            overflow: 'hidden',
                        }}
                    >
                    <QuickPinchZoom 
                        ref={pinZoomRef}
                        onUpdate={onUpdate}
                    >
                        <div ref={elementRef}
                            style={{
                                width: '2000px',
                                height: '1322px',
                                position: 'relative',
                            }}
                        >
                            <img  
                                style={{
                                    position: 'absolute',
                                }}
                                src={MTRImage} 
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    height: '30px',
                                    width: '30px',
                                    backgroundColor: 'green',
                                    top: '240px',
                                    left: '698px',
                                }}
                                onClick={() => onLocationClick('2')}
                            />
                            <StationButton 
                                position={{ x: 781, y: 240 }}
                                size={30}
                                active={false}
                                value={1}
                                onClickHandler={onLocationClick}
                            />
                        </div>
                    </QuickPinchZoom>
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        backgroundColor: 'blue',
                        width: '50px',
                        height: '50px',
                    }}
                    onClick={reset}
                ></div>
            </div>
        </Base>
    )
}

export default StationPage