import React from 'react'
import {
    IconButton,
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Slide,
} from '@mui/material'

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
            <DialogTitle>
                Marker Label 
            </DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    <Grid container space={10}>
                        <Grid item xs={12} md={12} lg={12}>
                            Testing
                        </Grid>
                    </Grid>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default MarkerView