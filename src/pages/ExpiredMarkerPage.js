import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import { useLazyQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import MarkerDisplayList from '../components/list/MarkerDisplayList'
import MarkerEditForm from '../components/form/MarkerEditForm'
import AutoHideAlert from '../components/AutoHideAlert'

import filters from '../scripts/filter'
import graphql from '../graphql'

function PreviousMarkerPage({ 
    eventtypes,
}) {
    const history = useHistory()

    // graphql request
    const [ listExpiredMarkerGQL, { data: listData, loading: listLoading, error: listError } ] = useLazyQuery(graphql.markers.expired, { fetchPolicy: 'no-cache' })

    const [ expiredMarkers, setMarkers ] = useState([])

    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
    const [ editAlert, confirmEdited ] = useBoop(3000)
   
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
        const filteredByQuery = filters.map.filterByQuery(expiredMarkers, customFilterValue, eventtypes)
        const list = filters.map.mapMarkerWithFilter(filteredByQuery, finalFilterValue, filterOption)
        return list
    }, [expiredMarkers, finalFilterValue, customFilterValue, filterOption, selectedMarker, eventtypes])

    const [ showFilter, setShowFilter ] = useState(false)

    useEffect(() => {
        listExpiredMarkerGQL()
    }, [])

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
            setMarkers(listData.expiredmarkers)
        }

        if (listError) {
            setFailMessage(listError.message)
            fail()
        }
    }, [listData, listError])

    const confirmFilterValue = (finalValue) => {
        setFinalFilterValue(finalValue)
        setExpandFilter(false)
    }

    const onMarkerUpdated = () => {
        setSelected(null)
        confirmEdited()
        listExpiredMarkerGQL()
    }

    const setSelectedById = (id) => {
        let selected = null
        expiredMarkers.forEach(m => {
            if (m.id === id) {
                selected = m
                return
            }
        })
        if (selected) {
            setSelected(selected)
        }
    } 

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/home')}
                label='Expired Marker'
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
            <MarkerEditForm
                open={selectedMarker}
                handleClose={() => setSelected(null)}
                onUpdated={onMarkerUpdated}
                marker={selectedMarker}
            />
            <AutoHideAlert 
                open={editAlert}
                type={'success'}
                message={'Successfully updated marker!'}
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
})) (PreviousMarkerPage)