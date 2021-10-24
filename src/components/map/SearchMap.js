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

import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import RoomIcon from '@mui/icons-material/Room'
import AddLocationIcon from '@mui/icons-material/AddLocation'

import useMap from '../../hooks/useMap'
import useBoop from '../../hooks/useBoop'

import FadableComponent from '../wrapper/FadableComponent'
import SearchBox from './mappart/SearchBox'
import LocationContent from './mappart/LocationContent'
import AutoHideAlert from '../AutoHideAlert'

import maphelper from '../../scripts/map'
import apis from '../../apis'

// TODO : add question mark?

function SearchMap({
    openForm,
}) {
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
        pinButtonBottom,
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
            pinButtonBottom: '25%',
            centerButtonBottom: '15%',
            mapSearchButtonBottom: '20%',
        },
        to: {
            //mapContentHeight: ( viewSearchContent ) ? '50%' : (hasSearchContent ? '85%' : '90%'),
            mapContentTransform: ( viewSearchContent ) ? 'translate(0, -15%)' : 'translate(0, 0)',
            listContentHeight: ( viewSearchContent ) ? '40%' : (hasSearchContent ? '7%' : '0%'),
            listContentOpacity: ( viewSearchContent || hasSearchContent ) ? 1 : 0,
            pinButtonBottom: ( viewSearchContent ) ? '65%' : ( hasSearchContent ? '30%' : '25%'),
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
    const [ retrieveFail, setRetrieveFail ] = useBoop(3000)

    // if distance is long enough from the previous search location, then button will be shown
    const [ showMapSearchButton, setShowButton ] = useState(false)
    // if center marker is set, show the button
    const [ showCenterPinButton, setCenterPinButton ] = useState(false)

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

    // keep track on map location to see if button should show
    useEffect(() => {
        if (Math.abs(mapLocation.lon - searchingLocation.lon) > 0.01 ||
            Math.abs(mapLocation.lat - searchingLocation.lat) > 0.01) {
            setShowButton(true)
        } else {
            setShowButton(false)
        }
    }, [ mapLocation, searchingLocation ])

    // for handling user clicking map marker instead of bottom list
    useEffect(() => {
        if (!clickedMarker || clickedMarker === -1) return
        setSelectedSearch(clickedMarker.id)
        setViewContent(true)
    }, [clickedMarker])

    // for handling user set the center button and get the marker in the map
    useEffect(() => {
        if (centerLocation) {
            setCenterPinButton(true)
        } else {
            setCenterPinButton(false)
        }
    }, [centerLocation])

    // select the location and set center to that location
    const setSelectedSearchItem = (selectedIndex) => {
        setClickedMarker(null)
        setSelectedSearch(selectedIndex)

        let resultList = []
        if (selectedIndex === -1) {
            searchResults.forEach(item => {
                item.selected = false
                resultList.push(item)
            })
            setLocation(resultList)
            return
        }

        let selectedLocation = null
        
        searchResults.forEach(item => {
            if (item.id === selectedIndex) {
                item.selected = true
                selectedLocation = item.location
            } else {
                item.selected = false
            }
            resultList.push(item)
        })
        
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
                        details: {
                            poi: item.poi,
                            address: item.address,
                        }
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
                setRetrieveFail()
            }
        } else {
            setRetrieveFail()
        }
        setLoading(false)
    }

    // set center pin as create marker location
    const openFormByCenterMarker = () => {
        const markerReference = maphelper.converts.centerToMarkerForm(
            centerLocation,
            centerStreetName,
        )
        openForm(markerReference)

    }

    return (
        <>
            {/* main layout */}
            <animated.div 
                ref={mapElement} 
                className='mapDiv'
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
                    shouldShowList={viewSearchContent}
                    setShowList={() => setViewContent(true)}
                    setHideList={() => setViewContent(false)}
                    selectedIndex={selectedSearch}
                    setSelectedIndex={setSelectedSearchItem}
                    openForm={openForm}
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
                    isBottomOpen={viewSearchContent}
                />
            </div>
            
            <FadableComponent
                active={showCenterPinButton}
            >
                <animated.div
                    style={{
                        position: 'absolute',
                        bottom: pinButtonBottom,
                        left: '20px'
                    }}
                >
                    <IconButton
                        size='large'
                        style={{
                            backgroundColor: 'white',
                            boxShadow: '2px 2px 6px',
                        }}
                        onClick={openFormByCenterMarker}
                    >
                        <AddLocationIcon />
                    </IconButton>
                </animated.div>
            </FadableComponent>

            <animated.div
                style={{
                    position: 'absolute',
                    bottom: centerButtonBottom,
                    left: '20px',
                }}
            >
                <IconButton
                    size='large'
                    style={{
                        backgroundColor: 'white',
                        boxShadow: '2px 2px 6px',
                    }}
                    onClick={resetCenterMarker}
                >
                    <RoomIcon />
                </IconButton>
            </animated.div>

            <animated.div
                style={{
                    position: 'absolute',
                    bottom: centerButtonBottom,
                    right: '20px',
                }}
            >
                <IconButton
                    size='large'
                    style={{
                        backgroundColor: 'white',
                        boxShadow: '2px 2px 6px',
                    }}
                    onClick={setMapToCenter}
                >
                    <CenterFocusStrongIcon />
                </IconButton>
            </animated.div>

            <FadableComponent
                active={showMapSearchButton}
            >
                <animated.div
                    style={{
                        position: 'absolute',
                        left: '25%',
                        width: '50%',
                        bottom: mapSearchButtonBottom,
                    }}
                >
                    <Button
                        variant='contained'
                        size='middle'
                        style={{
                            backgroundColor: '#c1fdd1ee',
                            color: '#00297688',
                            width: '100%',
                            boxShadow: '2px 2px 6px',
                        }}
                        onClick={setSearchingToViewing}
                    >
                        Search This Area
                    </Button>
                </animated.div>
            </FadableComponent>
            
            {/* alert */}
            <AutoHideAlert
                open={gpsFail}
                type={'warning'}
                message={'Cannot retrieve GPS information'}
                timing={3000}
            />
            <AutoHideAlert
                open={retrieveFail}
                type={'warning'}
                message={'Cannot find any result'}
                timing={3000}
            />
        </>
    )
}

export default SearchMap