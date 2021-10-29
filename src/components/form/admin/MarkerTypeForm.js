import React, { useState, useEffect, useRef } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    FormHelperText,
} from '@mui/material'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import useObject from '../../../hooks/useObject'

import BaseForm from '../BaseForm'

import imagehelper from '../../../scripts/image'
import graphql from '../../../graphql'

function MarkerTypeForm({
    open,
    handleClose,
    onCreated,
    onUpdated,
}) {
    const [ createMarkerTypeGQL, { data: createData, loading: createLoading, error: createError }] = useMutation(graphql.markertypes.create, { errorPolicy: 'all' })

    // handling form value
    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        value: '',
        iconUpload: null,
        priority: 100,
    })
    const [ error, setError ] = useObject({})

    // handling image validation and upload
    const [ imageLoading, setImageLoading ] = useState(false)
    const [ imageUploadMessage, setImageMessage ] = useState('upload image must be a square')
    const [ imageName, setImageName ] = useState('')

    // handling loading and alert
    const [ submitting, setSubmitting ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        setSubmitting(false)
        resetFormValue()
    }, [])

    useEffect(() => {
        if (createData) {
            console.log(createData)
            onCreated && onCreated()
        }

        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }
    }, [ createData, createError])

    const onValueChangeHandler = (field, value) => {
        setFormValue(field, value)
        setError(field, '')
    }

    const onNumberChangeHandler = (field, value) => {
        value = value.replace(/\D/g,'').replace(/^0+/, '')
        setFormValue(field, value)
        setError(field, '')
    }

    // handle image upload
    const afterValidateImage = (success) => {
        if (success) {
            setError('iconUpload', false)
            setImageMessage('uploaded ')
        } else {
            setFormValue('iconUpload', null)
            setError('iconUpload', true)
            setImageMessage('image is not a square')
            setImageName('')
        }
        setImageLoading(false)
    }

    const handleImageChange = (e) => {
        if (e.target.files.length) {
            
            setFormValue('iconUpload', {
                upload: e.target.files[0],
            })
            setImageName(e.target.files[0].name)
            setError('iconUpload', false)

            setImageLoading(true)
            setImageMessage('loading image...')
            imagehelper.generic.is_square(e.target.files[0], afterValidateImage)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        let hasError = false

        if (imageLoading) {
            setError('iconUpload', true)
            setImageMessage('your image is still loading, please wait')
            setSubmitting(false)
            return
        }
        
        if (formValue.label === '') {
            setError('label', 'label cannot be empty')
            hasError = true
        }

        if (formValue.value === '') {
            setError('value', 'value cannot be empty')
            hasError = true
        }

        if (formValue.priority === '') {
            setError('priority', 'priority cannot be empty')
            hasError = true
        } else if (formValue.priority === 0) {
            setError('priority', 'priority cannot be zero')
            hasError = true
        }

        if (!formValue.iconUpload) {
            setError('iconUpload', true)
            setImageMessage('please upload an image')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        createMarkerTypeGQL({ variables: {
            label: formValue.label,
            value: formValue.value,
            priority: formValue.priority,
            icon_upload: formValue.iconUpload.upload,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Create Marker Type'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Create'}
                loading={submitting}
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
                        <TextField
                            variant='outlined'
                            fullWidth
                            required
                            label='value'
                            value={formValue.value}
                            onChange={(e) => onValueChangeHandler('value', e.target.value)}
                            error={!!error.value}
                            helperText={error.value}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            required
                            label='priority'
                            value={formValue.priority}
                            onChange={(e) => onNumberChangeHandler('priority', e.target.value)}
                            error={!!error.priority}
                            helperText={error.priority}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <input type='file' id='upload-image' style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor='upload-image'>
                            <FormControl variant='outlined' fullWidth>
                                <Button 
                                    id='upload-image-button'
                                    variant='outlined'
                                    component='span'
                                    fullWidth
                                    startIcon={<InsertDriveFileIcon />}
                                >
                                    Upload Image
                                </Button>
                                <FormHelperText htmlFor={'upload-image-button'} error={error.iconUpload}>
                                    {imageUploadMessage} {imageName}
                                </FormHelperText>
                            </FormControl>
                        </label>
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default MarkerTypeForm