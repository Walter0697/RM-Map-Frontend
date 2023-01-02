import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import _ from 'lodash'

import ViewListIcon from '@mui/icons-material/ViewList'
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import TrainIcon from '@mui/icons-material/Train'
// import FilterAltIcon from '@mui/icons-material/FilterAlt'

import useMap from '../../hooks/useMap'
import useBoop from '../../hooks/useBoop'

import LocationPreview from './mappart/LocationPreview'
import AutoHideAlert from '../AutoHideAlert'
import CircleIconButton from '../field/CircleIconButton'
import FilterCircleButton from '../wrapper/FilterCircleButton'
// import FilterBox from '../filterbox/FilterBox'

import maphelper from '../../scripts/map'
import constants from '../../constant'

function MarkerMap({
    showingList,
    toListView,
    markers,
    filtercountry,
    setSelectedById,
    filterOption,   // below filter related
    filterValue,
    setFilterValue,
    isFilterExpanded,
    setExpandFilter,
    confirmFilterValue,
    finalFilterValue,
    customFilterValue,
    setCustomFilterValue,
    scheduleCreated, // for triggering the event that center marker can be erased
    mappins,    // for displaying pins,
    stations,   // for stations display in map
    showInMap,
}) {
    const history = useHistory()
    // reference of the div to render the map
    const mapElement = useRef(null)

    // for controlling the size of the map and search content
    const [ viewPreviewContent, setViewContent ] = useState(false)
    const [ hasPreviewContent, setPreviewContent ] = useState(false)

    const { 
        mapOpacity,
        mapContentTransform, 
        previewContentHeight,
        previewContentOpacity,
        backButtonBottom,
        utilityButtonBottom,
     } = useSpring({
        config: config.wobbly,
        from: { 
            mapOpacity: 1,
            mapContentTransform: 'translate(0, 0)',
            previewContentHeight: '0%',
            previewContentOpacity: 0,
            backButtonBottom: '5%',
            utilityButtonBottom: '15%',
        },
        to: {
            mapOpacity: (showingList) ? 0 : 1,
            mapContentTransform: ( viewPreviewContent ) ? 'translate(0, -5%)' : 'translate(0, 0)',
            previewContentHeight: ( viewPreviewContent ) ? '20%' : (hasPreviewContent ? '5%' : '0%'),
            previewContentOpacity: ( viewPreviewContent || hasPreviewContent ) ? 1 : 0,
            backButtonBottom: ( viewPreviewContent ) ? '25%' : (hasPreviewContent ? '10%' : '5%'),
            utilityButtonBottom: ( viewPreviewContent ) ? '35%' : (hasPreviewContent ? '20%' : '15%'),
        },
    })

    // selected item
    const [ currentViewMarker, setViewMarker ] = useState(null)

    // alert related
    const [ gpsFail, setGPSFail ] = useBoop(3000)

    const [ previousCountry, setPreviousCountry ] = useState(null)

    const [ 
        map, 
        mapLocation,
        updateMapLocation,
        searchingLocation,
        setMapToCenter,
        setSearchingToViewing,
        setLocation,
        clickedMarker,
        setClickedMarker,
        resetCenterMarker,
        centerLocation,
        centerStreetName,
        setCenterToLocation,
        setExtraLocationInformation,
        keepCenter,
        setKeepCenter,
        setLocationCenter,
     ] = useMap(
        mapElement,
        {       
            longitude: 114.1375695502623, 
            latitude: 22.33896093804016, 
        },
        15,
        setGPSFail,
        mappins,
    )

    useEffect(() => {
        if (previousCountry) {
            if (!_.isEqual(previousCountry, filtercountry)) {
                if (filtercountry?.countryCode) {
                    let output = markers.filter(s => s.country_code === filtercountry.countryCode)
                    if (filtercountry?.countryPart && filtercountry?.countryPart?.type === 'part') {
                        output = output.filter(s => s.country_part === filtercountry.countryPart.name)
                    }

                    const position = maphelper.generic.getCenterFromMarkerList(output)
                    setLocationCenter(position.latitude, position.longitude)
                
                }
                const selectedCountry = _.cloneDeep(filtercountry)
                setPreviousCountry(selectedCountry)
            }
        } else {
            const selectedCountry = _.cloneDeep(filtercountry)
            setPreviousCountry(selectedCountry)
        }
    }, [markers, filtercountry, previousCountry])

    useEffect(() => {
        let output = []
        markers.forEach(item => {
            const pinType = maphelper.pins.getPinType(item)
            output.push({
                id: item.id,
                type: item.type,
                pin: pinType,
                location: {
                    lon: item.longitude,
                    lat: item.latitude,
                }
            })
        })

        setLocation(output)
    }, [markers, showingList])

    useEffect(() => {
        if (!clickedMarker || clickedMarker === -1) return
        if (clickedMarker) {
            if (clickedMarker.type === 'marker') {
                const marker = markers.find(s => s.id === clickedMarker.item.id)
                if (marker) {
                    setViewMarker({
                        type: 'marker',
                        item: marker,
                    })
                    setViewContent(true)
                    setPreviewContent(true)
                }
            } else {
                setViewMarker(clickedMarker)
                setViewContent(true)
                setPreviewContent(true)
            }
        } 
    }, [clickedMarker])

    useEffect(() => {
        if (!scheduleCreated) return
        setClickedMarker(null)
        setViewMarker(null)
        setViewContent(false)
        setPreviewContent(false)
    }, [scheduleCreated])

    useEffect(() => {
        if (showInMap.markerMap) {
            setExtraLocationInformation(constants.overlay.station.HKMTR, stations)
        } else {
            setExtraLocationInformation(constants.overlay.station.HKMTR, [])
        }
    }, [stations, showInMap])

    const redirectToStationPage = () => {
        history.replace('/station')
    }

    return (
        <>
            {/* main layout */}
            <animated.div 
                ref={mapElement} 
                className='mapDiv'
                style={{ 
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    position: 'absolute',
                    height: '100%',
                    transform: mapContentTransform,
                    width: '100%', 
                }}
            />
            <animated.div
                style={{
                    position: 'absolute',
                    height: previewContentHeight,
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: previewContentOpacity,
                    width: '100%',
                    bottom: '0',
                }}
            >
                <LocationPreview
                    marker={currentViewMarker}
                    onOpen={() => setViewContent(true)}
                    onClose={() => setViewContent(false)}
                    shouldViewContent={viewPreviewContent}
                    setSelectedById={setSelectedById}
                />
            </animated.div>

            {/* component inside map */}
            <animated.div
                style={{ 
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    bottom: backButtonBottom,
                    left: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={toListView}
                >
                    <ViewListIcon />
                </CircleIconButton>
            </animated.div>

            <animated.div 
                style={{
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    top: '5%',
                    left: '20px',
                }}
            >
                <FilterCircleButton 
                    redirectPath={'/filter/map'}
                />
            </animated.div>

            <animated.div
                style={{
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    bottom: utilityButtonBottom,
                    right: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={redirectToStationPage}
                >
                    <TrainIcon />
                </CircleIconButton>
            </animated.div>

            <animated.div
                style={{ 
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    bottom: backButtonBottom,
                    right: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={() => setKeepCenter(true)}
                >
                    {keepCenter ? (
                        <CenterFocusStrongIcon />
                    ) : (
                        <CenterFocusWeakIcon />
                    )}
                </CircleIconButton>
            </animated.div>

            {/* <animated.div style={{
                visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                position: 'absolute',
                paddingTop: '20px',
                paddingLeft: '5%',
                width: '100%',
            }}>
                <FilterBox 
                    filterOption={filterOption}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                    isExpanded={isFilterExpanded}
                    setExpand={setExpandFilter}
                    confirmFilterValue={confirmFilterValue}
                    finalFilterValue={finalFilterValue}
                    customFilterValue={customFilterValue}
                    setCustomFilterValue={setCustomFilterValue}
                />
            </animated.div> */}

            {/* alert */}
            <AutoHideAlert
                open={gpsFail}
                type={'warning'}
                message={'Cannot retrieve GPS information'}
                timing={3000}
            />
        </>
    )
}

export default connect(state => ({
    mappins: state.marker.mappins,
    stations: state.station.stations,
    showInMap: state.station.showInMap,
    filtercountry: state.marker.filtercountry,
}))(MarkerMap)