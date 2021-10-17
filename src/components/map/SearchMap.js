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
import SearchBox from './mappart/SearchBox'
import LocationContent from './mappart/LocationContent'
import AutoHideAlert from '../AutoHideAlert'

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

import useMap from '../../hooks/useMap'
import useBoop from '../../hooks/useBoop'

import maphelper from './maphelper'
import apis from '../../apis'

// TODO : add a fix center, maybe later
// TODO : add button to set center location as event location
// TODO : add question mark?

function SearchMap() {
    // reference of the div to render the map
    const mapElement = useRef(null) 

    // searching related
    const [ searchText, setSearch ] = useState('') 
    // for controlling the size of the map and search content
    const [ viewSearchContent, setViewContent ] = useState(false)
    const [ hasSearchContent, setHasContent ] = useState(false)    
    const { 
        //mapContentHeight, 
        mapContentTransform,
        listContentHeight,
        listContentOpacity,
        centerButtonBottom, 
        mapSearchButtonBottom,
     } = useSpring({
        //config: config.molasses,
        config: config.wobbly,
        from: { 
            //mapContentHeight: '90%',
            mapContentTransform: 'translate(0, 0)',
            listContentHeight: '0%',
            listContentOpacity: 0,
            centerButtonBottom: '15%',
            mapSearchButtonBottom: '20%',
        },
        to: {
            //mapContentHeight: ( viewSearchContent ) ? '50%' : (hasSearchContent ? '85%' : '90%'),
            mapContentTransform: ( viewSearchContent ) ? 'translate(0, -15%)' : 'translate(0, 0)',
            listContentHeight: ( viewSearchContent ) ? '40%' : (hasSearchContent ? '7%' : '0%'),
            listContentOpacity: ( viewSearchContent || hasSearchContent ) ? 1 : 0,
            centerButtonBottom: ( viewSearchContent ) ? '55%' : (hasSearchContent ? '20%' : '15%'),
            mapSearchButtonBottom: ( viewSearchContent ) ? '55%' : (hasSearchContent ? '25%' : '20%'),
        },
    })

    // search content
    const [ searchResults, setSearchResults ] = useState([])
    const [ selectedSearch, setSelectedSearch ] = useState(-1)

    // show loading icon for search box
    const [ loading, setLoading ] = useState(false)

    // alert related
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
        updateMapLocation,
        searchingLocation,
        setMapToCenter,
        setSearchingToViewing,
        setLocation,
     ] = useMap(
        mapElement,
        {       
            longitude: 114.1375695502623, 
            latitude: 22.33896093804016, 
        },
        13,
        setGPSFail,
    )

    // keep track on map location to see if button should show
    useEffect(() => {
        if (Math.abs(mapLocation.lon - searchingLocation.lon) > 0.01 ||
            Math.abs(mapLocation.lat - searchingLocation.lat) > 0.01) {
            setShowButton(true)
        } else {
            setShowButton(false)
        }
    }, [ mapLocation, searchingLocation ])

    // select the location and set center to that location
    const setSelectedSearchItem = (selectedIndex) => {
        setSelectedSearch(selectedIndex)
        if (selectedIndex === -1) return
        let selectedLocation = null
        let resultList = []
        searchResults.forEach(item => {
            if (item.id === selectedIndex) {
                item.selected = true
                selectedLocation = item.location
            } else {
                item.selected = false
            }
            resultList.push(item)
        });
        
        setLocation(resultList)
        updateMapLocation(selectedLocation)
    }

    // call api for requesting the nearby location
    const onSearchTextSubmitHandler = async (text) => {
        setLoading(true)
        let result = await apis.maps.search(text, searchingLocation.lon, searchingLocation.lat, 10)
        if (result.status === 200) {
            const list = result.data.results
            if (list.length !== 0) {
                let output = []
                let id = 0
                list.forEach(item => {
                    const address = (item.address.streetNumber) ? `${item.address.streetNumber} ${item.address.streetName}` : item.address.streetName
                    output.push({
                        id: id,
                        title: item.poi.name,
                        location: item.position,
                        address: address,
                        category: item.poi.categories[0],
                    })
                    id++
                })

                // resetMarkers(output)
                setLocation(output)
                // set for bottom result list
                setSearchResults(output)
                setSelectedSearch(-1)
                setViewContent(true)

                // change color whenever markers are active
        setHasContent(true)
            } else {
                // TODO: pop up an alert
            }
        } else {
            // TODO: pop up an alert
        }
        console.log(result)
        setLoading(false)
    }

    return (
        <>
            {/* main layout */}
            <animated.div 
                ref={mapElement} 
                className="mapDiv"
                style={{ 
                    position: 'absolute',
                    height: '90%',
                    transform: mapContentTransform,
                    //height: mapContentHeight,
                    width: '100%', 
                }}
            />
            <animated.div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    height: listContentHeight,
                    opacity: listContentOpacity,
                    width: '100%',
                }}
            >
                <LocationContent 
                    locationList={searchResults}
                    hasContent={hasSearchContent}
                    shouldShowList={viewSearchContent}
                    setShowList={() => setViewContent(true)}
                    selectedIndex={selectedSearch}
                    setSelectedIndex={setSelectedSearchItem}
                />
            </animated.div>


            {/* component inside map */}
            <div style={{
                position: 'absolute',
                paddingTop: '50px',
                paddingLeft: '5%',
                width: '100%',
                pointerEvents: 'none',
            }}>
                <SearchBox 
                    searchText={searchText}
                    setSearch={setSearch}
                    onFocusHandler={() => setViewContent(false)}
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
                        backgroundColor: '#c1fdd188',
                        color: '#00297688',
                        width: '100%',
                        boxShadow: '2px 2px 6px',
                    }}
                    onClick={setSearchingToViewing}
                >
                    Search This Area
                </Button>
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

export default SearchMap