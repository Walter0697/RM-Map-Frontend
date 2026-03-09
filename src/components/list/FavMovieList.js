import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { Button } from '@mui/material'
import dayjs from 'dayjs'
import backend from '../../constant/backend'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'

function MovieItem({
    item,
    schedules,
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
                minHeight: '138px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textTransform: 'none',
                padding: '12px',
                border: isScheduled ? '3px solid green' : ''
            }}
            onClick={() => onClickHandler(item)}
        >
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
                {item.image_path ? (
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
                        src={backend.IMAGE_LINK + item.image_path}
                        alt={item.label || 'Movie poster'}
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
                        {item.label}
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

function FavMovieList({
    list,
    schedules,
    openMovieForm,
}) {
    const filteredList = useMemo(() => {
        const unsorted = list.filter(s => s.is_fav)
        return unsorted.sort((a, b) => {
            return dayjs(b.release_date).diff(dayjs(a.release_date))
        })
    }, [list])

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
    schedules: state.schedule.schedules,
}))(FavMovieList)
