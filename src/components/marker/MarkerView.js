import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Slide,
} from '@mui/material'

import ExploreIcon from '@mui/icons-material/Explore'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

import CircleIconButton from '../field/CircleIconButton'
import FavouriteIcon from './FavouriteIcon'

import actions from '../../store/actions'
import graphql from '../../graphql'

const TransitionUp = (props) => {
    return <Slide {...props} direction="up" />
}

function MarkerView({
    open,
    handleClose,
    marker,
    dispatch,
}) {
    const [ updateMarkerFavouriteGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.markers.update_fav, { errorPolicy: 'all' }) 

    const [ isFav, setFav ] = useState(false)

    useEffect(() => {
        if (marker?.is_fav) {
            setFav(true)
        } else {
            setFav(false)
        }
    }, [marker])

    useEffect(() => {
        if (updateData) {
            dispatch(actions.updateMarkerFav(updateData.updateMarkerFav))
        }

        if (updateError) {
            console.log(updateError)
        }
    }, [updateData, updateError])

    const toggleMarkerFavourite = () => {
        if (!updateLoading) {
            const nextFav = !isFav
            updateMarkerFavouriteGQL({ variables: { id: marker.id, is_fav: nextFav }})
            setFav(nextFav)
        }
    }

    return (
        <Dialog
            fullWidth
            maxWidth={'lg'}
            open={open}
            onClose={handleClose}
            scroll={'paper'}
            TransitionComponent={TransitionUp}
        >
            { marker && (
                <>
                    <DialogTitle>
                        <Grid container space={1}>
                            <Grid item xs={2} md={2} lg={2}>
                                <CircleIconButton
                                    onClickHandler={() => {}}
                                >
                                    <CalendarTodayIcon />
                                </CircleIconButton>
                            </Grid>
                            <Grid item xs={8} md={8} lg={8}>
                                
                            </Grid>
                            <Grid item xs={2} md={2} lg={2}>
                                <FavouriteIcon 
                                    active={isFav}
                                    onClickHandler={toggleMarkerFavourite}
                                />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <ExploreIcon /> {marker.label}
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    <DialogContent dividers>
                        <DialogContentText>
                            <Grid container space={10}>
                                { marker.image_link && (
                                    <Grid item xs={12} md={12} lg={12}>
                                        <img
                                            width='100%'
                                            src={process.env.REACT_APP_IMAGE_LINK + marker.image_link}                                            
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12} md={12} lg={12}>
                                    Testing
                                </Grid>
                            </Grid>
                        </DialogContentText>
                    </DialogContent>
                </>
            )}
            
        </Dialog>
    )
}

export default connect(() => {})(MarkerView)