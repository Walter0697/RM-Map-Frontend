import React, { useState, useEffect } from 'react'

import tt from '@tomtom-international/web-sdk-maps'
import maphelper from '../scripts/map'

import useObject from '../hooks/useObject'
import constants from '../constant'

import apis from '../apis'

function useMap(
    mapRef,
    defaultLocation,
    defaultZoom,
    centerFailHandler,
    mappins,
) {
    // keep tracking on the location from the api
    const [ mapLocation, setMapLocation ] = useObject({
        lon: defaultLocation.longitude,
        lat: defaultLocation.latitude,
    })
    // location for searching api
    const [ searchingLocation, setSearchingLocation ] = useObject({
        lon: defaultLocation.longitude,
        lat: defaultLocation.latitude,
    })
    // location for updating map api
    const [ currentLocation, setCurrentLocation ] = useObject({
        lon: defaultLocation.longitude,
        lat: defaultLocation.latitude,
    })
    // possibly for animation
    const [ towardsLocation, setTowardsLocation ] = useObject(null)

    const [ zoom, setZoom ] = useState(defaultZoom)
    // current markers on the map
    const [ locationList, setLocation ] = useState([])
    const [ markerList, setMarkers ] = useState([])
    const [ clickedMarker, setClickedMarker ] = useState(-1) // for user to click on the marker and set message to the parent layout
    
    // for center marker
    const [ centerMarker, setCenterMarker ] = useState(null)
    const [ centerLocation, setCenterLocation ] = useObject(null)
    const [ centerStreetName, setCenterStreetName ] = useState(null)
    
    // for extra information (such as stations)
    const [ extraLocationList, setExtraLocationList ] = useState([])
    const [ extraMarkerList, setExtraMarkers ] = useState([])

    // the map object from the api
    const [ map, setMap ] = useState(null)

    // after clicking center, it will keep on center before changing position
    const [ keepCenter, setKeepCenter ] = useState(false)

    // initialize the map
    useEffect(() => {
        let map = tt.map({
            key: process.env.REACT_APP_MAP_APIKEY,
            container: mapRef.current,
            center: [mapLocation.lon, mapLocation.lat],
            zoom: zoom,
        })
        setMap(map)
        setLocationToMarker()

        return () => map.remove()
    }, [])

    // move current location to toward location
    // mainly used by setting center
    useEffect(() => {
        if (towardsLocation && towardsLocation.lat && towardsLocation.lon) {
            const lat = towardsLocation.lat
            const lon = towardsLocation.lon
            setTowardsLocation('lat', null)
            setTowardsLocation('lon', null)

            setCurrentLocation('lat', lat)
            setCurrentLocation('lon', lon)
        }
    }, [towardsLocation])

    // update current location will directly update the map
    useEffect(() => {
        updateMap()
    }, [currentLocation, map])

    // track the viewing location when user move
    useEffect(() => {
        let timer = null
        if (map) {
            map.on('move', getAPIMapLocation)
            map.on('touchstart', (e) => { setKeepCenter(false) })
            timer = window.setTimeout(() => {
                initMapToCenter()
            }, 1000)
        }
        return () => {
            if (map) {
                map.off('move')
                map.off('touchstart')
            }
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [map])
    
    useEffect(() => {
        if (keepCenter) {
            keepMapInCenter()
            const timer = window.setInterval(() => {
                keepMapInCenter()
            }, 1000)

            return () => {
                window.clearInterval(timer)
            }
        }
    }, [keepCenter])

    const getAPIMapLocation = () => {
        const center = map.getCenter()
        setMapLocation('lat', center.lat)
        setMapLocation('lon', center.lng)
    }

    // callback function for clicking marker
    const onMarkerClick = (index) => {
        if (index === -1) return
        let selectedLocation = null
        let list = []
        locationList.forEach(item => {
            if (item.id === index) {
                item.selected = true
                selectedLocation = item
            } else {
                item.selected = false
            }
            list.push(item)
        })

        setLocation(list)
        setClickedMarker({
            type: 'marker',
            item: selectedLocation,
        })
        updateMapLocation(selectedLocation.location)
    }

    // reset markers whenever location changes
    useEffect(() => {
        setLocationToMarker()
    }, [locationList])

    const setLocationToMarker = () => {
        markerList.forEach(marker => {
            marker.remove()
        })

        if (locationList.length === 0) {
            setMarkers(() => [])
            return
        }

        let markers = []
        locationList.forEach(item => {
            let marker = maphelper.markers.getMapPin(
                map,
                [
                    item.location.lon,
                    item.location.lat,
                ],
                onMarkerClick,
                item.selected,
                item.id,
                item.type,
                item.pin,
                mappins,
            )
            markers.push(marker)
        })
        setMarkers(() => markers)
    }

    // reset extra marker list whenever it got updated
    useEffect(() => {
        setExtraLocationToMarker()
    }, [extraLocationList])

    const onPinClick = (type, identifier) => {
        if (extraLocationList[type] && extraLocationList[type].length === 0) return
        let selectedLocation = null
        let list = []
        extraLocationList[type].forEach(item => {
            if (item.identifier === identifier) {
                item.selected = true
                selectedLocation = item
            } else {
                item.selected = false
            }
            list.push(item)
        })

        const before = extraLocationList
        let result = Object.assign({}, before)
        result[type] = list
        setExtraLocationList(result)
        setClickedMarker({
            type,
            item: selectedLocation,
        })
        
        // each API might have their own way to handle x y so this is how to parse it
        const selectedItemLocation = maphelper.converts.convertAPIValueToMapXY(type, selectedLocation)
        if (type === constants.overlay.station.HKMTR) {
            updateMapLocation(selectedItemLocation)
        }
    }

    const setExtraLocationToMarker = () => {
        extraMarkerList.forEach(marker => {
            marker.remove()
        })

        let extraMarkers = []
        extraLocationList[constants.overlay.station.HKMTR] && extraLocationList[constants.overlay.station.HKMTR].forEach(item => {
            let pin = maphelper.markers.getOverlayPin(
                map,
                [
                    item.map_y,
                    item.map_x,
                ],
                item.selected,
                constants.overlay.station.HKMTR,
                onPinClick,
                item.identifier,
            )

            extraMarkers.push(pin)
        })
        setExtraMarkers(() => extraMarkers)
    }

    // init map to center
    const initMapToCenter = () => {
        maphelper.generic.getCenter(initRecievedCenter, failedCenter)
    }

    const initRecievedCenter = (response) => {
        setZoom(constants.maps.defaultZoomSize)
        if (response.coords) {
            if (response.coords.latitude) {
                setTowardsLocation('lat', response.coords.latitude)
                setSearchingLocation('lat', response.coords.latitude)
            }
            if (response.coords.longitude) {
                setTowardsLocation('lon', response.coords.longitude)
                setSearchingLocation('lon', response.coords.longitude)
            }
        }
    }

    // get user location and set the map center
    const setMapToCenter = () => {
        initMapToCenter()
        // TODO: after implementing, set keep Center here
        //setKeepCenter(true)
    }

    const keepMapInCenter = () => {
        maphelper.generic.getCenter(recievedCenter, failedCenter)
    }

    const recievedCenter = (response) => {
        setZoom(constants.maps.defaultZoomSize)
        if (response.coords) {
            if (response.coords.latitude) {
                setTowardsLocation('lat', response.coords.latitude)
                setSearchingLocation('lat', response.coords.latitude)
            }
            if (response.coords.longitude) {
                setTowardsLocation('lon', response.coords.longitude)
                setSearchingLocation('lon', response.coords.longitude)
            }
        }
    }

    const failedCenter = () => {
        if (keepCenter) {
            setKeepCenter(false)
        }
        centerFailHandler && centerFailHandler()
    }

    // set searching location to viewing location
    const setSearchingToViewing = () => {
        const current = mapLocation
        setSearchingLocation('lat', current.lat)
        setSearchingLocation('lon', current.lon)
    }

    // function to create or reset the center marker
    const resetCenterMarker = async () => {
        centerMarker?.remove()
        setCenterMarker(null)
        setCenterStreetName(null)

        let marker = maphelper.markers.getMapPin(
            map,
            [
                mapLocation.lon,
                mapLocation.lat,
            ],
            onCenterMarkerClick,
            false,
            0,
            '',
            'favourite',
            mappins,
        )
        
        setCenterMarker(marker)

        setCenterLocation('lat', mapLocation.lat)
        setCenterLocation('lon', mapLocation.lon)

        let result = await apis.maps.streetname(mapLocation.lon, mapLocation.lat)
        if (result.status === 200) {
            if (result.data?.addresses.length !== 0) {
                const address = maphelper.generic.getAddress(result.data.addresses[0].address)
                setCenterStreetName(address)
            }
        }
    }

    const setCenterToLocation = (location, address) => {
        centerMarker?.remove()
        setCenterMarker(null)
        setCenterStreetName(null)

        let marker = maphelper.markers.getMapPin(
            map,
            [
                location.lon,
                location.lat,
            ],
            onCenterMarkerClick,
            false,
            0,
            '',
            'favourite',
            mappins,
        )

        setCenterMarker(marker)

        setCenterLocation('lat', location.lat)
        setCenterLocation('lon', location.lon)
        setCenterStreetName(address)

        setZoom(constants.maps.defaultZoomSize)
        setTowardsLocation('lat', location.lat)
        setSearchingLocation('lat', location.lat)
        setTowardsLocation('lon', location.lon)
        setSearchingLocation('lon', location.lon)
    }

    const onCenterMarkerClick = () => {

    }

    const updateMapLocation = (location) => {
        setCurrentLocation('lat', location.lat)
        setCurrentLocation('lon', location.lon)
        //updateMap()
        // setTowardsLocation('lat', location.lat)
        // setTowardsLocation('lon', location.lon)
    }

    // update the map according to the current location
    const updateMap = () => {
        if (map) {
            map.setCenter([parseFloat(currentLocation.lon), parseFloat(currentLocation.lat)])
            // TODO: try to get animation working
            //map.panTo([parseFloat(currentLocation.lon), parseFloat(currentLocation.lat)], { duration: 1 , animate: true, easing: (e) => { return e }, essential: true })
            //map.setZoom(zoom)
        }
    }

    const setExtraLocationInformation = (type, list) => {
        const before = extraLocationList
        const extra = Object.assign({}, before)
        extra[type] = list
        setExtraLocationList(() => extra)
    }

    return [ 
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
     ]
}

export default useMap