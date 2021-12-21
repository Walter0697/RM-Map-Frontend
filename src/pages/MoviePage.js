import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import MovieList from '../components/list/MovieList'
import MovieSearchForm from '../components/form/MovieSearchForm'
import MovieForm from '../components/form/MovieForm'
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

    const [ isCreateFormOpen, setCreateFormOpen ] = useState(false)
    const [ selectedMovie, setSelectedMovie ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)

    const openFormForMovie = (movie) => {
        setSelectedMovie(movie)
        setCreateFormOpen(true)
    }

    const onMovieCreated = () => {
        setSelectedMovie(null)
        setCreateFormOpen(false)
        confirmCreated()
    }

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
                openMovieForm={openFormForMovie}
            />
            <MovieSearchForm 
                currentValue={searchQuery}
                setValue={setSearchQuery}
                open={searchBoxOpen}
                handleClose={() => setSearchBoxOpen(false)}
            />
            <MovieForm 
                open={isCreateFormOpen}
                handleClose={() => setCreateFormOpen(false)}
                onCreated={onMovieCreated}
                movie={selectedMovie}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create movie schedule!'}
                timing={3000}
            />
        </Base>
    )
}

export default MoviePage