import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import { 
    Grid,
    Button,
} from '@mui/material'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

import useBoop from '../hooks/useBoop'

import Base from './Base'
import StationMap from '../components/station/StationMap'
import StationInfo from '../components/station/StationInfo'
import CircleIconButton from '../components/field/CircleIconButton'
import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'

import MTRImage from '../images/station/hkmtr.jpeg'

import graphql from '../graphql'

const currentMap = 'HK_MTR'
const currentDimension = {
    width: '2000px',
    height: '1322px',
}

function StationPage({
    stations,
}) {
    const history = useHistory()

    const [ messageDisplay, activateMessage ] = useBoop(3000)
    const [ currentMessage, setMessage ] = useState(null)

    const displayStations = useMemo(() => {
        return stations.filter(s => s.map_name === currentMap)
    }, [stations])

    const [ selectedStation, setSelected ] = useState(null)
    const selectedInfo = useMemo(() => {
        if (!selectedStation) return null
        const station = displayStations.find(s => s.identifier === selectedStation)
        if (station) {
            const line = JSON.parse(station.line_info)
            return {
                name: station.local_name,
                label: station.label,
                line: line,
                active: station.active,
            }
        }
        return null
    }, [ selectedStation, displayStations ])

    // graphql request
    //const { data: listData, loading: listLoading, error: listError } = useLazyQuery(graphql.stations.list, { fetchPolicy: 'no-cache' })

    //const [ stations, setStations ] = useState([])

    const pinchZoomRef = useRef(null)

    // useEffect(() => {
    //     if (listData) {
    //         setStations(listData.stations)
    //     }

    //     if (listError) {
    //         console.log(listError)
    //     }
    // }, [listData, listError])

    useEffect(() => {
        if (pinchZoomRef && pinchZoomRef.current) {
            reset()
        }
    }, [pinchZoomRef])

    const onLocationClick = (item) => {
        setSelected(item)
    }

    const onLocationStateChange = (active) => {
        if (active) {
            setMessage({ type: 'success', message: 'successfully add record'})
        } else {
            setMessage({ type: 'success', message: 'successfully remove record'})
        }
        activateMessage()
        setSelected(null)
    }

    const onLocationError = (message) => {
        setMessage({ type: 'error', message: message })
        activateMessage()
        setSelected(null)
    }

    const reset = () => {
        pinchZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1 })
    }

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
                        height: '60%',
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
                            backgroundColor: '#00000099',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '2px 2px 6px',
                        }}
                    >
                        <StationMap 
                            mapImage={MTRImage}
                            stations={displayStations}
                            dimension={currentDimension}
                            pinchZoomRef={pinchZoomRef}
                            onItemClickHandler={onLocationClick}
                        />
                    </div>
                </div>
                <div 
                    style={{
                        height: '25%',
                        top: '65%',
                        width: '100%',
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <StationInfo
                        currentMap={currentMap}
                        identifier={selectedStation}
                        station={selectedInfo}
                        onStationUpdate={onLocationStateChange}
                        onStationError={onLocationError}
                    />
                </div>
                <div
                    style={{ 
                        position: 'absolute',
                        bottom: '40%',
                        right: '30px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={reset}
                    >
                        <CenterFocusStrongIcon />
                    </CircleIconButton>
                </div>
            </div>
            <AutoHideAlert
                open={messageDisplay}
                type={currentMessage ? currentMessage.type : ''}
                message={currentMessage ? currentMessage.message: ''}
                timing={2000}
            />
        </Base>
    )
}

export default connect(state => ({
    stations: state.station.stations,
})) (StationPage)