import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import { useQuery } from '@apollo/client'

import FilterAltIcon from '@mui/icons-material/FilterAlt'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import PreviousMarkerList from '../components/list/PreviousMarkerList'
import PreviousMarkerView from '../components/marker/PreviousMarkerView'
import AutoHideAlert from '../components/AutoHideAlert'

import filters from '../scripts/filter'
import graphql from '../graphql'

function PreviousMarkerPage({ 
    eventtypes,
}) {
    const history = useHistory()

    // graphql request
    const { data: listData, loading: listLoading, error: listError } = useQuery(graphql.markers.previous, { fetchPolicy: 'no-cache' })

    const [ previousMarkers, setMarkers ] = useState([])

    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
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
        if (finalFilterValue === '' && customFilterValue === '') return previousMarkers
        const filteredByQuery = filters.map.filterByQuery(previousMarkers, customFilterValue)
        const list = filters.map.mapMarkerWithFilter(filteredByQuery, finalFilterValue, filterOption)
        return list
    }, [previousMarkers, finalFilterValue, customFilterValue, filterOption, selectedMarker])

    const [ showFilter, setShowFilter ] = useState(false)

    useEffect(() => {
        let options = []
        
        //options.push(filters.generate.rangeFilter())
        options.push(filters.generate.eventTypeFilter(eventtypes))
        options.push(filters.generate.attributeFilter())
        options.push(filters.generate.estimateTimeFilter())
        options.push(filters.generate.pricingFilter())
        options.push(filters.generate.labelFilter())

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

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/home')}
                label='Previous Marker'
            />
            <PreviousMarkerList
                markers={displayMarker}
                setSelected={setSelected}
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
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully revoke marker!'}
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