import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import SettingsIcon from '@mui/icons-material/Settings'
import PublicIcon from '@mui/icons-material/Public'

import useBoop from '../hooks/useBoop'

import Base from './Base'
import StationMap from '../components/station/StationMap'
import StationInfo from '../components/station/StationInfo'
import StationSettingForm from '../components/form/station/StationSettingForm'
import StationMapSelect from '../components/form/station/StationMapSelect'

import CircleIconButton from '../components/field/CircleIconButton'
import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'

import constants from '../constant'
import actions from '../store/actions'
import graphql from '../graphql'

function StationPage({
    stations,
    dispatch,
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

    // map related 
    const [ mapName, setMapName] = useState('HK_MTR')
    const stationMapInfo = useMemo(() => {
        const stationMap = constants.country.stationList.find(s => s.identifier === mapName)
       return stationMap
    }, [mapName])

    const currentDimension = useMemo(() => {
        if (!stationMapInfo) {
            return {
                width: 0,
                height: 0,
            }
        }
        return stationMapInfo.dimension
    }, [stationMapInfo])

    const stationImage = useMemo(() => {
        if (!stationMapInfo) return null
        return stationMapInfo.image
    }, [stationMapInfo])

    const stationLabel = useMemo(() => {
        if (!stationMapInfo) return null
        return stationMapInfo.label
    }, [stationMapInfo])

    // for changing map
    const [ openMapChange, setOpenMapChange ] = useState(false)

    const [ messageDisplay, activateMessage ] = useBoop(3000)
    const [ currentMessage, setMessage ] = useState(null)

    const displayStations = useMemo(() => {
        return stations.filter(s => s.map_name === mapName)
    }, [stations, mapName])

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

    const refresh = () => {
        listStationGQL()
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers')}
                label='Station Page'
            />
            <div style={{
                height: '80%',
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
                <div style={{
                    position: 'absolute',
                    top: '3%',
                    left: '25%',
                    height: '40px',
                    width: '50%',
                    backgroundColor: constants.colors.CardBackground,
                    color: 'white',
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '2px 2px 6px',
                }}>
                    {stationLabel}
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
                        mapImage={stationImage}
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
                        currentMap={mapName}
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
                <div
                    style={{ 
                        position: 'absolute',
                        bottom: '5%',
                        right: '30px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={() => setOpenMapChange(true)}
                    >
                        <PublicIcon />
                    </CircleIconButton>
                </div>
            </div>
            <StationSettingForm 
                open={openSettingForm}
                handleClose={() => setOpenSettingForm(false)}
            />
            <StationMapSelect 
                open={openMapChange}
                handleClose={() => setOpenMapChange(false)}
                mapName={mapName}
                setMapName={setMapName}
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
})) (StationPage)