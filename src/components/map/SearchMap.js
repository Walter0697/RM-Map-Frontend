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

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

import useMap from '../../hooks/useMap'
import useDebounce from '../../hooks/useDebounce'

import maphelper from './maphelper'
import apis from '../../apis'

// TODO : add button to set center location as event location
// TODO : add question mark?
// TODO : when click on marker, set map to center

function SearchMap() {
    // reference of the div to render the map
    const mapElement = useRef(null) 

    // searching related
    const [ searchText, setSearch ] = useState('') 
    const [ viewSearchContent, setViewContent ] = useState(false)
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
            longitude: 0, 
            latitude: 0, 
        },
        13,
    )

    // function to run after initializing map
    useEffect(() => {
       if (map) {
           const marker = maphelper.markers.getMarker(map, [currentLocation.lon, currentLocation.lat])
       }
    }, [ map ])

    // keep track on map location to see if button should show
    useEffect(() => {
        if (Math.abs(mapLocation.lon - searchingLocation.lon) > 0.05 ||
            Math.abs(mapLocation.lat - searchingLocation.lat) > 0.05) {
            setShowButton(true)
        } else {
            setShowButton(true)
        }
    }, [ mapLocation, searchingLocation ])

    // text change handler
    const onSearchTextChange = (e) => {
        setSearch(e.target.value)
    }

    // debounce to fetch search result from place api
    const fetchSearchResult = async () => {
        if (searchText) {
            let result = await apis.maps.search(searchText, searchingLocation.lon, searchingLocation.lat)
            console.log(result)
            if (result.status === 200) {
                console.log(result.data.results)
                resetMarkers(result.data.results)
            }
        } else {
            console.log('search text is empty')
        }
    }
    useDebounce(fetchSearchResult, 1000, [searchText])

    // set if search list should be shown
    // TODO: when search click enter, then search -> right hand side from x to loading icon
    // after fetch, show bar
    // when user click map again, if click marker, show marker info
    // if click empty, hide bar
    // after first search, have a button to show list (some margin for that as well)
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
            <TextField
                variant="outlined"
                label="Search..."
                onFocus={showSearchList}
                onBlur={hideSearchList}
                style={{ 
                    position: 'absolute',
                    width: '90%',
                    background: 'white',
                    marginTop: '30px',
                    marginLeft: '5%',
                    boxShadow: '2px 2px 6px',
                }}
                value={searchText}
                onChange={onSearchTextChange}
            />

            <animated.div
                style={{
                    position: 'absolute',
                    bottom: centerButtonBottom,
                    right: '20px',
                }}
            >
                <IconButton
                    size="small"
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
                    size="large"
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
        </>
    )
}

export default SearchMap