import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'
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
import graphql from '../../graphql'
import viewportQuery from '../../scripts/viewportQuery'
import telemetry from '../../scripts/telemetry'
import { buildPagedCacheKey, readPagedCache, writePagedCache } from '../../scripts/pagedCache'

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
    setSelectedMarker,
}) {
    const history = useHistory()
    // reference of the div to render the map
    const mapElement = useRef(null)

    // for controlling the size of the map and search content
    const [ viewPreviewContent, setViewContent ] = useState(false)
    const [ hasPreviewContent, setPreviewContent ] = useState(false)
    const [ listViewportMarkerGQL ] = useLazyQuery(graphql.markers.viewport_page, { fetchPolicy: 'no-cache' })
    const [ viewportMarkers, setViewportMarkers ] = useState([])
    const [ viewportStale, setViewportStale ] = useState(false)
    const latestViewportRequestRef = useRef(0)

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
        const activeMarkers = viewportMarkers
        activeMarkers.forEach(item => {
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
    }, [markers, viewportMarkers, showingList])

    useEffect(() => {
        if (!clickedMarker || clickedMarker === -1) return
        if (clickedMarker) {
            if (clickedMarker.type === 'marker') {
                const activeMarkers = viewportMarkers
                const marker = activeMarkers.find(s => s.id === clickedMarker.item.id)
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
    }, [clickedMarker, markers, viewportMarkers])

    useEffect(() => {
        if (!map) return

        const fetchViewportMarkers = async () => {
            if (!map.getBounds) return
            const bounds = map.getBounds()
            const query = viewportQuery.buildViewportQuery(bounds, map.getZoom())
            if (!query) return

            const requestId = Date.now()
            latestViewportRequestRef.current = requestId
            telemetry.debugLog('viewport_markers', 'request:start', {
                requestId,
                ...query,
            })

            let cursor = null
            let merged = []
            let page = 0
            const queryIdentity = {
                west: query.west,
                south: query.south,
                east: query.east,
                north: query.north,
                zoom: query.zoom,
            }

            const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
            if (isOffline) {
                while (page < 5) {
                    const cacheKey = buildPagedCacheKey('viewport_markers', queryIdentity, cursor || '')
                    const cached = readPagedCache(cacheKey, 5 * 60 * 1000)
                    telemetry.trackCacheMetric('viewport_markers', !!cached)
                    telemetry.debugLog('viewport_markers', 'cache:page', {
                        requestId,
                        page: page + 1,
                        cursor: cursor || null,
                        hit: !!cached,
                    })
                    if (!cached || !cached.record) break
                    const dedupe = {}
                    merged.concat(cached.record.items || []).forEach((item) => {
                        if (!item || !item.id) return
                        dedupe[item.id] = item
                    })
                    merged = Object.values(dedupe).sort((a, b) => a.id - b.id)
                    cursor = cached.record.nextCursor || null
                    page += 1
                    if (!cursor) break
                }

                if (latestViewportRequestRef.current === requestId && merged.length > 0) {
                    setViewportMarkers(merged)
                    setViewportStale(true)
                    telemetry.debugLog('viewport_markers', 'cache:applied', {
                        requestId,
                        items: merged.length,
                        stale: true,
                    })
                }
                return
            }

            try {
                while (page < 5) {
                    const cacheKey = buildPagedCacheKey('viewport_markers', queryIdentity, cursor || '')
                    const response = await listViewportMarkerGQL({
                        variables: {
                            ...query,
                            cursor: cursor,
                            limit: 120,
                        }
                    })

                    if (latestViewportRequestRef.current !== requestId) {
                        return
                    }

                    const payload = response?.data?.viewportmarkers
                    const items = payload?.items || []
                    const dedupe = {}
                    merged.concat(items).forEach((item) => {
                        if (!item || !item.id) return
                        dedupe[item.id] = item
                    })
                    merged = Object.values(dedupe).sort((a, b) => a.id - b.id)
                    cursor = payload?.next_cursor || null
                    page += 1

                    telemetry.trackRequestMetric('viewport_markers', payload, false)
                    writePagedCache('viewport_markers', cacheKey, {
                        items,
                        nextCursor: cursor,
                    })
                    telemetry.debugLog('viewport_markers', 'request:page-success', {
                        requestId,
                        page,
                        pageItems: items.length,
                        mergedItems: merged.length,
                        nextCursor: cursor,
                    })

                    if (!cursor) break
                }
                if (latestViewportRequestRef.current === requestId) {
                    setViewportMarkers(merged)
                    setViewportStale(false)
                    telemetry.debugLog('viewport_markers', 'request:complete', {
                        requestId,
                        items: merged.length,
                        stale: false,
                    })
                }
            } catch (err) {
                telemetry.trackRequestMetric('viewport_markers', null, true)
                telemetry.debugLog('viewport_markers', 'request:error', {
                    requestId,
                    message: err?.message || 'unknown error',
                })
            }
        }

        const debouncedFetch = _.debounce(fetchViewportMarkers, 300)
        map.on('moveend', debouncedFetch)
        map.on('zoomend', debouncedFetch)
        debouncedFetch()

        return () => {
            if (map) {
                map.off('moveend', debouncedFetch)
                map.off('zoomend', debouncedFetch)
            }
            if (debouncedFetch.cancel) {
                debouncedFetch.cancel()
            }
        }
    }, [map, listViewportMarkerGQL])

    useEffect(() => {
        if (!scheduleCreated) return
        setClickedMarker(null)
        setViewMarker(null)
        setViewContent(false)
        setPreviewContent(false)
    }, [scheduleCreated])

    useEffect(() => {
        if (showInMap.markerMap) {
            setExtraLocationInformation(constants.overlay.typeStation, stations)
        } else {
            setExtraLocationInformation(constants.overlay.typeStation, [])
        }
    }, [stations, showInMap])

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
                    onSelectMarker={setSelectedMarker}
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
            <AutoHideAlert
                open={viewportStale}
                type={'warning'}
                message={'Showing cached map markers'}
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
