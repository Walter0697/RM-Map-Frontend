import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Button,
} from '@mui/material'
import backend from '../../constant/backend'
import dayjs from 'dayjs'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'

import constant from '../../constant'

function MovieItem({
    item,
    movieTypeIcon,
}) {
    const posterPath = item?.movie?.image_path
    const posterSrc = posterPath
        ? (posterPath.startsWith('http') ? posterPath : `${backend.IMAGE_LINK}${posterPath}`)
        : `${backend.IMAGE_LINK}${movieTypeIcon}`

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
            }}
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
                    src={posterSrc}
                    alt={item?.movie?.label || 'Watched movie poster'}
                />
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
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
                        {item?.movie?.label}
                    </div>
                    <div style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#28356f',
                        fontWeight: '500',
                    }}>
                        Watched at: {dayjs(item.selected_date).format('YYYY-MM-DD')}
                    </div>
                    <div style={{
                        marginTop: '3px',
                        fontSize: '12px',
                        color: '#28356f',
                        fontWeight: '500',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        in {item?.marker?.label}
                    </div>
                </div>
            </div>
        </Button>
    )
}

function WathcedMovieList({
    list,
    eventtypes,
}) {
    const sortedList = useMemo(() => {
        return list.sort((a, b) => {
            return dayjs(b.selected_date).diff(dayjs(a.selected_date))
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
                    {sortedList.map((item, index) => (
                        <WrapperBox
                            key={index}
                            minHeight={'30px'}
                            height={'auto'}
                            marginBottom='10px'
                        >
                            <MovieItem
                                item={item}
                                movieTypeIcon={movieIconImage}
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
}))(WathcedMovieList)
