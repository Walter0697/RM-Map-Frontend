import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import { useQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import PreviousMarkerList from '../components/list/PreviousMarkerList'
import PreviousMarkerView from '../components/marker/PreviousMarkerView'
import AutoHideAlert from '../components/AutoHideAlert'

import graphql from '../graphql'

function PreviousMarkerPage({
    eventtypes,
}) {
    const history = useHistory()

    // graphql request
    const { data: listData, loading: listLoading, error: listError } = useQuery(graphql.markers.previous, { fetchPolicy: 'no-cache' })

    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
    const [ previousMarkers, setMarkers ] = useState([])
    
    const [ createAlert, confirmCreated ] = useBoop(3000)
   
    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    useEffect(() => {
        if (listData) {
            setMarkers(listData.previousmarkers)
        }

        if (listError) {
            setFailMessage(listError.message)
            fail()
        }
    }, [listData, listError])

    const onMarkerRevoked = () => {
        setSelected(null)
        confirmCreated()
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/home')}
                label='Previous Marker'
            />
            <PreviousMarkerList
                markers={previousMarkers}
                setSelected={setSelected}
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