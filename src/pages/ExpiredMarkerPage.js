import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'
import Base from './Base'

import useBoop from '../hooks/useBoop'
import usePagedDataController from '../hooks/usePagedDataController'

import TopBar from '../components/topbar/TopBar'
import MarkerDisplayList from '../components/list/MarkerDisplayList'
import PreviousMarkerView from '../components/marker/PreviousMarkerView'
import AutoHideAlert from '../components/AutoHideAlert'
import ScheduleForm from '../components/form/ScheduleForm'

import filters from '../scripts/filter'
import historyMarkerPreview from '../scripts/historyMarkerPreview'
import graphql from '../graphql'

function ExpiredMarkerPage({
    eventtypes,
    jwt,
}) {
    const history = useHistory()
    const [ listPagedExpiredMarkersGQL ] = useLazyQuery(graphql.markers.pagedexpired, { fetchPolicy: 'no-cache' })
    const [ listExpiredMarkersGQL ] = useLazyQuery(graphql.markers.expired, { fetchPolicy: 'no-cache' })

    const isPagedExpiredMarkerUnsupported = (error) => {
        const message = `${error?.message || ''}`.toLowerCase()
        const graphQLErrors = error?.graphQLErrors || error?.networkError?.result?.errors || []
        const hasFieldError = graphQLErrors.some((item) => {
            const msg = `${item?.message || ''}`.toLowerCase()
            return msg.includes('cannot query field') && msg.includes('pagedexpiredmarkers')
        })
        const statusCode = Number(
            error?.networkError?.statusCode
            || error?.networkError?.status
            || error?.statusCode
            || 0
        )
        const has422 = statusCode === 422 || message.includes('status code 422')
        return hasFieldError || has422
    }

    const pagedExpiredMarkerController = usePagedDataController({
        resource: 'expired_markers_list',
        queryIdentity: { scope: 'expired' },
        fetchPage: async (cursor) => {
            try {
                const response = await listPagedExpiredMarkersGQL({
                    variables: {
                        cursor: cursor || null,
                        limit: 30,
                    }
                })
                const payload = response?.data?.pagedexpiredmarkers || {}
                return {
                    items: payload.items || [],
                    nextCursor: payload.next_cursor || null,
                }
            } catch (error) {
                if (!isPagedExpiredMarkerUnsupported(error)) {
                    throw error
                }
                if (cursor) {
                    return {
                        items: [],
                        nextCursor: null,
                    }
                }
                const legacy = await listExpiredMarkersGQL()
                return {
                    items: legacy?.data?.expiredmarkers || [],
                    nextCursor: null,
                }
            }
        }
    })

    const expiredMarkers = pagedExpiredMarkerController.items

    const [ selectedMarker, setSelected ] = useState(null)
    const [ scheduleMarker, setScheduleMarker ] = useState(null)
    const [ updateAlert, confirmUpdated ] = useBoop(3000)

    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    const [ filterOption, setFilterOption ] = useState({})
    const [ filterValue, setFilterValue ] = useState('')
    const [ finalFilterValue, setFinalFilterValue ] = useState('')
    const [ isFilterExpanded, setExpandFilter ] = useState(false)
    const [ previewByID, setPreviewByID ] = useState({})
    const [ previewRouteUnavailable, setPreviewRouteUnavailable ] = useState(false)
    const finalFilterDisplay = useMemo(() => {
        if (finalFilterValue === '') return null
        return filters.parser.parseStringToDisplayArr(filterOption, finalFilterValue)
    }, [finalFilterValue, filterOption])
    const [ customFilterValue, setCustomFilterValue ] = useState('')

    const displayMarker = useMemo(() => {
        const markersWithPreview = expiredMarkers.map((marker) => ({
            ...marker,
            history_preview: previewByID[marker.id] || historyMarkerPreview.buildIdlePreviewState(marker),
        }))
        const filteredByQuery = filters.map.filterByQuery(markersWithPreview, customFilterValue, eventtypes)
        return filters.map.mapMarkerWithFilter(filteredByQuery, finalFilterValue, filterOption)
    }, [expiredMarkers, previewByID, finalFilterValue, customFilterValue, filterOption, selectedMarker, eventtypes])

    const [ showFilter, setShowFilter ] = useState(false)

    useEffect(() => {
        const options = []
        options.push(filters.generate.eventTypeFilter(eventtypes))
        options.push(filters.generate.attributeFilter())
        options.push(filters.generate.estimateTimeFilter())
        options.push(filters.generate.pricingFilter())
        setFilterOption(options)
    }, [eventtypes])

    useEffect(() => {
        pagedExpiredMarkerController.refresh()
    }, [])

    useEffect(() => {
        if (!pagedExpiredMarkerController.error) return
        setFailMessage(pagedExpiredMarkerController.error.message)
        fail()
    }, [pagedExpiredMarkerController.error])

    useEffect(() => {
        if (!historyMarkerPreview.isEnabled() || !jwt || expiredMarkers.length === 0) return undefined
        if (previewRouteUnavailable) return undefined

        const targets = expiredMarkers.filter((marker) => {
            if (!historyMarkerPreview.hasValidCoordinates(marker)) return false
            return !previewByID[marker.id]
        })
        if (targets.length === 0) return undefined

        const abortController = new AbortController()

        Promise.all(targets.map(async (marker) => {
            try {
                const payload = await historyMarkerPreview.fetchPreview(marker.id, jwt, abortController.signal)
                return [ marker.id, {
                    ...payload,
                    image_src: historyMarkerPreview.toRenderableImageURL(payload),
                } ]
            } catch (error) {
                const statusCode = Number(error?.status || 0)
                if (statusCode === 404) {
                    setPreviewRouteUnavailable(true)
                    return [ marker.id, {
                        profile: historyMarkerPreview.PROFILE,
                        state: 'fallback',
                        fallback_reason: 'feature_unavailable',
                        cache_hit: false,
                    } ]
                }
                return [ marker.id, {
                    profile: historyMarkerPreview.PROFILE,
                    state: 'fallback',
                    fallback_reason: 'preview_request_failed',
                    cache_hit: false,
                } ]
            }
        })).then((results) => {
            if (abortController.signal.aborted) return
            setPreviewByID((current) => {
                const next = { ...current }
                results.forEach(([ id, payload ]) => {
                    next[id] = payload
                })
                return next
            })
        })

        return () => {
            abortController.abort()
        }
    }, [jwt, expiredMarkers, previewByID, previewRouteUnavailable])

    useEffect(() => {
        if (!selectedMarker) return
        const previewState = previewByID[selectedMarker.id]
        if (!previewState) return
        setSelected((current) => {
            if (!current || current.id !== selectedMarker.id) return current
            return {
                ...current,
                history_preview: previewState,
            }
        })
    }, [previewByID, selectedMarker])

    const onMarkerUpdated = (marker) => {
        if (marker) {
            setPreviewByID((current) => {
                const next = { ...current }
                delete next[marker.id]
                return next
            })
            pagedExpiredMarkerController.refresh()
        }
        setSelected(null)
        confirmUpdated()
    }

    const confirmFilterValue = (finalValue) => {
        setFinalFilterValue(finalValue)
        setExpandFilter(false)
    }

    const setSelectedById = (id) => {
        let selected = null
        expiredMarkers.forEach((m) => {
            if (m.id === id) {
                selected = {
                    ...m,
                    history_preview: previewByID[m.id] || historyMarkerPreview.buildIdlePreviewState(m),
                }
            }
        })
        if (selected) {
            setSelected(selected)
        }
    }

    return (
        <Base>
            <div
                style={{
                    width: '100%',
                    height: '90%',
                    position: 'relative',
                }}
            >
                <TopBar
                    onBackHandler={() => history.replace('/setting')}
                    label='Expired Marker'
                />
                <MarkerDisplayList
                    markers={displayMarker}
                    setSelectedById={setSelectedById}
                    filterOption={filterOption}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                    isFilterExpanded={isFilterExpanded}
                    setExpandFilter={setExpandFilter}
                    confirmFilterValue={confirmFilterValue}
                    customFilterValue={customFilterValue}
                    setCustomFilterValue={setCustomFilterValue}
                    finalFilterValue={finalFilterDisplay}
                    filterOpen={showFilter}
                    setShowFilter={setShowFilter}
                    onReachEnd={pagedExpiredMarkerController.loadMore}
                    hasMore={!!pagedExpiredMarkerController.nextCursor}
                    loadingMore={pagedExpiredMarkerController.loading}
                    loadingError={pagedExpiredMarkerController.error}
                    onRetry={pagedExpiredMarkerController.retry}
                    staleData={pagedExpiredMarkerController.stale}
                    offlineCached={pagedExpiredMarkerController.offlineCached}
                    onRefreshTop={pagedExpiredMarkerController.refresh}
                    refreshing={pagedExpiredMarkerController.refreshing}
                />
                <PreviousMarkerView
                    open={!!selectedMarker}
                    handleClose={() => setSelected(null)}
                    onUpdated={onMarkerUpdated}
                    marker={selectedMarker}
                    allowRevoke={false}
                    showHistory={false}
                    openSchedule={(markerFromDialog) => {
                        setScheduleMarker(markerFromDialog || selectedMarker)
                        setSelected(null)
                    }}
                />
            </div>
            <ScheduleForm
                open={!!scheduleMarker}
                handleClose={() => setScheduleMarker(null)}
                onCreated={() => {
                    setScheduleMarker(null)
                    confirmUpdated()
                }}
                marker={scheduleMarker}
            />
            <AutoHideAlert
                open={updateAlert}
                type={'success'}
                message={'Successfully completed expired marker action!'}
                timing={3000}
            />
            <AutoHideAlert
                open={failedAlert}
                type={'error'}
                message={failMessage}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
    jwt: state.auth.jwt,
}))(ExpiredMarkerPage)
