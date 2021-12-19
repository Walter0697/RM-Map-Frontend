import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import MovieList from '../components/list/MovieList'
import MovieSearchForm from '../components/form/MovieSearchForm'
import AutoHideAlert from '../components/AutoHideAlert'

function MoviePage() {
    const history = useHistory()
    
    const [ movies, setMovies ] = useState([])
    const [ searchQuery, setSearchQuery ] = useState({
        type: 'nowplaying',
        location: null,
        query: null,
    })
    const [ searchBoxOpen, setSearchBoxOpen ] = useState(false)

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/search')}
                label='Movie Page'
            />
            <MovieList
                searchQuery={searchQuery}
                list={movies}
                setList={setMovies}
                openSearchBox={() => setSearchBoxOpen(true)}
            />
            <MovieSearchForm 
                currentValue={searchQuery}
                setValue={setSearchQuery}
                open={searchBoxOpen}
                handleClose={() => setSearchBoxOpen(false)}
            />
        </Base>
    )
}

export default MoviePage