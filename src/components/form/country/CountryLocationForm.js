import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
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

import useObject from '../../../hooks/useObject'

import BaseForm from '../BaseForm'
import ImageLinkValidate from '../image/ImageLinkValidate'
import ImagePreview from '../image/ImagePreview'
import Selectable from '../../field/Selectable'
import NullableDatePicker from '../../field/NullableDatePicker'

import graphql from '../../../graphql'
import image from '../../../scripts/image'
import generic from '../../../scripts/generic'
import actions from '../../../store/actions'

function CountryLocationForm({
    open,
    handleClose,
    countryPoint,
    onCreated,
    markers,
    eventtypes,
    dispatch,
}) {
    const [ createCountryLocationGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.countries.createCountryLocation, { errorPolicy: 'all' })

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        imageLink: false,
        visit_time: null,
        marker_id: null,
    })
    const [ error, setError ] = useObject({})

    const [ selectedType, setSelectedType ] = useState(-1)

    const [ imageFormState , setImageState ] = useState('') // weblink, preview, scrap
    const [ imageSubmitMessage, setImageMessage ] = useState('')

    // storing the image information, to determined if it is using the compressed one, or the original one
    let rawImageCaches = {}
    const [ imageCache, setImageCache ] = useState({})
    const [ imageVersion, setImageVersion ] = useState(null)

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    const filteredMarkers = useMemo(() => {
        if (selectedType) {
            return markers.filter(s => s.type === selectedType)
        }
        return markers
    }, [selectedType, markers])

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            dispatch(actions.addCountryLocation(createData.createCountryLocation))
            onCreated && onCreated()
        }
    }, [createData, createError])

    useEffect(() => {
        if (!open) return

        setSubmitting(false)
        resetFormValue()
        setImageMessage('')
        setImageState('')
        setUnauthorized(false)
    }, [countryPoint, open])

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

    const chooseImageVersion = (selected) => {
        const target = imageCache[selected]
        setFormValue('imageLink', {
            type: 'upload',
            value: target.data,
            name: target.data.name,
        })
        setImageVersion(selected)
    }

    const handleCompressedImage = (result) => {
        setFormValue('imageLink', {
            type: 'upload',
            value: result,
            name: result.name
        })
        setImageVersion('compressed')
        const caches = Object.assign({}, rawImageCaches)
        caches['compressed'] = {
            size: result.size,
            data: result,
        }
        rawImageCaches = caches
        setImageCache(caches)
    }

    // handle image upload
    const handleImageChange = (e) => {
        if (e.target.files.length) {
            const fileValue = e.target.files[0]
            const isImage = image.compress.isImage(fileValue)
            if (!isImage) return
            setImageMessage('image from user upload')
            setFormValue('imageLink', {
                type: 'upload',
                value: e.target.files[0],
                name: e.target.files[0].name,
            })
            setImageVersion('original')
            const caches = Object.assign({}, rawImageCaches)
            caches['original'] = {
                size: e.target.files[0].size,
                data: e.target.files[0],
            }
            rawImageCaches = caches
            setImageCache(caches)
            const sc = image.compress.shouldCompress(fileValue)
            if (sc) {
                image.compress.compressImage(fileValue).then(result => {
                    handleCompressedImage(result)
                })
            }
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

        if (!formValue.visit_time) {
            setError('visit_time', 'visit time cannot be empty')
            hasError = true
        }

        if (!formValue.imageLink) {
            setImageMessage('image is required')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        const visitTime = formValue.visit_time ? generic.time.toServerFormat(formValue.visit_time) : null

        createCountryLocationGQL({ variables: {
            label: formValue.label,
            visit_time: visitTime,
            marker_id: formValue.marker_id ? formValue.marker_id : null,
            country_point_id: countryPoint.id,
            image_link: (formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : null,
            image_upload: (formValue.imageLink && formValue.imageLink.type === 'upload') ? formValue.imageLink.value : null, 
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Create Country Location for ' + countryPoint?.label}
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
                    <Grid item xs={12} md={12} lg={12}>
                        <NullableDatePicker
                            label={'visited time'}
                            required
                            value={formValue.visit_time}
                            onValueChange={(e) => onValueChangeHandler('visit_time', e)}
                            errorMessage={error.visit_time}
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
                                    </div>
                                )}
                            </FormLabel>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='marker type'
                            value={selectedType}
                            onValueChange={(e) => setSelectedType(e.target.value)}
                            defaultSelectValue={null}
                            defaultSelectText={''}
                            errorMessage={''}
                            list={eventtypes}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='related marker'
                            value={formValue.marker_id}
                            onValueChange={(e) => onValueChangeHandler('marker_id', e.target.value)}
                            defaultSelectValue={null}
                            defaultSelectText={''}
                            errorMessage={''}
                            list={filteredMarkers}
                            valueKey={'id'}
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
                imageVersion={imageVersion}
                chooseImageVersion={chooseImageVersion}
                imageCache={imageCache}
            />
        </>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
}))(CountryLocationForm)