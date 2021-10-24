import React, { useState, useEffect } from 'react'
import Base from './Base'

import { useQuery } from '@apollo/client'

import TopBar from '../components/topbar/TopBar'

import graphql from '../graphql'

function HomePage() {
    // marker lists
    const [ list, setList ] = useState([])

    // graphql request
    const { data: markerData, loading: markerLoading, error: markerError } = useQuery(graphql.markers.listmap)

    useEffect(() => {
        if (markerData) {
            console.log(markerData)
        }

        if (markerError) {
            console.log(markerError)
        }
    }, [markerData, markerError])

    return (
        <Base>
            <TopBar
                label='Home'
            />
        </Base>
    )
}

export default HomePage