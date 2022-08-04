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

import CircleIconButton from '../field/CircleIconButton'

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
    const [ generating, setGenerating ] = useState(false)
    const [ previewImage, setPreviewImage ] = useState(null)

    const setImage = async () => {
        setGenerating(true)
        const eventtype = eventtypes.find(s => s.value === marker.type)
        const generated = await generate.preview.generatePreviewImage(marker, eventtype)
        
        setPreviewImage(generated)
        setGenerating(false)
    }

    const shareImage = async () => {
        const filename = `${marker.label}.png`
        if (navigator.share) {
            const blob = await (await fetch(previewImage)).blob()
            const filesArray = [
                new File(
                    [blob],
                    filename,
                    {
                        type: blob.type,
                        lastModified: new Date().getTime()
                    }
                )
            ]
            const shareData = {
                files: filesArray,
            }
            navigator.share(shareData)
        } else {
            save_image(filename, dataURL)
        }
    }

    const downloadImage = async () => {
        var a = document.createElement('a')
        a.href = previewImage
        a.download = `${marker.label}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
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
                                <Grid container>
                                    <Grid item xs={12} md={12} lg={12}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            {!generating && (
                                                <img 
                                                    style={{
                                                        width: '90%',
                                                        marginBottom: '30px',
                                                    }} 
                                                    src={previewImage} 
                                                />
                                            )}
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        <Grid container>
                                            <Grid item xs={6} md={6} lg={6}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                }}
                                            >
                                                {navigator.share && (
                                                    <CircleIconButton
                                                        onClickHandler={shareImage}
                                                        disabled={generating}
                                                    >
                                                        <SendIcon />
                                                    </CircleIconButton>
                                                )}
                                            </Grid>
                                            <Grid item xs={6} md={6} lg={6}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                <CircleIconButton
                                                    onClickHandler={downloadImage}
                                                    disabled={generating}
                                                >
                                                    <SaveIcon />
                                                </CircleIconButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
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