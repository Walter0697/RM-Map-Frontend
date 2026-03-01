import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { Button } from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import backend from '../../constant/backend'
import dayjs from 'dayjs'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'

import constant from '../../constant'

function MovieItem({
    item,
    schedules,
    movieTypeIcon,
    onClickHandler,
}) {

    const isScheduled = useMemo(() => {
        const movieSchedules = schedules.filter(s => s.movie)
        const dbschedule = movieSchedules.find(s => s.movie.reference_id === item.reference_id)
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
                minHeight: '162px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0',
                border: isScheduled ? '3px solid green' : ''
            }}
            onClick={() => onClickHandler(item)}
        >
            <Grid
                container
                fullWidth
                style={{
                    height: '100%',
                    flexWrap: 'nowrap',
                }}
            >
                <Grid 
                    item xs={4}
                    style={{
                        padding: '12px 8px 12px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {item.image_path ? (
                        <img
                            style={{
                                width: '90px',
                                height: '136px',
                                objectFit: 'cover',
                                borderRadius: '5px',
                            }}
                            src={backend.IMAGE_LINK + item.image_path}
                        />
                    ) : (
                        <img 
                            style={{
                                width: '90px',
                                maxHeight: '136px',
                                objectFit: 'contain',
                            }}
                            src={backend.IMAGE_LINK + movieTypeIcon}
                        />
                    )}
                    
                </Grid>
                <Grid 
                    item xs={8}
                    style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        padding: '12px 12px 12px 8px',
                        minWidth: 0,
                    }}
                >
                    <div
                        style={{
                            fontSize: '18px',
                            color: 'black',
                            fontWeight: '600',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                        }}
                    >
                        {item.label}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#455295',
                        textAlign: 'left',
                    }}>
                        {item.release_date || 'No release date'}
                    </div>
                </Grid>
            </Grid>
        </Button>
    )
}

function FavMovieList({
    list,
    eventtypes,
    schedules,
    openMovieForm,
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
                                schedules={schedules}
                                movieTypeIcon={movieIconImage}
                                onClickHandler={openMovieForm}
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
    schedules: state.schedule.schedules,
}))(FavMovieList)
