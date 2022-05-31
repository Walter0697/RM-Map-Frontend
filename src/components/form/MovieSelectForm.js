import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Grid,
    Button,
} from '@mui/material'

import StarIcon from '@mui/icons-material/Star'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

import BaseForm from './BaseForm'

import actions from '../../store/actions'
import graphql from '../../graphql'

function MovieSelectForm({
    open,
    handleClose,
    movie,
    openFormForMovie,
    isMovieFav,
    onCreated,
    dispatch,
}) {
    const [ createFavMovieGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.movies.create, { errorPolicy: 'all' })

    const [ submitting, setSubmitting ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            dispatch(actions.addMovie(createData.createFavouriteMovie))
            onCreated && onCreated()
        }
    }, [createData, createError])

    const setMovieFavourite = () => {
        createFavMovieGQL({ variables: {
            movie_rid: movie.ref_id,
        }})
    }

    const setMovieSchedule = () => {
        openFormForMovie(movie)
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={movie?.title}
                maxWidth={'lg'}
                cancelText={'Cancel'}
                loading={submitting}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <Button
                            variant='contained'
                            size='large'
                            style={{
                                backgroundColor: isMovieFav ? '#cece11' : '#48acdb',
                                borderRadius: '5px',
                                height: '50px',
                                width: '100%',
                                boxShadow: '2px 2px 6px',
                                alignItems: 'center',
                                textTransform: 'none',
                                padding: '0',
                            }}
                            disabled={submitting || isMovieFav}
                            onClick={setMovieFavourite}
                        >
                            <StarIcon sx={{ color: 'white', marginRight: '15px' }} />{isMovieFav ? 'Already Favourite' : 'Set To Favourite'}
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Button
                            variant='contained'
                            size='large'
                            style={{
                                backgroundColor: '#48acdb',
                                borderRadius: '5px',
                                height: '50px',
                                width: '100%',
                                boxShadow: '2px 2px 6px',
                                alignItems: 'center',
                                textTransform: 'none',
                                padding: '0',
                            }}
                            onClick={setMovieSchedule}
                        >
                           <CalendarTodayIcon sx={{ color: 'white', marginRight: '15px' }} /> Set To Schedule
                        </Button>
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}
export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MovieSelectForm)