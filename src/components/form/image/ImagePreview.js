import React, { useMemo } from 'react'
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
import image from '../../../scripts/image'
import constants from '../../../constant'

const TransitionFromLeft = (props) => {
    return <Slide {...props} direction='right' />
}

function ImagePreview({
    shouldOpen,
    handleClose,
    imageInfo,
    imageVersion,
    chooseImageVersion,
    imageCache,
}) {
    const oppositeImageVersion = useMemo(() => {
        if (imageVersion === 'compressed') return 'original'
        return 'compressed'
    }, [imageVersion])

    const chooseOppositeImageVersion = () => {
        const confirmed = window.confirm(`Are you sure you want to switch to ${oppositeImageVersion}?`)
        if (confirmed) {
            chooseImageVersion(oppositeImageVersion)
        }
    }

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
                        src={constants.BackendImageLink + imageInfo.value}
                        alt={'preview'}
                    />
                )
            } else if (imageInfo.type === 'upload') {
                const url = URL.createObjectURL(imageInfo.value)
                return (
                    <>
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            src={url}
                            alt={'preview'}
                        />
                        {imageCache.compressed && (
                            <div>
                                Compressed Size: {image.compress.formatBytes(imageCache.compressed.size)} {imageVersion === 'compressed' ? '(Current)' : ''}
                            </div>
                        )}
                        {imageCache.original && (
                            <div>
                                Original Size: {image.compress.formatBytes(imageCache.original.size)} {imageVersion === 'original' ? '(Current)' : ''}
                            </div>
                        )}
                        {imageCache.compressed && imageCache.original && (
                            <div 
                                style={{
                                    color: 'blue',   
                                }}
                                onClick={chooseOppositeImageVersion}
                            >
                                Click here to change to {oppositeImageVersion}
                            </div>
                        )}
                    </>
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