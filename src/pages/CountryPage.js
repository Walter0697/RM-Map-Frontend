import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useQuery } from '@apollo/client'

import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import { Alert, Button } from '@mui/material'

import useBoop from '../hooks/useBoop'
import useCountryPoint from '../hooks/useCountryPoint'

import Base from './Base'
import CountryMap from '../components/country/CountryMap'
import LocationPreviewList from '../components/country/LocationPreviewList'

import CircleIconButton from '../components/field/CircleIconButton'
import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'

import CountryPointCreateForm from '../components/form/country/CountryPointCreateForm'
import CountryLocationList from '../components/form/country/CountryLocationList'

import constants from '../constant'
import actions from '../store/actions'
import graphql from '../graphql'

const headerHeight = 56
const pointerLineAndMapDistance = 30
const countryLocationBoxHeight = 100

function CountryPage({
    countryPoints,
    countryLocations,
    currentShowPoints,
    dispatch,
}) {
    const history = useHistory()

    // fetching previous markers first
    const { data: listData, loading: listLoading, error: listError } = useQuery(graphql.markers.previous, { fetchPolicy: 'no-cache' })
    const [ previousMarkers, setMarkers ] = useState([])
     // if request failed
     const [ failedAlert, fail ] = useBoop(3000)
     const [ failMessage, setFailMessage ] = useState('')

    useEffect(() => {
        if (listData) {
            setMarkers(listData.previousmarkers)
        }

        if (listError) {
            setFailMessage(listError.message)
            fail()
        }
    }, [listData, listError])

    const showPointSettingTop = useRef(true)   // will switch between top and bottom

    // map related
    const [ mapName, setMapName ] = useState('Japan')
    const countryMapInfo = useMemo(() => {
        const map = constants.country.countryList.find(item => item.label === mapName)
        return map
    }, [mapName])

    const currentDimension = useMemo(() => {
        if (!countryMapInfo) {
            return {
                width: 0,
                height: 0,
            }
        }
        return countryMapInfo.dimension
    }, [countryMapInfo])

    const countryImage = useMemo(() => {
        if (!countryMapInfo) return null
        return countryMapInfo.image
    }, [countryMapInfo])

    // adding related
    const [ isAdding, setIsAdding ] = useState(false)
    const [ addingPosition, setAddingPosition ] = useState(null)
    const [ addDialog, setAddDialog ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)

    // for display country location 
    const [ openLocationList, setOpenLocationList ] = useState(false)
    const [ countryPointId, setCountryPointId ] = useState(null)

    // getting the whole screen size to show the svg container
    const [ viewPort, setViewPort ] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)
    useEffect(() => {
        if (containerRef) {
            setViewPort({
                x: containerRef.current.clientWidth,
                y: containerRef.current.clientHeight,
            })
        }
    }, [containerRef])

    const viewBoxStr = useMemo(() => {
        return `0 0 ${viewPort.x} ${viewPort.y}`
    }, [viewPort])

    // for updating the pointer position even if the map moving
    const [ trigger, setTrigger ] = useState(0)

    const visibleBoundary = useMemo(() => {
        const expectedWidth = window.innerWidth * 0.9
        const expectedHeight =  expectedWidth * (currentDimension.height / currentDimension.width)
        const left = (window.innerWidth - expectedWidth) / 2
        const right = left + expectedWidth
        const top = (viewPort.y - expectedHeight) / 2
        const bottom = top + expectedHeight
        return {
            left,
            right,
            top,
            bottom,
        }
    }, [viewPort])

    const pointer1Head = useMemo(() => {
        return {
            x: visibleBoundary.left * 0.7 + visibleBoundary.right * 0.3,
            y: visibleBoundary.top - pointerLineAndMapDistance,
        }
    }, [visibleBoundary])

    const pointer2Head = useMemo(() => {
        return {
            x: visibleBoundary.left * 0.3 + visibleBoundary.right * 0.7,
            y: visibleBoundary.bottom + pointerLineAndMapDistance,
        }
    }, [visibleBoundary])

    // data related
    const countryPointList = useMemo(() => {
        if (!countryPoints) return []
        const list = countryPoints.filter(point => point.map_name === mapName)
        return list
    }, [countryPoints, mapName])

    const displayInfo1 = useMemo(() => {
        if (!countryPointList || countryPointList.length === 0) return null
        if (!currentShowPoints[mapName] || !currentShowPoints[mapName].top) return null
        const id = currentShowPoints[mapName].top
        const currentPoint = countryPointList.find(point => point.id === id)
        if (!currentPoint) return null

        return {
            x: currentPoint.photo_x,
            y: currentPoint.photo_y,
            label: currentPoint.label,
            info: currentPoint,
        }
    }, [countryPointList, currentShowPoints, countryLocations, mapName])

    const displayInfo2 = useMemo(() => {
        if (!countryPointList || countryPointList.length === 0) return null
        if (!currentShowPoints[mapName] || !currentShowPoints[mapName].bottom) return null
        const id = currentShowPoints[mapName].bottom
        const currentPoint = countryPointList.find(point => point.id === id)
        if (!currentPoint) return null
        
        return {
            x: currentPoint.photo_x,
            y: currentPoint.photo_y,
            label: currentPoint.label,
            info: currentPoint,
        }
    }, [countryPointList, currentShowPoints, countryLocations, mapName])

    const unfocusLocationList = useMemo(() => {
        if (!countryPointList || countryPointList.length === 0) return []
        if (!currentShowPoints[mapName] || !currentShowPoints[mapName].bottom) return countryPointList
        const list = countryPointList.filter(point => {
            if (point.id === currentShowPoints[mapName].top) return false
            if (point.id === currentShowPoints[mapName].bottom) return false
            return true
        })
        return list
    }, [countryPointList, currentShowPoints])

    const [ mapPointerRef, currentPointer1, shouldShowPointer1 ] = useCountryPoint({
        headerHeight,
        trigger,
        visibleBoundary,
        displayInfo: displayInfo1,
    })

    const [ mapPointerRef2, currentPointer2, shouldShowPointer2 ] = useCountryPoint({
        headerHeight,
        trigger,
        visibleBoundary,
        displayInfo: displayInfo2,
    })

    const onAddClickHandler = () => {
        setIsAdding(true)
        setAddingPosition(null)
    }

    const onAddCancelHandler = () => {
        setIsAdding(false)
        setAddingPosition(null)
    }

    const onAddButtonClickHandler = () => {
        if (isAdding) {
            onAddCancelHandler()
        } else {
            onAddClickHandler()
        }
    }

    const onAddPointerClick = () => {
        setAddDialog(true)
    }

    const onCountryPointCreated = () => {
        setAddDialog(false)
        onAddCancelHandler()
        confirmCreated()
    }

    const onMapClickHandler = (location) => {
        if (isAdding) {
            setAddingPosition(location)
        }
    }

    const onItemClickHandler = (item) => {
        if (!isAdding) {
            const showPoints = Object.assign({}, currentShowPoints)
            const currentShowList = showPoints[mapName] ?? {}
            let settingField = showPointSettingTop.current ? 'top' : 'bottom'
            currentShowList[settingField] = item.id
            showPoints[mapName] = currentShowList
            showPointSettingTop.current = !showPointSettingTop.current
            dispatch(actions.resetCurrentShow(showPoints))
        }
    }

    const onLocationListClick = (pointId) => {
        setCountryPointId(pointId)
        setOpenLocationList(true)
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers')}
                label='Country Page'
            />
            <div 
                ref={containerRef}
                style={{
                    height: '80%',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <CountryMap 
                    dimension={currentDimension}
                    countryImage={countryImage}
                    pointerRef={mapPointerRef}
                    pointerRef2={mapPointerRef2}
                    displayInfo1={displayInfo1}
                    displayInfo2={displayInfo2}
                    setTrigger={setTrigger}
                    itemList={unfocusLocationList}
                    onItemClickHandler={onItemClickHandler}
                    onMapClickHandler={onMapClickHandler}
                    addingPosition={addingPosition}
                />
                <svg 
                    viewBox={viewBoxStr}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                    }}
                >
                    {shouldShowPointer1 && !isAdding && (
                        <line x1={pointer1Head.x} y1={pointer1Head.y} x2={currentPointer1.x} y2={currentPointer1.y} stroke={constants.colors.CountryLocationBorder} strokeWidth={3} />
                    )}
                    {shouldShowPointer2 && !isAdding && (
                        <line x1={pointer2Head.x} y1={pointer2Head.y} x2={currentPointer2.x} y2={currentPointer2.y} stroke={constants.colors.CountryLocationBorder} strokeWidth={3} />
                    )}
                </svg>

                {/* country location info display */}
                {displayInfo1 && !isAdding && (
                    <LocationPreviewList 
                        top={pointer1Head.y - countryLocationBoxHeight}
                        height={countryLocationBoxHeight}
                        displayInfo={displayInfo1}
                        onClick={() => onLocationListClick(displayInfo1.info.id)}
                    />
                )}
                
                {displayInfo2 && !isAdding && (
                    <LocationPreviewList 
                        top={pointer2Head.y}
                        height={countryLocationBoxHeight}
                        displayInfo={displayInfo2}
                        onClick={() => onLocationListClick(displayInfo2.info.id)}
                    />
                )}
                

                {/* button list */}
                <div
                    style={{ 
                        position: 'absolute',
                        top: '5%',
                        right: '30px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={() => onAddButtonClickHandler()}
                    >
                        {isAdding ? <CancelIcon color={'error'} /> : <AddIcon />}
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
                        onClickHandler={null}
                    >
                        <PublicIcon />
                    </CircleIconButton>
                </div>
                

                {/* adding related */}
                {isAdding && (
                    <div style={{
                        position: 'absolute',
                        top: '5%',
                        left: '30px',
                    }}>
                        <Alert severity="info">Click on the map to add point!</Alert>
                    </div>
                )}
                
                {addingPosition && (
                    <div style={{
                            position: 'absolute',
                            top: '15%',
                            left: '5%',
                            width: '90%',
                        }}
                    >
                        <Button
                            style={{
                                width: '100%',
                            }}
                            variant="contained"
                            onClick={() => onAddPointerClick()}
                        >Add Pointer</Button>
                    </div>
                )}
            </div>
            <CountryPointCreateForm 
                open={addDialog}
                handleClose={() => setAddDialog(false)}
                position={addingPosition}
                mapName={mapName}
                onCreated={onCountryPointCreated}
            />
            <CountryLocationList
                open={openLocationList}
                handleClose={() => setOpenLocationList(false)}
                countryPointId={countryPointId}
                mapName={mapName}
                previousMarkers={previousMarkers}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create point!'}
                timing={3000}
            />
            <AutoHideAlert 
                open={failedAlert}
                type={'error'}
                message={failMessage}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    countryPoints: state.country.countryPoints,
    countryLocations: state.country.countryLocations,
    currentShowPoints: state.country.currentShowPoints,
})) (CountryPage)