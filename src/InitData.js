import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'

import dayjs from 'dayjs'

import actions from './store/actions'
import graphql from './graphql'

function InitData({ jwt, dispatch }) {
    const [ listMarkerGQL, { data: markerData } ] = useLazyQuery(graphql.markers.list, { fetchPolicy: 'no-cache' })
    const [ listEventTypeGQL, { data: eventTypeData } ] = useLazyQuery(graphql.markertypes.select, { fetchPolicy: 'no-cache' })
    const [ listMappinsGQL, { data: mappinsData } ] = useLazyQuery(graphql.pins.mappins, { fetchPolicy: 'no-cache' })
    const [ listScheduleGQL, { data: scheduleData } ] = useLazyQuery(graphql.schedules.list, { fetchPolicy: 'no-cache' })
    const [ listStationGQL, { data: stationData } ] = useLazyQuery(graphql.stations.list, { fetchPolicy: 'no-cache' })

    useEffect(() => {
        if (jwt) {
            listMarkerGQL()
            listEventTypeGQL()
            listMappinsGQL()
            listScheduleGQL({ variables: { time: dayjs().format('YYYY-MM-DD') } })
            listStationGQL()
        }
    }, [jwt])  
    // this only runs once on purpose, 
    // there the user already login, fetch all information
    // on app open

    useEffect(() => {
        if (markerData) {
            dispatch(actions.resetMarkers(markerData.markers))
        }
    }, [markerData]) // we dont care about the error, we just update if we got data

    useEffect(() => {
        if (eventTypeData) {
            const sortedList = eventTypeData.eventtypes
            sortedList.sort((a,b ) => a.priority - b.priority)

            dispatch(actions.resetEventTypes(sortedList))
        }
    }, [eventTypeData]) // we dont care about the error, we just update if we got data

    useEffect(() => {
        if (mappinsData) {
            dispatch(actions.resetMappins(mappinsData.mappins))
        }
    }, [mappinsData]) // we dont care about the error, we just update if we got data

    useEffect(() => {
        if (scheduleData) {
            dispatch(actions.resetSchedules(scheduleData.schedules))
        }
    }, [scheduleData]) // we dont care about the error, we just update if we got data

    useEffect(() => {
        if (stationData) {
            dispatch(actions.resetStations(stationData.stations))
        }
    }, [stationData]) // we dont care about the error, we just update if we got data

    return false    // do not return any view for this component
}

export default connect(state => ({
    jwt: state.auth.jwt
})) (InitData)