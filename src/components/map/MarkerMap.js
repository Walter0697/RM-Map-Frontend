import React, { useState, useEffect, useRef } from 'react'
import {
    IconButton,
    Button,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ViewListIcon from '@mui/icons-material/ViewList'

import useMap from '../../hooks/useMap'
import useBoop from '../../hooks/useBoop'

import LocationPreview from './mappart/LocationPreview'
import AutoHideAlert from '../AutoHideAlert'

import maphelper from '../../scripts/map'

function MarkerMap({
    showingList,
    toListView,
    markers,
    setSelectedById,
}) {
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
     } = useSpring({
        config: config.wobbly,
        from: { 
            mapOpacity: 1,
            mapContentTransform: 'translate(0, 0)',
            previewContentHeight: '0%',
            previewContentOpacity: 0,
            backButtonBottom: '5%',
        },
        to: {
            mapOpacity: (showingList) ? 0 : 1,
            mapContentTransform: ( viewPreviewContent ) ? 'translate(0, -5%)' : 'translate(0, 0)',
            previewContentHeight: ( viewPreviewContent ) ? '20%' : (hasPreviewContent ? '5%' : '0%'),
            previewContentOpacity: ( viewPreviewContent || hasPreviewContent ) ? 1 : 0,
            backButtonBottom: ( viewPreviewContent ) ? '25%' : (hasPreviewContent ? '10%' : '5%'),
        },
    })

    // selected item
    const [ currentViewMarker, setViewMarker ] = useState(null)

    // alert related
    const [ gpsFail, setGPSFail ] = useBoop(3000)

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
     ] = useMap(
        mapElement,
        {       
            longitude: 114.1375695502623, 
            latitude: 22.33896093804016, 
        },
        15,
        setGPSFail,
    )

    useEffect(() => {
        let output = []
        markers.forEach(item => {
            output.push({
                id: item.id,
                type: item.type,
                location: {
                    lon: item.longitude,
                    lat: item.latitude,
                }
            })
        })

        setLocation(output)
    }, [markers])

    useEffect(() => {
        if (clickedMarker) {
            const marker = markers.find(s => s.id === clickedMarker.id)
            if (marker) {
                setViewMarker(marker)
                setViewContent(true)
                setPreviewContent(true)
            }
        } 
    }, [clickedMarker])

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

            {/* buttons */}
            <animated.div
                style={{ 
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    bottom: backButtonBottom,
                    left: '20px',
                }}
            >
                <IconButton
                    size='large'
                    style={{
                        backgroundColor: 'white',
                        boxShadow: '2px 2px 6px',
                    }}
                    onClick={toListView}
                >
                    <ViewListIcon />
                </IconButton>
            </animated.div>

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

export default MarkerMap