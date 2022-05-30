import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    Button,
} from '@mui/material'
import dayjs from 'dayjs'

import { useLazyQuery } from '@apollo/client'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'

import constant from '../../constant'

import actions from '../../store/actions'
import graphql from '../../graphql'

function MovieItem({
    item,
    movieTypeIcon,
    onClickHandler,
}) {
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
            }}
            onClick={() => onClickHandler(item)}
        >
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
                    {item.image_path ? (
                        <img
                            style={{
                                width: '80%',
                            }}
                            src={process.env.REACT_APP_IMAGE_LINK + item.image_path}
                        />
                    ) : (
                        <img 
                            style={{
                                width: '80%',
                            }}
                            src={process.env.REACT_APP_IMAGE_LINK + movieTypeIcon}
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
                        {item.label}
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

function FavMovieList({
    list,
    eventtypes,
}) {
    const filteredList = useMemo(() => {
        const unsorted = list.filter(s => s.is_fav)
        return unsorted.sort((a, b) => {
            return dayjs(b.release_date).diff(dayjs(a.release_date))
        })
    }, [list])

    const movieIconImage = useMemo(() => {
        const movieType = eventtypes.find(s => s.value === constant.identifiers.movieTypeIdentifier)
        if (movieType) {
            return movieType.icon_path
        }
        return ''
    }, [eventtypes])

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
                <BottomUpTrail>
                    {filteredList.map((item, index) => (
                        <WrapperBox
                            key={index}
                            minHeight={'30px'}
                            height={'auto'}
                            marginBottom='10px'
                        >
                            <MovieItem
                                item={item}
                                movieTypeIcon={movieIconImage}
                                onClickHandler={() => {}}
                            />
                        </WrapperBox>
                    ))}
                </BottomUpTrail>
            </div>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(FavMovieList)