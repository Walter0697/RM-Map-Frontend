import React from 'react'
import {
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Slide,
} from '@mui/material'

const TransitionFromLeft = (props) => {
    return <Slide {...props} direction='right' />
}

function ImagePreview({
    shouldOpen,
    handleClose,
    imageInfo,
}) {
    const getPreviewImage = () => {
        if (imageInfo) {
            if (imageInfo.type === 'weblink') {
                return (
                    <img
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        src={imageInfo.value}
                        alt={'preview'}
                    />
                )
            } else if (imageInfo.type === 'existing') {
                return (
                    <img
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        src={process.env.REACT_APP_IMAGE_LINK + imageInfo.value}
                        alt={'preview'}
                    />
                )
            } else if (imageInfo.type === 'upload') {
                const url = URL.createObjectURL(imageInfo.value)
                return (
                    <img
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        src={url}
                        alt={'preview'}
                    />
                )
            }
        }
        return false
    }

    return (
        <Dialog
            fullWidth
            maxWidth={'xl'}
            open={shouldOpen}
            TransitionComponent={TransitionFromLeft}
            onClose={handleClose}
        >
            <DialogContent>
                <DialogContentText>
                    {getPreviewImage()}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>OK</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ImagePreview