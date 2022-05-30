import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import FavMovieList from '../components/list/FavMovieList'
import MovieForm from '../components/form/MovieForm'
import AutoHideAlert from '../components/AutoHideAlert'

function FavouriteMoviePage({
    movies,
}) {
    const history = useHistory()

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
                onBackHandler={() => history.replace('/movie')}
                label='Favourite Movie Page'
            />
            <FavMovieList
                list={movies}
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


export default connect(state => ({
    movies: state.movie.movies,
}))(FavouriteMoviePage)