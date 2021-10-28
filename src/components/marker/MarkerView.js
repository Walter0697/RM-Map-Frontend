import React from 'react'
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

const TransitionUp = (props) => {
    return <Slide {...props} direction="up" />
}

function MarkerView({
    open,
    handleClose,
    marker,
}) {
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
                                    onClick={() => {}}
                                >
                                    <CalendarTodayIcon />
                                </CircleIconButton>
                            </Grid>
                            <Grid item xs={8} md={8} lg={8}>
                                
                            </Grid>
                            <Grid item xs={2} md={2} lg={2}>
                                <FavouriteIcon 
                                    active={true}
                                    onClickHandler={() => {}}
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

export default MarkerView