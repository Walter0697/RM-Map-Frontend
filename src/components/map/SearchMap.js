import React, { useState, useEffect, useRef } from 'react'
import {
    TextField,
    IconButton,
    Button,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import SearchBox from './searchbox/SearchBox'
import AutoHideAlert from '../AutoHideAlert'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

import useMap from '../../hooks/useMap'
import useBoop from '../../hooks/useBoop'

import maphelper from './maphelper'
import apis from '../../apis'

// TODO : add a fix center
// TODO : add button to set center location as event location
// TODO : add question mark?
// TODO : when click on marker, set map to center

function SearchMap() {
    // reference of the div to render the map
    const mapElement = useRef(null) 

    // searching related
    const [ searchText, setSearch ] = useState('') 
    const [ viewSearchContent, setViewContent ] = useState(false)
    const [ hasSearchContent, setHasContent ] = useState(false)
    const { searchContentHeight, centerButtonBottom, mapSearchButtonBottom } = useSpring({
        //config: config.molasses,
        config: config.wobbly,
        from: { 
            searchContentHeight: '90%',
            centerButtonBottom: '15%',
            mapSearchButtonBottom: '20%',
        },
        to: {
            searchContentHeight: ( viewSearchContent ) ? '50%' : '90%',
            centerButtonBottom: ( viewSearchContent ) ? '55%' : '15%',
            mapSearchButtonBottom: ( viewSearchContent ) ? '55%' : '20%',
        },
    })

    const [ loading, setLoading ] = useState(false)
    const [ gpsFail, setGPSFail ] = useBoop(3000)

    // if distance is long enough from the previous search location, then button will be shown
    const [ showMapSearchButton, setShowButton ] = useState(false)
    const { buttonOpacity } = useSpring({
        config: config.slow,
        from: { buttonOpacity: 0 },
        to: {
            buttonOpacity: ( showMapSearchButton ) ? 1 : 0
        },
    })

    const [ 
        map, 
        mapLocation,
        currentLocation,
        searchingLocation,
        setMapToCenter,
        setSearchingToViewing,
        resetMarkers,
     ] = useMap(
        mapElement,
        {       
            longitude: 114.1375695502623, 
            latitude: 22.33896093804016, 
        },
        13,
        setGPSFail,
    )

    // function to run after initializing map
    useEffect(() => {
       if (map) {
           const marker = maphelper.markers.getMarker(map, [currentLocation.lon, currentLocation.lat])
       }
    }, [ map ])

    // keep track on map location to see if button should show
    useEffect(() => {
        if (Math.abs(mapLocation.lon - searchingLocation.lon) > 0.01 ||
            Math.abs(mapLocation.lat - searchingLocation.lat) > 0.01) {
            setShowButton(true)
        } else {
            setShowButton(false)
        }
    }, [ mapLocation, searchingLocation ])

    const onSearchTextSubmitHandler = async (text) => {
        setLoading(true)
        let result = await apis.maps.search(text, searchingLocation.lon, searchingLocation.lat, 10)
        console.log(result)
        setLoading(false)
    }

    // set if search list should be shown
    const showSearchList = () => {
        setViewContent(true)
    }

    const hideSearchList = () => {
        setViewContent(false)
    }

    return (
        <>
            <animated.div 
                ref={mapElement} 
                className="mapDiv"
                style={{ 
                    height: searchContentHeight,
                    width: '100%', 
                    position: 'absolute',
                }}
            />
            <div style={{
                position: 'absolute',
                paddingTop: '30px',
                paddingLeft: '5%',
                width: '100%',
            }}>
                <SearchBox 
                    searchText={searchText}
                    setSearch={setSearch}
                    location={searchingLocation}
                    submitHandler={onSearchTextSubmitHandler}
                    isLoading={loading}
                />
            </div>

            <animated.div
                style={{
                    position: 'absolute',
                    bottom: centerButtonBottom,
                    right: '20px',
                }}
            >
                <IconButton
                    size="large"
                    style={{
                        backgroundColor: 'white',
                        boxShadow: '2px 2px 6px',
                    }}
                    onClick={setMapToCenter}
                >
                    <CenterFocusStrongIcon />
                </IconButton>
            </animated.div>
            
            <animated.div
                style={{
                    position: 'absolute',
                    left: '25%',
                    width: '50%',
                    opacity: buttonOpacity.to({ range: [0.0, 1.0], output: [0, 1]}),
                    bottom: mapSearchButtonBottom,
                }}
            >
                <Button
                    variant="contained"
                    size="middle"
                    style={{
                        backgroundColor: '#c1fdd1',
                        color: '#002976',
                        width: '100%',
                        boxShadow: '2px 2px 6px',
                    }}
                    onClick={setSearchingToViewing}
                >
                    Search This Area
                </Button>
            </animated.div>

            <AutoHideAlert
                open={gpsFail}
                type={'warning'}
                message={'Cannot retrieve GPS information'}
                timing={3000}
            />
        </>
    )
}

export default SearchMap