import React, { useState, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import MovieList from '../components/list/MovieList'
import MovieSearchForm from '../components/form/MovieSearchForm'
import MovieSelectForm from '../components/form/MovieSelectForm'
import MovieForm from '../components/form/MovieForm'
import AutoHideAlert from '../components/AutoHideAlert'

function MoviePage({
    movies,
}) {
    const history = useHistory()
    
    const [ movieList, setMovies ] = useState([])
    const [ searchQuery, setSearchQuery ] = useState({
        type: 'nowplaying',
        location: null,
        query: null,
    })
    const [ searchBoxOpen, setSearchBoxOpen ] = useState(false)

    const [ isCreateFormOpen, setCreateFormOpen ] = useState(false)
    const [ isSelectFormOpen, setSelectFormOpen ] = useState(false)
    
    const [ selectedMovie, setSelectedMovie ] = useState(null)

    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createFavAlert, confirmFavCreated ] = useBoop(3000)

    const isMovieFav = useMemo(() => {
        if (selectedMovie) {
            const dbmovie = movies.find(s => s.reference_id === selectedMovie.ref_id)
            if (dbmovie) {
                return dbmovie.is_fav
            }
        }
       
        return false
    }, [selectedMovie, movies])

    const openSelectForm = (movie) => {
        setSelectedMovie(movie)
        setSelectFormOpen(true)
    }

    const openFormForMovie = (movie) => {
        setSelectedMovie(movie)
        setCreateFormOpen(true)
        setSelectFormOpen(false)
    }

    const onMovieCreated = () => {
        setSelectedMovie(null)
        setCreateFormOpen(false)
        confirmCreated()
    }

    const onFavCreated = () => {
        setSelectedMovie(null)
        setSelectFormOpen(false)
        confirmFavCreated()
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/search')}
                label='Movie Page'
            />
            <MovieList
                searchQuery={searchQuery}
                list={movieList}
                setList={setMovies}
                openSearchBox={() => setSearchBoxOpen(true)}
                openMovieForm={openSelectForm}
            />
            <MovieSearchForm 
                currentValue={searchQuery}
                setValue={setSearchQuery}
                open={searchBoxOpen}
                handleClose={() => setSearchBoxOpen(false)}
            />
            <MovieSelectForm
                open={isSelectFormOpen}
                handleClose={() => setSelectFormOpen(false)}
                openFormForMovie={openFormForMovie}
                isMovieFav={isMovieFav}
                onCreated={onFavCreated}
                movie={selectedMovie}
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
            <AutoHideAlert 
                open={createFavAlert}
                type={'success'}
                message={'Successfully create favourite movie!'}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    movies: state.movie.movies,
}))(MoviePage)