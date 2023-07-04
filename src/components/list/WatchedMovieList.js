import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    Button,
} from '@mui/material'
import dayjs from 'dayjs'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import RoundImage from '../wrapper/RoundImage'

import constant from '../../constant'

function MovieItem({
    item,
    movieTypeIcon,
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
                    {item?.movie?.image_path ? (
                        <RoundImage 
                            width={'80%'}
                            src={item.movie.image_path}
                        />
                    ) : (
                        <RoundImage 
                            width={'80%'}
                            src={movieTypeIcon}
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
                        {item?.movie?.label}
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: '#455295',
                    }}>
                        Watched at: {dayjs(item.selected_date).format('YYYY-MM-DD')}
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: '#455295',
                    }}>
                        in {item?.marker?.label}
                    </div>
                </Grid>
            </Grid>
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