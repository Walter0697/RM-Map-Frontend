import React, { useState, useEffect, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import { useLazyQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'
import StationButton from '../components/station/StationButton'

import QuickPinchZoom, { make2dTransformValue } from 'react-quick-pinch-zoom'
import MTRImage from '../images/station/hkmtr.jpeg'

import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'

import graphql from '../graphql'

function StationPage({
    stations,
}) {
    const history = useHistory()

    // graphql request
    //const { data: listData, loading: listLoading, error: listError } = useLazyQuery(graphql.stations.list, { fetchPolicy: 'no-cache' })

    //const [ stations, setStations ] = useState([])

    const elementRef = useRef(null)
    const pinZoomRef = useRef(null)

    useEffect(() => {
        console.log(stations)
    }, [stations])
    // useEffect(() => {
    //     if (listData) {
    //         setStations(listData.stations)
    //     }

    //     if (listError) {
    //         console.log(listError)
    //     }
    // }, [listData, listError])

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
                height: '90%',
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
                                {stations.map((station, index) => (
                                    <StationButton
                                        key={index}
                                        position={{ x: station.photo_x, y: station.photo_y}}
                                        size={30}
                                        active={false}
                                        value={station.identifier}
                                        onClickHandler={onLocationClick}
                                    />
                                ))}
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

export default connect(state => ({
    stations: state.station.stations,
})) (StationPage)