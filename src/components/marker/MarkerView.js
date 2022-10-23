import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
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
import PinDropIcon from '@mui/icons-material/PinDrop'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'

import useBoop from '../../hooks/useBoop'

import CircleIconButton from '../field/CircleIconButton'
import FavouriteIcon from './FavouriteIcon'
import ImageHeadText from '../wrapper/ImageHeadText'
import AutoHideAlert from '../AutoHideAlert'
import RestaurantCard from '../card/RestaurantCard'
import MarkerDescription from './MarkerDescription'
import MarkerShareView from './MarkerShareView'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function MarkerView({
    open,
    handleClose,
    openSchedule,
    marker,
    editMarker,
    eventtypes,
    dispatch,
}) {
    const history = useHistory()

    const [ updateMarkerFavouriteGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.markers.update_fav, { errorPolicy: 'all' }) 
    const [ removeMarkerGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.markers.remove, { errorPolicy: 'all' })

    const [ typeIcon, setIcon ] = useState(null)
    const [ isFav, setFav ] = useState(false)
    const [ deletingId, setDeleting ] = useState(-1)

    const [ previewOpen, setPreviewOpen ] = useState(false)

    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    const [ copyMessage, triggerCopyMessage ] = useBoop(3000)

    useEffect(() => {
        if (!marker) return

        // find the type icon from the list to get the icon path
        const currentType = eventtypes.find(s => s.value === marker.type)
        setIcon(process.env.REACT_APP_IMAGE_LINK + currentType.icon_path)

        setDeleting(-1)

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
            setFailMessage(updateError.message)
            fail()
        }
    }, [updateData, updateError])

    useEffect(() => {
        if (removeData) {
            if (deletingId !== -1) {
                dispatch(actions.removeMarker(deletingId))
                handleClose()
            }
        }

        if (removeError) {
            setFailMessage(removeError.message)
            fail()
        }
    }, [removeData, removeError, deletingId])

    const onHashTagClick = () => {
        history.replace('/markers/list')
        handleClose()
    }

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

    const redirectToGoogleMap = () => {
        const latlon = `${marker.latitude},${marker.longitude}`
        
        window.open(`https://maps.google.com/?q=${latlon}`, '_blank')
    }

    const onEditClick = () => {
        editMarker()
    }

    const onRemoveClick = () => {
        if (!window.confirm(`Do you want to remove ${marker.label}`)) return
        setDeleting(marker.id)
        removeMarkerGQL({ variables: { id: marker.id } })
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
                            <Grid container spacing={1}>
                                <Grid item xs={3} md={3} lg={3}>
                                    <CircleIconButton
                                        onClickHandler={openSchedule}
                                        disabled={marker.status === 'scheduled'}
                                    >
                                        <CalendarTodayIcon />
                                    </CircleIconButton>
                                </Grid>
                                <Grid item xs={3} md={3} lg={3}>
                                </Grid>
                                <Grid item xs={3} md={3} lg={3}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <CircleIconButton
                                        onClickHandler={() => setPreviewOpen(true)}
                                    >
                                        <InsertPhotoIcon />
                                    </CircleIconButton>
                                </Grid>
                                <Grid item xs={3} md={3} lg={3}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <FavouriteIcon 
                                        active={isFav}
                                        onClickHandler={toggleMarkerFavourite}
                                    />
                                </Grid>
                                <Grid item xs={12} md={12} lg={12}
                                    style={{
                                        width: '100%',
                                        overflowX: 'auto',
                                    }}
                                >
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
                                <Grid container spacing={2} style={{
                                    overflow: 'hidden'
                                }}>
                                    { marker.image_link && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <img
                                                width='100%'
                                                src={process.env.REACT_APP_IMAGE_LINK + marker.image_link}                                            
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={12} lg={12}>
                                        <span 
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => redirectToGoogleMap()}
                                        > { marker.address } </span>
                                        <IconButton
                                            onClick={() => { 
                                                navigator.clipboard.writeText(marker.address)
                                                triggerCopyMessage()
                                            }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Grid>
                                    {marker.permanent && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <PinDropIcon sx={{
                                                verticalAlign: 'middle',
                                                display: 'inline-block',
                                            }} /> Permanent Location
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={12} lg={12}>
                                        {marker.need_booking ? (
                                            <>
                                                <LocalPhoneIcon sx={{
                                                    verticalAlign: 'middle',
                                                    display: 'inline-block',
                                                }} /> Required booking
                                            </>
                                        ) : (
                                            <>
                                                <DirectionsWalkIcon sx={{
                                                    verticalAlign: 'middle',
                                                    display: 'inline-block',
                                                }} /> Can Walk-in
                                            </>
                                        )}
                                    </Grid>
                                   
                                    {marker.link && (
                                        <Grid item xs={12} md={12} lg={12}>
                                                <a style={{
                                                    overflowWrap: 'anywhere',
                                                }}
                                                onClick={redirectToSite}
                                                >{marker.link}</a>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={12} lg={12}>
                                        <MarkerDescription 
                                            description={marker.description}
                                            onHashTagClick={onHashTagClick}
                                        />
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
                                    {editMarker && (
                                        <>
                                            <Grid item xs={12} md={12} lg={12}>
                                                <Button 
                                                    variant='contained'
                                                    size='middle'
                                                    color='primary'
                                                    style={{
                                                        color: 'white',
                                                        marginLeft: '10%',
                                                        width: '80%',
                                                        boxShadow: '2px 2px 6px'
                                                    }}
                                                    onClick={onEditClick}
                                                >Edit</Button>
                                            </Grid>
                                            {/* <Grid item xs={12} md={12} lg={12}>
                                                <Button 
                                                    variant='contained'
                                                    size='middle'
                                                    color='error'
                                                    style={{
                                                        color: 'white',
                                                        marginLeft: '10%',
                                                        width: '80%',
                                                        boxShadow: '2px 2px 6px'
                                                    }}
                                                    onClick={onRemoveClick}
                                                >Delete</Button>
                                            </Grid> */}
                                        </>
                                    )}
                                    {marker.restaurant && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <RestaurantCard
                                                restaurant={marker.restaurant}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </DialogContentText>
                        </DialogContent>
                    </>
                )}
            </Dialog>
            <MarkerShareView 
                open={previewOpen}
                handleClose={() => setPreviewOpen(false)}
                marker={marker}
            />
            <AutoHideAlert 
                open={failedAlert}
                type={'error'}
                message={failMessage}
                timing={3000}
            />
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