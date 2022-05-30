import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    FormLabel,
} from '@mui/material'

import StarIcon from '@mui/icons-material/Star'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

import BaseForm from './BaseForm'

import actions from '../../store/actions'
import graphql from '../../graphql'

function FavMovieSelectForm({
    open,
    handleClose,
    movie,
    openFormForMovie,
    onRemoved,
    dispatch,
}) {
    const [ removeFavMovieGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.movies.remove, { errorPolicy: 'all' })

    const [ submitting, setSubmitting ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (removeError) {
            setAlertMessage({
                type: 'error',
                message: removeError.message,
            })
            setSubmitting(false)
        }

        if (removeData) {
            //dispatch(actions.addMovie(removeData.removeFavouriteMovie))
            onRemoved && onRemoved()
        }
    }, [removeData, removeError])

    const removeMovieFavourite = () => {
        // removeFavMovieGQL({ variables: {
        //     id: movie.id,
        // }})
    }

    const setMovieSchedule = () => {
        openFormForMovie(movie)
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={movie?.label}
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
                                backgroundColor: 'red',
                                borderRadius: '5px',
                                height: '50px',
                                width: '100%',
                                boxShadow: '2px 2px 6px',
                                alignItems: 'center',
                                textTransform: 'none',
                                padding: '0',
                            }}
                            disblaed={submitting}
                            onClick={removeMovieFavourite}
                        >
                            <StarIcon sx={{ color: 'white', marginRight: '15px' }} /> Remove Favourite
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
}))(FavMovieSelectForm)