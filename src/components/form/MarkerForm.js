import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    FormLabel,
} from '@mui/material'

import AddLinkIcon from '@mui/icons-material/AddLink'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'

import useObject from '../../hooks/useObject'
import useDebounce from '../../hooks/useDebounce'

import BaseForm from './BaseForm'
import ImageLinkValidate from './image/ImageLinkValidate'
import ImagePreview from './image/ImagePreview'
import Selectable from '../field/Selectable'
import NullableDatePicker from '../field/NullableDatePicker'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

function MarkerForm({
    open,
    handleClose,
    onCreated,
    location,
    eventtypes,
    dispatch,
}) {
    const [ createMarkerGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.markers.create, { errorPolicy: 'all' })
    const [ scrapimageGQL, { data: scrapImageData, loading: scrapImageLoading, error: scrapImageError } ] = useLazyQuery(graphql.helpers.webscrap)

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        address: '',
        imageLink: false,
        link: '',
        type: '',  
        description: '', 
        estimate_time: '',
        price: '',
        need_booking: false,
        permanent:  false,
        from_time: null,
        to_time: null,    
    })
    const [ error, setError ] = useObject({})

    const [ imageFormState , setImageState ] = useState('') // weblink, preview, scrap
    const [ imageSubmitMessage, setImageMessage ] = useState('')

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (!location) return

        // if location updated, reset everything inside the form
        setSubmitting(false)
        resetFormValue()
        setImageMessage('')
        setImageState('')
        setUnauthorized(false)

        if (location.address) {
            setFormValue('address', location.address)
        }

        if (location.name) {
            setFormValue('label', location.name)
        }
        
    }, [location])

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            dispatch(actions.addMarker(createData.createMarker))
            onCreated && onCreated()
        }
    }, [createData, createError])

    useEffect(() => {
        if (scrapImageData) {
            if (scrapImageData.scrapimage.image_link) {
                setFormValue('imageLink', {
                    type: 'weblink',
                    value: scrapImageData.scrapimage.image_link,
                })
                setImageState('scrap')
                setImageMessage('image by scrapping website')
            }

            if (scrapImageData.scrapimage.title) {
                if (!formValue.label) {
                    setFormValue('label', scrapImageData.scrapimage.title)
                }
            }
        }
    }, [scrapImageData])

    const scrapImageWithLink = () => {
        if (formValue.link === '') return
        console.log(formValue.link)
        scrapimageGQL({ variables: { link: formValue.link }})
    }

    useDebounce(scrapImageWithLink, 2000, [ formValue.link ])

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

    // handle image upload
    const handleImageChange = (e) => {
        if (e.target.files.length) {
            setFormValue('imageLink', {
                type: 'upload',
                value: e.target.files[0],
                name: e.target.files[0].name,
            })
            setImageMessage('image from user upload')
        }
    }

    const removeImage = () => {
        setFormValue('imageLink', null)
        setImageMessage('')
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        let hasError = false

        if (formValue.label === '') {
            setError('label', 'label cannot be empty')
            hasError = true
        }

        if (formValue.type === '') {
            setError('type', 'type cannot be empty')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        const to = formValue.to_time ? generic.time.toServerFormat(formValue.to_time) : null
        const from = formValue.from_time ? generic.time.toServerFormat(formValue.from_time) : null

        createMarkerGQL({ variables: {
            label: formValue.label,
            type: formValue.type,
            latitude: location.latlon.lat.toString(),
            longitude: location.latlon.lon.toString(),
            address: formValue.address,
            link: formValue.link,
            image_link: (formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : null,
            image_upload: (formValue.imageLink && formValue.imageLink.type === 'upload') ? formValue.imageLink.value : null,
            description: formValue.description,
            estimate_time: formValue.estimate_time,
            price: formValue.price,
            need_booking: formValue.need_booking,
            permanent: formValue.permanent,
            to_time: to,
            from_time: from,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Create Marker'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Create'}
                loading={submitting}
                isSubmitUnauthorized={isUnauthorized}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            required
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
                            label='longitude'
                            value={location ? location.latlon.lon : ''}
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
                            label='latitude'
                            value={location ? location.latlon.lat : ''}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='type'
                            required
                            value={formValue.type}
                            onValueChange={(e) => onValueChangeHandler('type', e.target.value)}
                            defaultSelectaValue={''}
                            defaultSelectText={''}
                            errorMessage={error.type}
                            list={eventtypes}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            InputLabelProps={{
                                shrink: !!formValue.address,
                            }}
                            variant='outlined'
                            fullWidth
                            required
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
                        <FormControl component='image' fullWidth>
                            <FormLabel 
                                component='legend'
                            >
                                Preview
                            </FormLabel>
                            <FormLabel>
                                {imageSubmitMessage}
                            </FormLabel>
                            <Grid container spacing={0} fullWidth>
                                <Grid item xs={4} md={4} lg={4}>
                                    <Button 
                                        variant='outlined'
                                        fullWidth
                                        onClick={() => setImageState('weblink')}>
                                        <AddLinkIcon />
                                    </Button>
                                </Grid>
                                <Grid item xs={4} md={4} lg={4}>
                                    <input type='file' id='upload-image' style={{ display: 'none' }} onChange={handleImageChange} />
                                    <label htmlFor='upload-image'>
                                        <Button 
                                            variant='outlined'
                                            component='span'
                                            fullWidth>
                                            <InsertDriveFileIcon />
                                        </Button>
                                    </label>
                                </Grid>
                                <Grid item xs={4} md={4} lg={4}>
                                    <Button 
                                        variant='outlined'
                                        fullWidth
                                        disabled={!formValue.imageLink}
                                        onClick={() => setImageState('preview')}
                                    >
                                        <VisibilityIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                            <FormLabel>
                                {formValue.imageLink && (
                                    <div 
                                        style={{
                                            color: 'red',
                                        }}
                                        onClick={removeImage}
                                    >
                                        <DeleteIcon sx={{ verticalAlign: 'middle', display: 'inline-block', fontSize: '18px' }}/> 
                                        <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>Remove Image</span>
                                    </div>)}
                            </FormLabel>
                        </FormControl>
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
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='estimate time'
                            value={formValue.estimate_time}
                            onValueChange={(e) => onValueChangeHandler('estimate_time', e.target.value)}
                            defaultSelectaValue={''}
                            defaultSelectText={''}
                            errorMessage={''}
                            list={[
                                { value: 'short', label: 'Short' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'long', label: 'Long' },
                            ]}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='pricing'
                            value={formValue.price}
                            onValueChange={(e) => onValueChangeHandler('price', e.target.value)}
                            defaultSelectaValue={''}
                            defaultSelectText={''}
                            errorMessage={''}
                            list={[
                                { value: 'free', label: 'Free' },
                                { value: 'cheap', label: 'Cheap $' },
                                { value: 'middle', label: 'Middle $$' },
                                { value: 'expensive', label: 'Expensive $$$'},
                            ]}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <NullableDatePicker
                            label={'from'}
                            value={formValue.from_time}
                            onValueChange={(e) => onValueChangeHandler('from_time', e)}
                            errorMessage={error.from_time}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <NullableDatePicker
                            label={'to'}
                            value={formValue.to_time}
                            onValueChange={(e) => onValueChangeHandler('to_time', e)}
                            errorMessage={error.to_time}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='permanent'
                            value={formValue.permanent}
                            onValueChange={(e) => onValueChangeHandler('permanent', e.target.value)}
                            noDefault
                            errorMessage={''}
                            list={[
                                { value: false, label: 'no' },
                                { value: true, label: 'yes' },
                            ]}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='need booking'
                            value={formValue.need_booking}
                            onValueChange={(e) => onValueChangeHandler('need_booking', e.target.value)}
                            noDefault
                            errorMessage={''}
                            list={[
                                { value: false, label: 'no' },
                                { value: true, label: 'yes' },
                            ]}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                </Grid>
            </BaseForm>
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

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MarkerForm)