import React, { useState, useMemo, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import Base from './Base'

import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import { nanoid } from 'nanoid'

import ExploreIcon from '@mui/icons-material/Explore'

import useBoop from '../hooks/useBoop'

import MarkerMap from '../components/map/MarkerMap'
import MarkerList from '../components/list/MarkerList'
import MarkerView from '../components/marker/MarkerView'
import CircleIconButton from '../components/field/CircleIconButton'
import FilterCirlceButton from '../components/wrapper/FilterCircleButton'
import ScheduleForm from '../components/form/ScheduleForm'
import MarkerEditForm from '../components/form/MarkerEditForm'
import AutoHideAlert from '../components/AutoHideAlert'
import CountrySelect from '../components/map/mappart/countryselect/CountrySelect'

import search from '../scripts/search'

import styles from '../styles/list.module.css'
import graphql from '../graphql'
import usePagedDataController from '../hooks/usePagedDataController'
import telemetry from '../scripts/telemetry'
import deepLinkScript from '../scripts/deepLink'
import actions from '../store/actions'

function MarkerPage({ 
    markers,
    eventtypes,
    filterlist,
    filtercountry,
    countryparts,
    pendingDeepLink,
    dispatch,
}) {
    const location = useLocation()
    const suffix = location.pathname.replace('/markers', '')

    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
    const [ selectedMarkerId, setSelectedMarkerId ] = useState(null)
    // if the selected marker is set to be schedule
    const [ scheduleFormOpen, setScheduleFormOpen ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    // if the selected marker is set to be editing
    const [ editingMarker, setEditing ] = useState(false)
    const [ editAlert, confirmEdited ] = useBoop(3000)

    const [ editedTrigger, setEditTrigger ] = useState(nanoid())
    const resolvingDeepLinkIdRef = useRef(null)
    const [ listPagedMarkerGQL ] = useLazyQuery(graphql.markers.viewport_page, { fetchPolicy: 'no-cache' })
    const [ listMarkerGQL ] = useLazyQuery(graphql.markers.list, { fetchPolicy: 'no-cache' })
    const [ deepLinkOpenFailed, setDeepLinkOpenFailed ] = useBoop(3000)

    // if it is showing list or map
    const [ showingList, setShowingList ] = useState((suffix && suffix === '/list') ? true : false)
    const { transform } = useSpring({
        config: config.gentle,
        from: { transform: (suffix && suffix === '/list') ? 'rotateY(180deg)' : 'rotateY(0deg)' },
        transform: showingList ? 'rotateY(180deg)' : 'rotateY(0deg)',
    })

    const { fakeTranform } = useSpring({
        config: config.gentle,
        from: { fakeTranform: (suffix && suffix === '/list') ? 1 : 0 },
        fakeTranform: showingList ? 1 : 0,
    })

    // filter option
    // const [ filterOption, setFilterOption ] = useState({})
    // const [ filterValue, setFilterValue ] = useState('')
    // const [ finalFilterValue, setFinalFilterValue ] = useState('')
    // const [ isFilterExpanded, setExpandFilter ] = useState(false)
    // const finalFilterDisplay = useMemo(() => {
    //     if (finalFilterValue === '') return null
    //     let list = filters.parser.parseStringToDisplayArr(filterOption, finalFilterValue)
    //     return list
    // }, [finalFilterValue])
    // const [ customFilterValue, setCustomFilterValue ] = useState('')

    // const displayMarker = useMemo(() => {
    //     //const filteredMarkers = markers.filter(s => s.status === '' || s.status === 'scheduled')
    //     const filteredMarkers = markerhelper.find.active(markers)

    //     //if (finalFilterValue === '' && customFilterValue === '') return filteredMarkers

    //     const filteredByQuery = filters.map.filterByQuery(filteredMarkers, customFilterValue, eventtypes)
    //     const list = filters.map.mapMarkerWithFilter(filteredByQuery, finalFilterValue, filterOption)

    //     return list
    // }, [markers, finalFilterValue, filterOption, customFilterValue, showingList, eventtypes, editAlert])

    const pagedMarkerController = usePagedDataController({
        resource: 'markers_list',
        queryIdentity: { scope: 'world' },
        fetchPage: async (cursor) => {
            const response = await listPagedMarkerGQL({
                variables: {
                    west: -180,
                    south: -90,
                    east: 180,
                    north: 90,
                    limit: 30,
                    cursor: cursor || null,
                }
            })
            const payload = response?.data?.viewportmarkers || {}
            return {
                items: payload.items || [],
                nextCursor: payload.next_cursor || null,
            }
        }
    })

    useEffect(() => {
        pagedMarkerController.refresh()
        telemetry.debugLog('markers_list', 'refresh:initial')
    }, [])

    const markerSource = useMemo(() => {
        return pagedMarkerController.items
    }, [pagedMarkerController.items])

    const filteredMarkers = useMemo(() => {
        return search.filter.parse(markerSource, filterlist, eventtypes, filtercountry)
    }, [markerSource, filterlist, eventtypes, filtercountry, editedTrigger])
    const fallbackFilteredMarkers = useMemo(() => {
        return search.filter.parse(markers || [], filterlist, eventtypes, filtercountry)
    }, [markers, filterlist, eventtypes, filtercountry, editedTrigger])
    const useFallbackList = filteredMarkers.length === 0 && fallbackFilteredMarkers.length > 0
    const displayMarkers = useMemo(() => {
        if (useFallbackList) return fallbackFilteredMarkers
        return filteredMarkers
    }, [filteredMarkers, fallbackFilteredMarkers, useFallbackList])

    useEffect(() => {
        if (editAlert) {
            setEditTrigger(nanoid())
        }
    }, [editAlert])

    useEffect(() => {
        telemetry.debugLog('markers_list', 'items:update', {
            count: filteredMarkers.length,
            nextCursor: pagedMarkerController.nextCursor,
            loading: pagedMarkerController.loading,
        })
    }, [filteredMarkers.length, pagedMarkerController.nextCursor, pagedMarkerController.loading])

    useEffect(() => {
        if (!useFallbackList) return
        telemetry.debugLog('markers_list', 'fallback:store-markers', {
            pagedCount: markerSource.length,
            fallbackCount: fallbackFilteredMarkers.length,
        })
    }, [useFallbackList, markerSource.length, fallbackFilteredMarkers.length])

    useEffect(() => {
        telemetry.debugLog('marker_page', 'view:switch', {
            view: showingList ? 'list' : 'map',
        })
    }, [showingList])

    useEffect(() => {
        if (!pendingDeepLink) return
        if (pendingDeepLink.resourceType !== deepLinkScript.resources.marker) return

        setShowingList(true)

        const markerId = deepLinkScript.parsePositiveIntId(pendingDeepLink.id)
        if (!markerId) {
            dispatch(actions.clearDeepLinkIntent())
            setDeepLinkOpenFailed()
            return
        }
        if (resolvingDeepLinkIdRef.current === markerId) return

        let cancelled = false
        resolvingDeepLinkIdRef.current = markerId

        const resolveDeepLinkMarker = async () => {
            try {
                const response = await listMarkerGQL()
                if (cancelled) return

                const backendMarkers = response?.data?.markers || []
                const selected = backendMarkers.find(s => s.id === markerId)

                if (!selected) {
                    dispatch(actions.clearDeepLinkIntent())
                    setDeepLinkOpenFailed()
                    return
                }

                const selectedCountryCode = selected.country_code || filtercountry?.countryCode || 'HK'
                const selectedParts = countryparts?.[selectedCountryCode] || []
                const selectedPart = selected.country_part
                const countryPart = (selectedPart && selectedParts.includes(selectedPart))
                    ? {
                        type: 'part',
                        name: selectedPart,
                    }
                    : {
                        type: 'all',
                    }

                dispatch(actions.resetFilterCountry({
                    countryCode: selectedCountryCode,
                    countryPart,
                }))
                setSelected(selected)
                dispatch(actions.clearDeepLinkIntent())
            } catch (error) {
                telemetry.debugLog('marker_page', 'deep-link:resolve-error', {
                    id: markerId,
                    message: error?.message || 'unknown error',
                })
                dispatch(actions.clearDeepLinkIntent())
                setDeepLinkOpenFailed()
            } finally {
                if (!cancelled) {
                    resolvingDeepLinkIdRef.current = null
                }
            }
        }

        resolveDeepLinkMarker()
        return () => {
            cancelled = true
            resolvingDeepLinkIdRef.current = null
        }
    }, [
        pendingDeepLink,
        listMarkerGQL,
        filtercountry,
        countryparts,
        dispatch,
    ])

    // const [ showFilterInListView, showFilter ] = useState(false)

    // useEffect(() => {
    //     let options = []
        
    //     //options.push(filters.generate.rangeFilter())
    //     options.push(filters.generate.eventTypeFilter(eventtypes))
    //     options.push(filters.generate.attributeFilter())
    //     options.push(filters.generate.estimateTimeFilter())
    //     options.push(filters.generate.pricingFilter())
    //     options.push(filters.generate.needBookingFilter())

    //     setFilterOption(options)
    // }, [eventtypes])

    const setSelectedById = (id) => {
        const selected = markerSource.find(s => s.id === id)
            || (markers || []).find(s => s.id === id)
        if (selected) {
            setSelected(selected)
            setSelectedMarkerId(selected.id)
        }
    } 

    // const confirmFilterValue = (finalValue) => {
    //     setFinalFilterValue(finalValue)
    //     setExpandFilter(false)
    // }

    const onMarkerUpdated = () => {
        setSelected(null)
        setSelectedMarkerId(null)
        setEditing(false)
        confirmEdited()
    }

    const onSelectMarker = (marker) => {
        if (!marker) return
        setSelected(marker)
        setSelectedMarkerId(marker.id)
    }

    const onViewportSelectionUpdate = (marker) => {
        if (marker) {
            if (selectedMarkerId && marker.id === selectedMarkerId) {
                setSelected(marker)
            }
        }
    }

    const onScheduleCreated = () => {
        setSelected(null)
        setSelectedMarkerId(null)
        setScheduleFormOpen(false)
        confirmCreated()
    }

    return (
        <Base>
            {/* flipping card logic */}
            
            <animated.div 
                style={{
                    width: '100%',
                    height: '90%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transform: transform,
                }}
            >
                <div
                    className={styles.flip}
                >
                    <MarkerMap 
                        showingList={showingList}
                        toListView={() => setShowingList(true)}
                        markers={markers || []}
                        setSelectedById={setSelectedById}
                        setSelectedMarker={onSelectMarker}
                        onViewportSelectionUpdate={onViewportSelectionUpdate}
                        // filterOption={filterOption} // for filter option
                        // filterValue={filterValue}   // for filter temporary value setter and getter
                        // setFilterValue={setFilterValue}  
                        // isFilterExpanded={isFilterExpanded} // for viewing filter
                        // setExpandFilter={setExpandFilter}
                        // confirmFilterValue={confirmFilterValue} // for confirming filter values
                        // customFilterValue={customFilterValue}
                        // setCustomFilterValue={setCustomFilterValue}
                        // finalFilterValue={finalFilterDisplay} // for filter options
                        scheduleCreated={confirmCreated}
                    />
                </div>
                <div
                    className={styles.flip}
                    style={{
                        transform: 'rotateY(180deg)',
                        background: '#b2d2a4',
                    }}
                >
                    <MarkerList
                        top={'15%'}
                        height={'85%'}
                        showingList={showingList}
                        markers={displayMarkers || []}
                        setSelectedById={setSelectedById}
                        onReachEnd={pagedMarkerController.loadMore}
                        onRefreshTop={pagedMarkerController.refresh}
                        hasMore={!!pagedMarkerController.nextCursor && !useFallbackList}
                        loadingMore={pagedMarkerController.loading}
                        refreshing={pagedMarkerController.refreshing}
                        onRetry={pagedMarkerController.retry}
                        loadingError={pagedMarkerController.error}
                        staleData={pagedMarkerController.stale}
                        offlineCached={pagedMarkerController.offlineCached}
                        // filterOption={filterOption} // for filter option
                        // filterValue={filterValue}   // for filter temporary value setter and getter
                        // setFilterValue={setFilterValue}  
                        // isFilterExpanded={isFilterExpanded} // for viewing filter
                        // setExpandFilter={setExpandFilter}
                        // confirmFilterValue={confirmFilterValue} // for confirming filter values
                        // customFilterValue={customFilterValue}
                        // setCustomFilterValue={setCustomFilterValue}
                        // finalFilterValue={finalFilterDisplay} // for filter options
                        // filterOpen={showFilterInListView}
                    />
                </div>

                {/* place button outside since button cannot be clicked with the rotate transform */}
                { showingList && (
                    <>
                        <div 
                            style={{
                                position: 'absolute',
                                transform: 'rotateY(180deg)',
                                bottom: '5%',
                                right: '20px',
                            }}
                        >
                            <CircleIconButton
                                onClickHandler={() => setShowingList(false)}
                            >
                                <ExploreIcon />
                            </CircleIconButton>
                        </div>
                        <div 
                            style={{
                                position: 'absolute',
                                transform: 'rotateY(180deg)',
                                top: '5%',
                                right: '20px',
                            }}
                        >
                            <FilterCirlceButton 
                                redirectPath={'/filter/list'}
                            />
                        </div>
                    </>
                )}
            </animated.div>
            
            <animated.div
                style={{
                    transformStyle: 'preserve-3d',
                    transform: fakeTranform.to({ range: [0.0, 0.5, 1.0], output: ['rotateY(0deg)', 'rotateY(180deg)', 'rotateY(0deg)']}),
                    position: 'absolute',
                    top: '5%',
                    left: '22%',
                    width: '68%',
                    maxWidth: '700px',
                }}
            >
                <CountrySelect />
            </animated.div>

            <MarkerView
                open={!!selectedMarker}
                handleClose={() => {
                    setSelected(null)
                    setSelectedMarkerId(null)
                }}
                openSchedule={() => setScheduleFormOpen(true)}
                editMarker={() => setEditing(true)}
                marker={selectedMarker}
            />
            <ScheduleForm
                open={scheduleFormOpen}
                handleClose={() => setScheduleFormOpen(false)}
                onCreated={onScheduleCreated}
                marker={selectedMarker}
            />
            <MarkerEditForm
                open={editingMarker}
                handleClose={() => setEditing(false)}
                onUpdated={onMarkerUpdated}
                marker={selectedMarker}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create schedule!'}
                timing={3000}
            />
            <AutoHideAlert 
                open={editAlert}
                type={'success'}
                message={'Successfully edit marker!'}
                timing={3000}
            />
            <AutoHideAlert
                open={deepLinkOpenFailed}
                type={'error'}
                message={'Requested marker cannot be opened. Showing marker list instead.'}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
    filterlist: state.filter.list,
    filtercountry: state.marker.filtercountry,
    countryparts: state.marker.countryparts,
    pendingDeepLink: state.deepLink.pending,
})) (MarkerPage)
