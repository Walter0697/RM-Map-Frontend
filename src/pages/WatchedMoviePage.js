import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import { useQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import WathcedMovieList from '../components/list/WatchedMovieList'
import AutoHideAlert from '../components/AutoHideAlert'

import graphql from '../graphql'

function WatchedMoviePage() {
    const history = useHistory()

    // graphql request
    const { data: listData, loading: listLoading, error: listError } = useQuery(graphql.movies.watched, { fetchPolicy: 'no-cache' })

    const [ watchedMovies, setMovies ] = useState([])

    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    useEffect(() => {
        if (listData) {
            setMovies(listData.watchedmovies)
        }

        if (listError) {
            setFailMessage(listError.message)
            fail()
        }
    }, [listData, listError])

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/setting')}
                label='Watched Movie Page'
            />
            <WathcedMovieList 
                list={watchedMovies}
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

export default WatchedMoviePage