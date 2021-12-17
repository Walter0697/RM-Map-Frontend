import React, { useState } from 'react'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import MovieList from '../components/list/MovieList'
import AutoHideAlert from '../components/AutoHideAlert'

function MoviePage() {
    const [ movies, setMovies ] = useState([])

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/search')}
                label='Movie Page'
            />
            <MovieList
                list={movies}
                setList={setMovies}
            />
        </Base>
    )
}

export default MoviePage