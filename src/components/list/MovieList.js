import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button } from '@mui/material'
import backend from '../../constant/backend'

import { useLazyQuery } from '@apollo/client'

import StarIcon from '@mui/icons-material/Star'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import CircleIconButton from '../field/CircleIconButton'

import actions from '../../store/actions'
import graphql from '../../graphql'

function MovieItem({
    item,
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
                minHeight: '138px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textTransform: 'none',
                padding: '12px',
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
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minWidth: 0,
                }}
            >
                {item.image_link ? (
                    <img
                        style={{
                            width: '74px',
                            height: '108px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            marginRight: '12px',
                            boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
                            flexShrink: 0,
                        }}
                        src={item.image_link.startsWith('http') ? item.image_link : `${backend.IMAGE_LINK}${item.image_link}`}
                        alt={item.title || 'Movie poster'}
                    />
                ) : null}
                <div style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                }}>
                    <div
                        style={{
                            fontSize: '18px',
                            color: 'black',
                            fontWeight: '700',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.25,
                        }}
                    >
                        {item.title}
                    </div>
                    <div style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#28356f',
                        fontWeight: '500',
                    }}>
                        {item.release_date || 'No release date'}
                    </div>
                </div>
            </div>
        </Button>
    )
}

function MovieList({
    searchQuery,
    openSearchBox,
    list,
    setList,
    openMovieForm,
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
    movies: state.movie.movies,
    schedules: state.schedule.schedules,
}))(MovieList)
