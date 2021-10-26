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

import AutoHideAlert from '../AutoHideAlert'

import maphelper from '../../scripts/map'

function MarkerMap({
    toListView,
}) {
    // reference of the div to render the map
    const mapElement = useRef(null)

    // for controlling the size of the map and search content
    const [ viewSearchContent, setViewContent ] = useState(false)

    const { 
        mapContentTransform, 
        backButtonBottom,
     } = useSpring({
        config: config.wobbly,
        from: { 
            mapContentTransform: 'translate(0, 0)',
            backButtonBottom: '5%',
        },
        to: {
            mapContentTransform: ( viewSearchContent ) ? 'translate(0, -15%)' : 'translate(0, 0)',
            backButtonBottom: ( viewSearchContent ) ? '45%' : '5%',
        },
    })

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

    return (
        <>
            {/* main layout */}
            <animated.div 
                ref={mapElement} 
                className='mapDiv'
                style={{ 
                    position: 'absolute',
                    height: '100%',
                    transform: mapContentTransform,
                    width: '100%', 
                }}
            />

            <animated.div
                style={{ 
                    position: 'absolute',
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