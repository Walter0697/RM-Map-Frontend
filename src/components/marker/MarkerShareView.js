import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Slide,
} from '@mui/material'

import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'

import generate from '../../scripts/generate'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function MarkerShareView({
    open,
    handleClose,
    marker,
    eventtypes,
}) {
    const [ previewImage, setPreviewImage ] = useState(null)

    const setImage = async () => {

        const eventtype = eventtypes.find(s => s.value === marker.type)
        const generated = await generate.preview.generatePreviewImage(marker, eventtype)
        
        setPreviewImage(generated)
    }

    useEffect(() => {
        if (open && marker) {
            setImage()
        }
    }, [open, marker])

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
                            Marker Share Preview: {marker.label}
                        </DialogTitle>
                        <DialogContent dividers>
                            <DialogContentText>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                {previewImage && (
                                    <img 
                                        style={{
                                            width: '90%',
                                        }} 
                                        src={previewImage} 
                                    />
                                )}
                            </div>
                            </DialogContentText>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MarkerShareView)