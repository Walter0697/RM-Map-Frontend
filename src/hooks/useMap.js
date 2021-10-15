import React, { useState, useEffect } from 'react'
import tt from '@tomtom-international/web-sdk-maps'
import maphelper from '../components/map/maphelper'

import useObject from '../hooks/useObject'
import constants from '../constant'

function useMap(
    mapRef,
    defaultLocation,
    defaultZoom,
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
    const [ markerList, setMarkers ] = useState([])
    // the map object from the api
    const [ map, setMap ] = useState(null)

    // initialize the map
    useEffect(() => {
        let map = tt.map({
            key: process.env.REACT_APP_MAP_APIKEY,
            container: mapRef.current,
            center: [defaultLocation.longitude, defaultLocation.latitude],
            zoom: zoom,
        })
        setMap(map)

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
            updateMap()
        }
    }, [towardsLocation])

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
        console.log('failed to get center')
    }

    // reset the markers from a list of location
    // TODO: change it to be more generic
    const resetMarkers = (list) => {
        markerList.forEach(marker => {
            marker.remove()
        })

        //TODO: check map is initialize or not
        //if so, do this
        //if not so, then put it in temp
        let markers = []
        list.forEach(location => {
            const marker = maphelper.markers.getMarker(map, [
                location.position.lon,
                location.position.lat,
            ])
            markers.push(marker)
        })
        setMarkers(() => markers)
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

    // update the map according to the current location
    const updateMap = () => {
        if (map) {
            map.setCenter([parseFloat(currentLocation.lon), parseFloat(currentLocation.lat)])
            map.setZoom(zoom)
        }
    }

    return [ 
        map, 
        mapLocation,
        currentLocation,
        searchingLocation,
        setMapToCenter,
        setSearchingToViewing,
        resetMarkers,
     ]
}

export default useMap