import React, { useState, useEffect, useMemo } from 'react'
import {
    Grid,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Slide,
} from '@mui/material'

import imagehelper from '../../../scripts/image'

const TransitionFromLeft = (props) => {
    return <Slide {...props} direction="right" />
}

function ImageLinkValidate({
    shouldOpen,
    handleClose,
    imageLink, 
    setImageLink,
}) {
    const [ link, setLink ] = useState(imageLink ?? '')

    const [ isValid, setValid ] = useState(false)
    const [ checking, setChecking ] = useState(true)
    const [ helperMessage, setMessage ] = useState('')

    const hasError = useMemo(() => {
        if (checking) return false
        return !isValid
    }, [isValid, checking])
    
    useEffect(() => {
        if (!link) {
            setChecking(true)
            return
        }
        setValid(false)
        setMessage('checking...')
        imagehelper.generic.validate(link, onValidateCallback)
    }, [link])

    const onValidateCallback = (valid) => {
        setChecking(false)
        setValid(valid)
        if (valid) {
            setMessage('this image link is valid!')
        } else {
            setMessage('this is not a valida image link')
        }
    }

    const onLinkChangeHandler = (e) => {
        setLink(e.target.value)
        setChecking(true)
    }

    const onImageLinkSubmitHandler = () => {
        if (isValid) {
            setImageLink(link)
            handleClose()
        }
    }

    return (
        <Dialog
            fullWidth
            maxWidth={'xl'}
            open={shouldOpen}
            TransitionComponent={TransitionFromLeft}
            onClose={handleClose}
        >
            <DialogTitle>Preview Image</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12} lg={12}>
                            <TextField
                                variant='outlined'
                                fullWidth
                                label='image link'
                                value={link}
                                onChange={onLinkChangeHandler}
                                error={hasError}
                                helperText={helperMessage}
                            />
                        </Grid>
                    </Grid>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={onImageLinkSubmitHandler} disabled={!isValid}>Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ImageLinkValidate