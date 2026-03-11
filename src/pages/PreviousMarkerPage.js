import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import { useQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import MarkerDisplayList from '../components/list/MarkerDisplayList'
import PreviousMarkerView from '../components/marker/PreviousMarkerView'
import AutoHideAlert from '../components/AutoHideAlert'
import ScheduleForm from '../components/form/ScheduleForm'

import filters from '../scripts/filter'
import historyMarkerPreview from '../scripts/historyMarkerPreview'
import graphql from '../graphql'

function PreviousMarkerPage({ 
    eventtypes,
    jwt,
}) {
    const history = useHistory()

    // graphql request
    const { data: listData, loading: listLoading, error: listError } = useQuery(graphql.markers.previous, { fetchPolicy: 'no-cache' })

    const [ previousMarkers, setMarkers ] = useState([])

    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
    const [ scheduleMarker, setScheduleMarker ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
   
    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    // filter option
    const [ filterOption, setFilterOption ] = useState({})
    const [ filterValue, setFilterValue ] = useState('')
    const [ finalFilterValue, setFinalFilterValue ] = useState('')
    const [ isFilterExpanded, setExpandFilter ] = useState(false)
    const finalFilterDisplay = useMemo(() => {
        if (finalFilterValue === '') return null
        let list = filters.parser.parseStringToDisplayArr(filterOption, finalFilterValue)
        return list
    }, [finalFilterValue])
    const [ customFilterValue, setCustomFilterValue ] = useState('')

    const displayMarker = useMemo(() => {
        const markersWithPreview = previousMarkers.map((marker) => ({
            ...marker,
            history_preview: previewByID[marker.id] || historyMarkerPreview.buildIdlePreviewState(marker),
        }))
        //if (finalFilterValue === '' && customFilterValue === '') return previousMarkers
        const filteredByQuery = filters.map.filterByQuery(markersWithPreview, customFilterValue, eventtypes)
        const list = filters.map.mapMarkerWithFilter(filteredByQuery, finalFilterValue, filterOption)
        return list
    }, [previousMarkers, previewByID, finalFilterValue, customFilterValue, filterOption, selectedMarker, eventtypes])

    const [ showFilter, setShowFilter ] = useState(false)
    const [ previewByID, setPreviewByID ] = useState({})

    useEffect(() => {
        let options = []
        
        //options.push(filters.generate.rangeFilter())
        options.push(filters.generate.eventTypeFilter(eventtypes))
        options.push(filters.generate.attributeFilter())
        options.push(filters.generate.estimateTimeFilter())
        options.push(filters.generate.pricingFilter())

        setFilterOption(options)
    }, [eventtypes])

    useEffect(() => {
        if (listData) {
            setMarkers(listData.previousmarkers)
        }

        if (listError) {
            setFailMessage(listError.message)
            fail()
        }
    }, [listData, listError])

    useEffect(() => {
        if (!historyMarkerPreview.isEnabled() || !jwt || previousMarkers.length === 0) return undefined

        const targets = previousMarkers.filter((marker) => historyMarkerPreview.hasValidCoordinates(marker))
        if (targets.length === 0) return undefined

        const abortController = new AbortController()

        setPreviewByID((current) => {
            const next = { ...current }
            targets.forEach((marker) => {
                if (!next[marker.id]) {
                    next[marker.id] = historyMarkerPreview.buildIdlePreviewState(marker)
                }
            })
            return next
        })

        Promise.all(targets.map(async (marker) => {
            try {
                const payload = await historyMarkerPreview.fetchPreview(marker.id, jwt, abortController.signal)
                return [ marker.id, {
                    ...payload,
                    image_src: historyMarkerPreview.toRenderableImageURL(payload),
                } ]
            } catch {
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
    }, [jwt, previousMarkers])

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

    const onMarkerRevoked = (marker) => {
        if (marker) {
            let list = previousMarkers
            list = list.filter(s => s.id !== marker.id)
            setMarkers(list)
        }
        setSelected(null)
        confirmCreated()
    }

    const confirmFilterValue = (finalValue) => {
        setFinalFilterValue(finalValue)
        setExpandFilter(false)
    }

    const setSelectedById = (id) => {
        let selected = null
        previousMarkers.forEach(m => {
            if (m.id === id) {
                selected = {
                    ...m,
                    history_preview: previewByID[m.id] || historyMarkerPreview.buildIdlePreviewState(m),
                }
                return
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
                    label='Previous Marker'
                />
                <MarkerDisplayList
                    markers={displayMarker}
                    setSelectedById={setSelectedById}
                    filterOption={filterOption} // for filter option
                    filterValue={filterValue}   // for filter temporary value setter and getter
                    setFilterValue={setFilterValue}  
                    isFilterExpanded={isFilterExpanded} // for viewing filter
                    setExpandFilter={setExpandFilter}
                    confirmFilterValue={confirmFilterValue} // for confirming filter values
                    customFilterValue={customFilterValue}
                    setCustomFilterValue={setCustomFilterValue}
                    finalFilterValue={finalFilterDisplay} // for filter options
                    filterOpen={showFilter}
                    setShowFilter={setShowFilter}
                />
                <PreviousMarkerView 
                    open={!!selectedMarker}
                    handleClose={() => setSelected(null)}
                    onUpdated={onMarkerRevoked}
                    marker={selectedMarker}
                    openSchedule={() => {
                        setScheduleMarker(selectedMarker)
                        setSelected(null)
                    }}
                />
            </div>
            <ScheduleForm
                open={!!scheduleMarker}
                handleClose={() => setScheduleMarker(null)}
                onCreated={() => {
                    setScheduleMarker(null)
                    confirmCreated()
                }}
                marker={scheduleMarker}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully completed previous marker action!'}
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
})) (PreviousMarkerPage)
