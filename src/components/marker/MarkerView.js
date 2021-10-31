import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Slide,
} from '@mui/material'

import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TimerIcon from '@mui/icons-material/Timer'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import useBoop from '../../hooks/useBoop'

import CircleIconButton from '../field/CircleIconButton'
import FavouriteIcon from './FavouriteIcon'
import ImageHeadText from '../wrapper/ImageHeadText'
import AutoHideAlert from '../AutoHideAlert'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function MarkerView({
    open,
    handleClose,
    marker,
    eventtypes,
    dispatch,
}) {
    const [ updateMarkerFavouriteGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.markers.update_fav, { errorPolicy: 'all' }) 

    const [ typeIcon, setIcon ] = useState(null)
    const [ isFav, setFav ] = useState(false)

    const [ copyMessage, triggerCopyMessage ] = useBoop(3000)

    useEffect(() => {
        if (!marker) return

        // find the type icon from the list to get the icon path
        const currentType = eventtypes.find(s => s.value === marker.type)
        setIcon(process.env.REACT_APP_IMAGE_LINK + currentType.icon_path)

        // see if it is a favourite marker
        if (marker?.is_fav) {
            setFav(true)
        } else {
            setFav(false)
        }
    }, [marker])

    useEffect(() => {
        if (updateData) {
            dispatch(actions.updateMarkerFav(updateData.updateMarkerFav.id, updateData.updateMarkerFav.is_fav))
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

    const redirectToSite = () => {
        let url = marker.link
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url
        }

        window.open(url, '_blank')
    }

    return (
        <>
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
                            <Grid container spacing={3}>
                                <Grid item xs={3} md={3} lg={3}>
                                    <CircleIconButton
                                        onClickHandler={() => {}}
                                    >
                                        <CalendarTodayIcon />
                                    </CircleIconButton>
                                </Grid>
                                <Grid item xs={6} md={6} lg={6}>
                                    
                                </Grid>
                                <Grid item xs={3} md={3} lg={3}>
                                    <FavouriteIcon 
                                        active={isFav}
                                        onClickHandler={toggleMarkerFavourite}
                                    />
                                </Grid>
                                <Grid item xs={12} md={12} lg={12}>
                                    <ImageHeadText
                                        iconPath={typeIcon}
                                        iconSize='35px'
                                        label={marker.label}
                                        labelSize='25px'
                                        labelColor='black'
                                    />
                                </Grid>
                            </Grid>
                        </DialogTitle>
                        <DialogContent dividers>
                            <DialogContentText>
                                <Grid container spacing={2}>
                                    { marker.image_link && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <img
                                                width='100%'
                                                src={process.env.REACT_APP_IMAGE_LINK + marker.image_link}                                            
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={12} lg={12}>
                                        { marker.address } 
                                        <IconButton
                                            onClick={() => { 
                                                navigator.clipboard.writeText(marker.address)
                                                triggerCopyMessage()
                                            }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Grid>
                                    {marker.link && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <a onClick={redirectToSite}>{marker.link}</a>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={12} lg={12}>
                                        { marker.description } 
                                    </Grid>
                                    {marker.price && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <AttachMoneyIcon sx={{
                                                verticalAlign: 'middle',
                                                display: 'inline-block',
                                            }} />
                                            <div
                                                style={{
                                                    verticalAlign: 'middle',
                                                    display: 'inline-block',
                                                    marginLeft: '10px',
                                                }}
                                            >
                                                Price:  { generic.text.price_display(marker.price) } 
                                            </div>
                                        </Grid>
                                    )}
                                    {marker.estimate_time && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <TimerIcon sx={{
                                                verticalAlign: 'middle',
                                                display: 'inline-block',
                                            }} />
                                            <div
                                                style={{
                                                    verticalAlign: 'middle',
                                                    display: 'inline-block',
                                                    marginLeft: '10px',
                                                }}
                                            >
                                                Time:  { marker.estimate_time } 
                                            </div>
                                        </Grid>
                                    )}
                                    {(marker.from_time || marker.to_time) && (
                                        <>
                                            <Grid item xs={12} md={12} lg={12}>
                                                <AccessTimeIcon sx={{
                                                    verticalAlign: 'middle',
                                                    display: 'inline-block',
                                                }} />
                                                <div
                                                    style={{
                                                        verticalAlign: 'middle',
                                                        display: 'inline-block',
                                                        marginLeft: '10px',
                                                    }}
                                                >
                                                    Date:  
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} md={12} lg={12}>
                                                { generic.time.displayDateRange(marker.from_time, marker.to_time) } 
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </DialogContentText>
                        </DialogContent>
                    </>
                )}
            </Dialog>
            <AutoHideAlert 
                open={copyMessage}
                type={'success'}
                message={'address copied!'}
                timing={2000}
            />
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MarkerView)