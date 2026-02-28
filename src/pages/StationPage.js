import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import {
    FormControl,
    MenuItem,
    Select,
} from '@mui/material'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import SettingsIcon from '@mui/icons-material/Settings'

import useBoop from '../hooks/useBoop'

import Base from './Base'
import StationMap from '../components/station/StationMap'
import StationInfo from '../components/station/StationInfo'
import CircleIconButton from '../components/field/CircleIconButton'
import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'
import StationSettingForm from '../components/form/station/StationSettingForm'
import backend from '../constant/backend'

import MTRImage from '../images/station/hkmtr2.jpeg'

import actions from '../store/actions'
import graphql from '../graphql'

const currentDimension = {
    width: 2000,
    height: 1322,
}

function StationPage({
    stations,
    dispatch,
    jwt,
}) {
    const history = useHistory()

    // graphql request
    const [ listStationGQL, { data: listData, loading: listLoading, error: listError } ] = useLazyQuery(graphql.stations.list, { fetchPolicy: 'no-cache' })

    useEffect(() => {
        if (listData) {
            dispatch(actions.resetStations(listData.stations))
            setMessage({ type: 'success', message: 'successfully update list' })
            activateMessage()
        }

        if (listError) {
            setMessage({ type: 'error', message: listError.message })
            activateMessage()
        }
    }, [listData, listError])

    const [ messageDisplay, activateMessage ] = useBoop(3000)
    const [ currentMessage, setMessage ] = useState(null)
    const [ currentMap, setCurrentMap ] = useState('HK_MTR')

    const availableMaps = useMemo(() => {
        const set = new Set((stations || []).map((item) => item.map_name).filter(Boolean))
        if (set.size === 0) return ['HK_MTR']
        return Array.from(set.values()).sort()
    }, [stations])

    useEffect(() => {
        if (!availableMaps.includes(currentMap)) {
            setCurrentMap(availableMaps[0])
        }
    }, [availableMaps, currentMap])

    const displayStations = useMemo(() => {
        return stations.filter(s => s.map_name === currentMap)
    }, [stations, currentMap])

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

    const pinchZoomRef = useRef(null)

    const [ openSettingForm, setOpenSettingForm ] = useState(false)
    const [ mapImage, setMapImage ] = useState(MTRImage)

    useEffect(() => {
        if (pinchZoomRef && pinchZoomRef.current) {
            reset()
        }
    }, [pinchZoomRef])

    useEffect(() => {
        const fetchMapAsset = async () => {
            if (!jwt) return
            try {
                const resp = await fetch(backend.withBasePath(`station-maps/${currentMap}`), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!resp.ok) return
                const payload = await resp.json()
                if (payload?.image_path) {
                    setMapImage(`${backend.IMAGE_LINK}${payload.image_path}`)
                    return
                }
            } catch (error) {
                console.warn('failed to load station map asset metadata', error)
            }
            setMapImage(MTRImage)
        }

        fetchMapAsset()
    }, [jwt, currentMap])

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

    const refresh = () => {
        console.log('calling')
        listStationGQL()
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
                {/* top bar button */}
                <div
                    style={{ 
                        position: 'absolute',
                        top: '3%',
                        left: '30px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={refresh}
                    >
                        <RotateLeftIcon />
                    </CircleIconButton>
                </div>
                <div
                    style={{ 
                        position: 'absolute',
                        top: '3%',
                        right: '90px',
                        minWidth: '180px',
                    }}
                >
                    <FormControl fullWidth size='small'>
                        <Select
                            value={currentMap}
                            onChange={(e) => setCurrentMap(e.target.value)}
                            sx={{ backgroundColor: '#fff' }}
                        >
                            {availableMaps.map((mapName) => (
                                <MenuItem key={mapName} value={mapName}>
                                    {mapName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <div
                    style={{ 
                        position: 'absolute',
                        top: '3%',
                        right: '30px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={() => setOpenSettingForm(true)}
                    >
                        <SettingsIcon />
                    </CircleIconButton>
                </div>
                {/* map zoom pinch view */}
                <div 
                    style={{
                        top: '12%',
                        height: '50%',
                        width: '100%',
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <StationMap 
                        mapImage={mapImage}
                        stations={displayStations}
                        dimension={currentDimension}
                        pinchZoomRef={pinchZoomRef}
                        onItemClickHandler={onLocationClick}
                    />
                </div>
                {/* station info view */}
                <div 
                    style={{
                        height: '34%',
                        top: '55%',
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
                        top: '15%',
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
            <StationSettingForm 
                open={openSettingForm}
                handleClose={() => setOpenSettingForm(false)}
            />
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
    jwt: state.auth.jwt,
})) (StationPage)
