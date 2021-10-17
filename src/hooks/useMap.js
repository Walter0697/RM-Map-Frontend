import React, { useState, useEffect } from 'react'

import tt from '@tomtom-international/web-sdk-maps'
import maphelper from '../components/map/maphelper'

import useObject from '../hooks/useObject'
import constants from '../constant'

function useMap(
    mapRef,
    defaultLocation,
    defaultZoom,
    centerFailHandler,
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
    // the map object from the api
    const [ map, setMap ] = useState(null)

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
            timer = window.setTimeout(() => {
                setMapToCenter()
            }, 1000)
        }
        return () => {
            if (map) {
                map.off('move')
            }
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [map])

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
            let marker = null
            if (item.selected) {
                marker = maphelper.markers.getTesting(map, [
                    item.location.lon,
                    item.location.lat,
                ])
            } else {
                marker = maphelper.markers.getMarker(map, [
                    item.location.lon,
                    item.location.lat,
                ])
            }
            markers.push(marker)
        })
        setMarkers(() => markers)
    }

    const getAPIMapLocation = () => {
        const center = map.getCenter()
        setMapLocation('lat', center.lat)
        setMapLocation('lon', center.lng)
    }

    // get user location and set the map center
    const setMapToCenter = () => {
        maphelper.generic.getCenter(recievedCenter, failedCenter)
    }

    const recievedCenter = (response) => {
        setZoom(constants.maps.defaultZoomSize)
        if (response.coords) {
            if (response.coords.latitude) {
                setTowardsLocation('lat', response.coords.latitude)
            }
            if (response.coords.longitude) {
                setTowardsLocation('lon', response.coords.longitude)
            }
        }
    }

    const failedCenter = () => {
        centerFailHandler && centerFailHandler()
    }

    // set searching location to viewing location
    const setSearchingToViewing = () => {
        const current = mapLocation
        setSearchingLocation('lat', current.lat)
        setSearchingLocation('lon', current.lon)
    }

    const increaseZoom = () => {
        if ( zoom < 20 ) {
            setZoom(zoom + 1)
        }
    }

    const decreaseZoom = () => {
        if ( zoom > 1 ) {
            setZoom(zoom - 1)
        }
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
            map.setZoom(zoom)
        }
    }

    return [ 
        map, 
        mapLocation,
        updateMapLocation,
        searchingLocation,
        setMapToCenter,
        setSearchingToViewing,
        setLocation,
     ]
}

export default useMap