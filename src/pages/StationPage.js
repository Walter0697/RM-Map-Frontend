import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import SettingsIcon from '@mui/icons-material/Settings'

import useBoop from '../hooks/useBoop'

import Base from './Base'
import StationMap from '../components/station/StationMap'
import StationInfo from '../components/station/StationInfo'
import StationSettingForm from '../components/form/station/StationSettingForm'
import StationMapSelect from '../components/form/station/StationMapSelect'

import CircleIconButton from '../components/field/CircleIconButton'
import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'
import backend from '../constant/backend'

import constants from '../constant'
import storage from '../scripts/storage'
import actions from '../store/actions'
import graphql from '../graphql'

function StationPage({
    stations,
    dispatch,
    jwt,
}) {
    const history = useHistory()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const [ listStationGQL, { data: listData, error: listError } ] = useLazyQuery(graphql.stations.list, { fetchPolicy: 'no-cache' })
    const [ updateStationGQL ] = useMutation(graphql.stations.update_active, { errorPolicy: 'all' })

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

    const [ mapName, setMapName ] = useState('HK_MTR')
    useEffect(() => {
        const defaultMap = storage.getCurrentMap('station')
        if (defaultMap) {
            setMapName(defaultMap)
        }
    }, [])

    const stationMapInfo = useMemo(() => {
        return constants.country.stationList.find((item) => item.identifier === mapName)
    }, [mapName])

    const currentDimension = useMemo(() => {
        if (!stationMapInfo) {
            return { width: 2000, height: 1322 }
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

    const [ openMapChange, setOpenMapChange ] = useState(false)

    const [ messageDisplay, activateMessage ] = useBoop(3000)
    const [ currentMessage, setMessage ] = useState(null)

    const displayStations = useMemo(() => {
        return stations.filter((item) => item.map_name === mapName)
    }, [stations, mapName])

    const [ selectedStation, setSelected ] = useState(null)
    const selectedInfo = useMemo(() => {
        if (!selectedStation) return null
        const station = displayStations.find((item) => item.identifier === selectedStation)
        if (station) {
            const line = JSON.parse(station.line_info)
            return {
                name: station.local_name,
                label: station.label,
                line,
                active: station.active,
            }
        }
        return null
    }, [selectedStation, displayStations])

    const pinchZoomRef = useRef(null)
    const mapViewRef = useRef(null)
    const mapTitleRef = useRef(null)
    const lastAnimatedMapRef = useRef(null)
    const lastAnimatedTitleRef = useRef(null)

    const [ openSettingForm, setOpenSettingForm ] = useState(false)
    const [ mapImage, setMapImage ] = useState(stationImage)
    const [ mapIcon, setMapIcon ] = useState(null)
    const [ openLineStations, setOpenLineStations ] = useState(false)
    const [ selectedLine, setSelectedLine ] = useState(null)
    const [ lineScrollHint, setLineScrollHint ] = useState({ left: false, right: false })
    const lineScrollRef = useRef(null)

    useEffect(() => {
        if (pinchZoomRef && pinchZoomRef.current) {
            reset()
        }
    }, [pinchZoomRef])

    useEffect(() => {
        const currentMapAsset = mapImage || stationImage || ''
        if (!currentMapAsset) return
        if (lastAnimatedMapRef.current === null) {
            lastAnimatedMapRef.current = currentMapAsset
            return
        }
        if (lastAnimatedMapRef.current === currentMapAsset) return
        lastAnimatedMapRef.current = currentMapAsset

        const element = mapViewRef.current
        if (!element || !element.animate) return
        const animation = element.animate(
            [
                { opacity: 0.18, transform: 'scale(0.992)' },
                { opacity: 1, transform: 'scale(1)' },
            ],
            {
                duration: 780,
                easing: 'ease-out',
                fill: 'both',
            },
        )
        return () => {
            animation.cancel()
        }
    }, [mapImage, stationImage])

    useEffect(() => {
        const titleKey = mapName || ''
        if (!titleKey) return
        if (lastAnimatedTitleRef.current === null) {
            lastAnimatedTitleRef.current = titleKey
            return
        }
        if (lastAnimatedTitleRef.current === titleKey) return
        lastAnimatedTitleRef.current = titleKey

        const element = mapTitleRef.current
        if (!element || !element.animate) return
        const animation = element.animate(
            [
                { opacity: 0.2, transform: 'translateY(-2px) scale(0.985)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' },
            ],
            {
                duration: 700,
                easing: 'ease-out',
                fill: 'both',
            },
        )
        return () => {
            animation.cancel()
        }
    }, [mapName])

    useEffect(() => {
        const fetchMapAsset = async () => {
            if (!jwt || !mapName) {
                setMapImage(stationImage)
                setMapIcon(null)
                return
            }
            try {
                const resp = await fetch(backend.withBasePath(`station-maps/${mapName}`), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!resp.ok) {
                    setMapImage(stationImage)
                    setMapIcon(null)
                    return
                }
                const payload = await resp.json()
                if (payload?.image_path) {
                    setMapImage(`${backend.IMAGE_LINK}${payload.image_path}`)
                } else {
                    setMapImage(stationImage)
                }
                if (payload?.icon_path) {
                    setMapIcon(`${backend.IMAGE_LINK}${payload.icon_path}`)
                } else {
                    setMapIcon(null)
                }
            } catch (error) {
                console.warn('failed to load station map asset metadata', error)
                setMapIcon(null)
                setMapImage(stationImage)
            }
        }

        fetchMapAsset()
    }, [jwt, mapName, stationImage])

    const onLocationClick = (item) => {
        setSelected(item)
    }

    const onLocationStateChange = (active) => {
        if (active) {
            setMessage({ type: 'success', message: 'successfully add record' })
        } else {
            setMessage({ type: 'success', message: 'successfully remove record' })
        }
        activateMessage()
        setSelected(null)
    }

    const onLocationError = (message) => {
        setMessage({ type: 'error', message })
        activateMessage()
        setSelected(null)
    }

    const updateStationState = async (targetIdentifier, active) => {
        if (!targetIdentifier || !mapName) return
        if (!active && !confirm(`are you sure to remove ${targetIdentifier}'s record?`)) return
        try {
            const result = await updateStationGQL({
                variables: {
                    identifier: targetIdentifier,
                    map_name: mapName,
                    active,
                },
            })
            const updated = result?.data?.updateStation
            if (!updated) return
            dispatch(actions.updateStation(updated.identifier, updated.map_name, updated.active))
            setMessage({ type: 'success', message: updated.active ? 'successfully add record' : 'successfully remove record' })
            activateMessage()
        } catch (error) {
            setMessage({ type: 'error', message: error.message })
            activateMessage()
        }
    }

    const onLineClick = (line) => {
        setSelectedLine(line)
        setOpenLineStations(true)
    }

    const normalizeLine = (line) => ({
        id: line?.id || '',
        name: line?.name || '',
        localName: line?.localName || '',
        colour: line?.colour || '',
        position: Number(line?.position || 0),
    })

    const isSameLine = (a, b) => {
        if (!a || !b) return false
        const left = normalizeLine(a)
        const right = normalizeLine(b)
        if (left.id && right.id && String(left.id) === String(right.id)) return true
        if (left.name && right.name && left.name === right.name) return true
        if (left.localName && right.localName && left.localName === right.localName) return true
        return (
            left.name === right.name
            && left.localName === right.localName
            && left.colour === right.colour
        )
    }

    const lineStations = useMemo(() => {
        if (!selectedLine || !displayStations) return []
        const pick = []
        displayStations.forEach((station) => {
            let lines = []
            try {
                lines = JSON.parse(station.line_info || '[]')
            } catch {
                lines = []
            }
            const matched = lines.find((line) => isSameLine(line, selectedLine))
            if (matched) {
                const connectingLines = lines
                    .filter((line) => !isSameLine(line, selectedLine))
                    .map((line) => normalizeLine(line))
                    .filter((line, index, arr) => (
                        arr.findIndex((item) => (
                            item.name === line.name
                            && item.localName === line.localName
                            && item.colour === line.colour
                        )) === index
                    ))
                pick.push({
                    ...station,
                    linePosition: Number(matched.position || 0),
                    connectingLines,
                })
            }
        })
        return pick.sort((a, b) => a.linePosition - b.linePosition)
    }, [displayStations, selectedLine])

    const selectedLineColour = useMemo(() => {
        if (selectedLine?.colour) return selectedLine.colour
        const withColour = lineStations.find((item) => item.connectingLines?.length >= 0)
        return withColour?.colour || '#666'
    }, [selectedLine, lineStations])

    const updateLineScrollHint = () => {
        const el = lineScrollRef.current
        if (!el) {
            setLineScrollHint({ left: false, right: false })
            return
        }
        const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
        const left = el.scrollLeft > 1
        const right = el.scrollLeft < (maxScrollLeft - 1)
        setLineScrollHint({ left, right })
    }

    useEffect(() => {
        if (!openLineStations) return
        const id = window.requestAnimationFrame(() => {
            updateLineScrollHint()
        })
        const onResize = () => updateLineScrollHint()
        window.addEventListener('resize', onResize)
        return () => {
            window.cancelAnimationFrame(id)
            window.removeEventListener('resize', onResize)
        }
    }, [openLineStations, lineStations])

    const reset = () => {
        pinchZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1 })
    }

    const refresh = () => {
        listStationGQL()
    }

    return (
        <Base>
            <div style={{
                height: '95%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                boxSizing: 'border-box',
            }}>
                <div style={{ flex: '0 0 auto' }}>
                    <TopBar
                        onBackHandler={() => history.replace('/home')}
                        label='Station Page'
                    />
                </div>
                <div style={{
                    flex: 1,
                    width: '100%',
                    paddingTop: isMobile ? '14px' : '16px',
                    paddingBottom: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: isMobile ? '20px' : '24px',
                    boxSizing: 'border-box',
                    minHeight: 0,
                }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '16px' : '18px',
                    padding: isMobile ? '0 12px' : '0 22px',
                }}
                >
                    <CircleIconButton onClickHandler={refresh}>
                        <RotateLeftIcon />
                    </CircleIconButton>
                    <div style={{
                        height: '40px',
                        flex: 1,
                        backgroundColor: constants.colors.CardBackground,
                        color: 'white',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '2px 2px 6px',
                        gap: '8px',
                        cursor: 'pointer',
                        minWidth: 0,
                    }}
                    ref={mapTitleRef}
                    onClick={() => setOpenMapChange(true)}
                    >
                        {mapIcon ? (
                            <img
                                src={mapIcon}
                                alt='Map icon'
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    objectFit: 'contain',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '4px',
                                    padding: '2px',
                                }}
                            />
                        ) : null}
                        <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {stationLabel}
                        </span>
                    </div>
                    <CircleIconButton onClickHandler={() => setOpenSettingForm(true)}>
                        <SettingsIcon />
                    </CircleIconButton>
                </div>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: isMobile ? '0 12px' : '0 22px',
                    position: 'relative',
                }}>
                    <div ref={mapViewRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <StationMap
                            mapImage={mapImage || stationImage}
                            stations={displayStations}
                            dimension={currentDimension}
                            pinchZoomRef={pinchZoomRef}
                            onItemClickHandler={onLocationClick}
                            isMobile={isMobile}
                        />
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: isMobile ? '22px' : '30px',
                        }}
                    >
                        <CircleIconButton onClickHandler={reset}>
                            <CenterFocusStrongIcon />
                        </CircleIconButton>
                    </div>
                </div>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: isMobile ? '0 12px' : '0 22px',
                    flex: '0 0 auto',
                    height: isMobile ? '34dvh' : '30dvh',
                    minHeight: isMobile ? '220px' : '200px',
                    maxHeight: isMobile ? '320px' : '290px',
                }}>
                    <StationInfo
                        currentMap={mapName}
                        identifier={selectedStation}
                        station={selectedInfo}
                        onStationUpdate={onLocationStateChange}
                        onStationError={onLocationError}
                        onLineClick={onLineClick}
                        isMobile={isMobile}
                    />
                </div>
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
                message={currentMessage ? currentMessage.message : ''}
                timing={2000}
            />
            <Dialog
                open={openLineStations}
                onClose={() => setOpenLineStations(false)}
                fullWidth
                maxWidth='lg'
            >
                <DialogTitle>
                    {selectedLine ? `${selectedLine.localName || selectedLine.name}` : 'Line Stations'}
                </DialogTitle>
                <DialogContent>
                    <div style={{ padding: '2px 0' }}>
                        <div style={{ position: 'relative', marginTop: '20px' }}>
                            {lineScrollHint.left ? (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-16px',
                                        left: '0',
                                        fontSize: '11px',
                                        color: '#666',
                                        lineHeight: 1,
                                        pointerEvents: 'none',
                                        zIndex: 2,
                                    }}
                                >
                                    {'<'}
                                </div>
                            ) : null}
                            {lineScrollHint.right ? (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-16px',
                                        right: '0',
                                        fontSize: '11px',
                                        color: '#666',
                                        lineHeight: 1,
                                        pointerEvents: 'none',
                                        zIndex: 2,
                                    }}
                                >
                                    {'>'}
                                </div>
                            ) : null}
                            <div
                                ref={lineScrollRef}
                                onScroll={updateLineScrollHint}
                                style={{
                                    overflowX: 'auto',
                                    overflowY: 'hidden',
                                    paddingBottom: '2px',
                                }}
                            >
                            <div
                                style={{
                                    position: 'relative',
                                    minWidth: `${Math.max(lineStations.length * 78, isMobile ? 320 : 380)}px`,
                                    height: '132px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    gap: '0px',
                                }}
                            >
                                {lineStations.length > 1 ? (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '2px',
                                            right: '2px',
                                            top: '49px',
                                            height: '4px',
                                            borderRadius: '2px',
                                            backgroundColor: selectedLineColour,
                                            zIndex: 0,
                                        }}
                                    />
                                ) : null}
                                {lineStations.map((station) => (
                                    <div
                                        key={`${station.map_name}_${station.identifier}`}
                                        style={{
                                            width: '78px',
                                            minWidth: '78px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            height: '100%',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    >
                                        <div
                                            style={{
                                                marginTop: '0',
                                                width: '100%',
                                                minHeight: '38px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: '12px',
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    overflowWrap: 'anywhere',
                                                    lineHeight: 1.15,
                                                }}
                                            >
                                                {station.local_name}
                                            </div>
                                            <div
                                                onClick={() => updateStationState(station.identifier, !station.active)}
                                                style={{
                                                    marginTop: '2px',
                                                    lineHeight: 0,
                                                    cursor: 'pointer',
                                                }}
                                                title={station.active ? 'Cancel record' : 'Add record'}
                                            >
                                                {station.active ? (
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                                                ) : (
                                                    <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#b71c1c' }} />
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                border: '2px solid #fff',
                                                backgroundColor: selectedLineColour,
                                                boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
                                                position: 'absolute',
                                                top: '42px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                            }}
                                        />
                                        <div
                                            style={{
                                                marginTop: '58px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexWrap: 'wrap',
                                                gap: '4px',
                                                padding: '0 2px',
                                                minHeight: '26px',
                                            }}
                                        >
                                            {station.connectingLines?.map((line, index) => (
                                                <div
                                                    key={`${station.identifier}-line-${index}`}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '10px',
                                                        lineHeight: 1,
                                                        backgroundColor: '#f3f3f3',
                                                        borderRadius: '10px',
                                                        padding: '2px 6px',
                                                        maxWidth: '100%',
                                                    }}
                                                    title={line.name || line.localName}
                                                >
                                                    <span
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: line.colour || '#666',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <span style={{ overflowWrap: 'anywhere' }}>
                                                        {line.localName || line.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLineStations(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

export default connect(state => ({
    stations: state.station.stations,
    jwt: state.auth.jwt,
}))(StationPage)
