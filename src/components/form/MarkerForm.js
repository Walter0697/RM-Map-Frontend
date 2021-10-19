import React, { useState, useEffect } from 'react'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    FormLabel,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide
} from '@mui/material'
import dayjs from 'dayjs'

import AddLinkIcon from '@mui/icons-material/AddLink'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import VisibilityIcon from '@mui/icons-material/Visibility'

import useObject from '../../hooks/useObject'

import ImageLinkValidate from './image/ImageLinkValidate'
import ImagePreview from './image/ImagePreview'
import Selectable from '../field/Selectable'

import maphelper from '../../scripts/map'

const TransitionUp = (props) => {
    return <Slide {...props} direction="up" />
}

function MarkerForm({
    open,
    handleClose,
    location,
}) {
    const [ formValue, setFormValue ] = useObject({
        label: '',
        address: '',
        imageLink: false,
        link: '',
        type: '',  
        description: '', 
        to_time: null,    
        from_time: null,
    })
    const [ error, setError ] = useObject({})

    const [ imageFormState , setImageState ] = useState('') // weblink, upload, preview
    const [ imageSubmitMessage, setImageMessage ] = useState('')

    const [ submitting, setSubmitting ] = useState(false)

    useEffect(() => {
        if (!location) return
        const address = maphelper.generic.getAddress(location.details.address)
        setFormValue('address', address)
    }, [location])

    const onValueChangeHandler = (field, value) => {
        setFormValue(field, value)
        setError(field, '')
    }

    const onImageLinkChangeHandler = (link) => {
        setFormValue('imageLink', {
            type: 'weblink',
            value: link,
        })
        setImageMessage('image from the internet')
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        let hasError = false

        if (formValue.label === '') {
            setError('label', 'label cannot be empty')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        setSubmitting(false)
    }

    // handle image upload
    const handleImageChange = (e) => {
        if (e.target.files.length) {
            setFormValue('imageLink', {
                type: 'upload',
                value: e.target.files[0],
                name: e.target.files[0].name,
            })
            console.log(e.target.files[0])
            setImageMessage('image from user upload')
        }
    }

    return (
        <>
            <Dialog
                fullWidth
                maxWidth={'lg'}
                open={open}
                TransitionComponent={TransitionUp}
                onClose={handleClose}
                scroll={'paper'}
            >
                <DialogTitle>Create Marker</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12} lg={12}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='label'
                                    value={formValue.label}
                                    onChange={(e) => onValueChangeHandler('label', e.target.value)}
                                    error={!!error.label}
                                    helperText={error.label}
                                />
                            </Grid>
                            <Grid item xs={6} md={6} lg={6}>
                                <TextField
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    variant='outlined'
                                    size='small'
                                    fullWidth
                                    label="longitude"
                                    value={location ? location.location.lon : ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={6} md={6} lg={6}>
                                <TextField
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    variant='outlined'
                                    size='small'
                                    fullWidth
                                    label="latitude"
                                    value={location ? location.location.lat : ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <TextField
                                    InputLabelProps={{
                                        shrink: !!formValue.address,
                                    }}
                                    variant='outlined'
                                    fullWidth
                                    label='address'
                                    value={formValue.address}
                                    onChange={(e) => onValueChangeHandler('address', e.target.value)}
                                    error={!!error.address}
                                    helperText={error.address}
                                />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='website'
                                    value={formValue.link}
                                    onChange={(e) => onValueChangeHandler('link', e.target.value)}
                                    error={!!error.link}
                                    helperText={error.link}
                                />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <FormControl component="image" fullWidth>
                                    <FormLabel 
                                        component="legend"
                                    >
                                        Preview
                                    </FormLabel>
                                    <Grid container spacing={0} fullWidth>
                                        <Grid item xs={4} md={4} lg={4}>
                                            <Button 
                                                variant="outlined"
                                                fullWidth
                                                onClick={() => setImageState('weblink')}>
                                                <AddLinkIcon />
                                            </Button>
                                        </Grid>
                                        <Grid item xs={4} md={4} lg={4}>
                                            <input type="file" id="upload-image" style={{ display: 'none' }} onChange={handleImageChange} />
                                            <label htmlFor="upload-image">
                                                <Button 
                                                    variant="outlined"
                                                    component="span"
                                                    fullWidth>
                                                    <InsertDriveFileIcon />
                                                </Button>
                                            </label>
                                        </Grid>
                                        <Grid item xs={4} md={4} lg={4}>
                                            <Button 
                                                variant="outlined"
                                                fullWidth
                                                disabled={!formValue.imageLink}
                                                onClick={() => setImageState('preview')}
                                            >
                                                <VisibilityIcon />
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <FormLabel>
                                        {imageSubmitMessage}
                                    </FormLabel>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <Selectable
                                    label="type"
                                    value={formValue.type}
                                    onValueChange={(e) => onValueChangeHandler('type', e.target.value)}
                                    defaultSelectaValue={''}
                                    defaultSelectText={''}
                                    errorMessage={error.type}
                                    list={[
                                        { value: 'restaurant', label: 'Restaurant' },
                                        { value: 'fun', label: 'For Fun' },
                                        { value: 'event', label: 'Event' },
                                    ]}
                                    valueKey={'value'}
                                    textKey={'label'}
                                />
                            </Grid>
                            <Grid item xs={12} md={12} lg={12}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='description'
                                    value={formValue.description}
                                    onChange={(e) => onValueChangeHandler('description', e.target.value)}
                                    error={!!error.description}
                                    helperText={error.description}
                                />
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Create</Button>
                </DialogActions>
            </Dialog>
            <ImageLinkValidate 
                shouldOpen={imageFormState === 'weblink'}
                handleClose={() => setImageState('')}
                imageLink={(formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : ''}
                setImageLink={onImageLinkChangeHandler}
            />
            <ImagePreview
                shouldOpen={imageFormState === 'preview'}
                handleClose={() => setImageState('')}
                imageInfo={formValue.imageLink}
            />
        </>
    )
}

export default MarkerForm