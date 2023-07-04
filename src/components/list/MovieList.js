import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    Grid,
    Button,
} from '@mui/material'

import { useLazyQuery } from '@apollo/client'

import StarIcon from '@mui/icons-material/Star'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import CircleIconButton from '../field/CircleIconButton'

import constants from '../../constant'
import graphql from '../../graphql'

function MovieItem({
    item,
    movieTypeIcon,
    movies,
    schedules,
    onClickHandler,
}) {

    const isFavourited = useMemo(() => {
        const dbmovie = movies.find(s => s.reference_id === item.ref_id)
        if (dbmovie) {
            return dbmovie.is_fav
        }
        return false
    }, [movies, item])

    const isScheduled = useMemo(() => {
        const movieSchedules = schedules.filter(s => s.movie)
        const dbschedule = movieSchedules.find(s => s.movie.reference_id === item.ref_id)
        if (dbschedule) {
            return true
        }
        return false
    }, [schedules, item])

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
                backgroundColor: '#48acdb',
                borderRadius: '5px',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0',
                border: isScheduled ? '3px solid green' : '',
            }}
            onClick={() => onClickHandler(item)}
        >
            {isFavourited && (
                <div style={{
                    position: 'absolute',
                    top: '5%',
                    right: '5%',
                }}>
                    <StarIcon sx={{ color: 'yellow' }} />
                </div>
            )}
            <Grid
                container
                fullWidth
                style={{
                    height: '100%',
                }}
            >
                <Grid 
                    item xs={5}
                    style={{ marginTop: '15px'}}
                >
                    {item.image_link ? (
                        <img
                            style={{
                                width: '80%',
                            }}
                            src={item.image_link}
                        />
                    ) : (
                        <img 
                            style={{
                                width: '80%',
                            }}
                            src={constants.BackendImageLink + movieTypeIcon}
                        />
                    )}
                    
                </Grid>
                <Grid 
                    item xs={7}
                    style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        marginTop: '40px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '18px',
                            color: 'black',
                        }}
                    >
                        {item.title}
                    </div>
                    <div style={{
                        fontSize: '10px',
                        color: '#455295',
                    }}>
                        {item.release_date}
                    </div>
                </Grid>
            </Grid>
        </Button>
    )
}

function MovieList({
    searchQuery,
    openSearchBox,
    list,
    setList,
    openMovieForm,
    eventtypes,
    movies,
    schedules,
}) {
    const history = useHistory()

    const [ moviefetchGQL, { data: movieData, loading: movieLoading, error: movieError } ] = useLazyQuery(graphql.movies.search, { fetchPolicy: 'no-cache' })

    const searchDescription = useMemo(() => {
        if (searchQuery.type === 'nowplaying') {
            if (searchQuery.location) {
                return `Now Playing at ${searchQuery.location}`
            }
            return 'Now Playing at theatre'
        } else if (searchQuery.type === 'upcoming') {
            if (searchQuery.location) {
                return `Upcoming at ${searchQuery.location}`
            }
            return 'Upcoming movies'
        } else {
            return `Searching By '${searchQuery.query}'`
        }
    }, [searchQuery])

    const movieIconImage = useMemo(() => {
        const movieType = eventtypes.find(s => s.value === constants.identifiers.movieTypeIdentifier)
        if (movieType) {
            return movieType.icon_path
        }
        return ''
    }, [eventtypes])

    useEffect(() => {
        let variables = {
            type: searchQuery.type,
        }
        if (searchQuery.type === 'search') {
            variables.query = searchQuery.query
        } else {
            variables.location = searchQuery.location
        }
           
        moviefetchGQL({ variables })
    }, [searchQuery])

    useEffect(() => {
        if (movieData) {
            setList(movieData.moviefetch)
        }

        if (movieError) {
            console.log(movieError)
        }
    }, [movieData, movieError])

    return (
        <>
            <div style={{
                position: 'absolute',
                height: '80%',
                width: '95%',
                paddingLeft: '5%',
                paddingTop: '20px',
                overflow: 'auto',
            }}>
                <WrapperBox
                    height={'50px'}
                    marginBottom='10px'
                >
                   <Button
                        variant='contained'
                        size='large'
                        style={{
                            position: 'relative',
                            backgroundColor: '#48acdb',
                            borderRadius: '5px',
                            height: '100%',
                            width: '100%',
                            boxShadow: '2px 2px 6px',
                            alignItems: 'center',
                            textTransform: 'none',
                            padding: '0',
                        }}
                            onClick={openSearchBox}
                        >
                        {searchDescription}
                    </Button>
                </WrapperBox>
                <BottomUpTrail>
                    {list.map((item, index) => (
                        <WrapperBox
                            key={index}
                            minHeight={'30px'}
                            height={'auto'}
                            marginBottom='10px'
                        >
                            <MovieItem
                                item={item}
                                movieTypeIcon={movieIconImage}
                                movies={movies}
                                schedules={schedules}
                                onClickHandler={openMovieForm}
                            />
                        </WrapperBox>
                    ))}
                </BottomUpTrail>
            </div>
            <div style={{
                position: 'absolute',
                bottom: '150px',
                right: '20px'
            }}>
                <CircleIconButton
                    onClickHandler={() => history.push('/favmovies')}
                >
                    <StarIcon />
                </CircleIconButton>
            </div>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
    movies: state.movie.movies,
    schedules: state.schedule.schedules,
}))(MovieList)