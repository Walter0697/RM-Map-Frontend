import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    FormHelperText,
    Paper,
    Stack,
    Typography,
} from '@mui/material'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import useObject from '../../../hooks/useObject'

import BaseForm from '../BaseForm'
import Selectable from '../../field/Selectable'

import imagehelper from '../../../scripts/image'
import graphql from '../../../graphql'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
 
dayjs.extend(dayjsPluginUTC)

function MarkerTypeForm({
    open,
    handleClose,
    onCreated,
    onUpdated,
    markerType,
}) {
    const [ createMarkerTypeGQL, { data: createData, loading: createLoading, error: createError }] = useMutation(graphql.markertypes.create, { errorPolicy: 'all' })
    const [ editMarkerTypeGQL, { data: editData, loading: editLoading, error: editError }] = useMutation(graphql.markertypes.edit, { errorPolicy: 'all' })

    // handling form value
    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        value: '',
        iconUpload: null,
        priority: 100,
        hidden: false,
    })
    const [ error, setError ] = useObject({})

    // handling image validation and upload
    const [ imageLoading, setImageLoading ] = useState(false)
    const [ imageUploadMessage, setImageMessage ] = useState('upload image must be a square')
    const [ imageName, setImageName ] = useState('')

    // handling loading and alert
    const [ submitting, setSubmitting ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)
    const fieldSx = { width: { xs: '100%', md: 300 } }

    useEffect(() => {
        setSubmitting(false)
        resetFormValue()
        if (markerType) {
            setFormValue('label', markerType.label)
            setFormValue('value', markerType.value)
            setFormValue('priority', markerType.priority)
            setFormValue('hidden', markerType.hidden)
        }
    }, [markerType, open])

    useEffect(() => {
        if (createData) {
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

    useEffect(() => {
        if (editData) {
            onUpdated && onUpdated()
        }

        if (editError) {
            setAlertMessage({
                type: 'error',
                message: editError.message,
            })
            setSubmitting(false)
        }
    }, [ editData, editError ])

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

    const onSubmitHandler = (e) => {
        e.preventDefault()
        setSubmitting(true)

       if (markerType?.id) {
           return onUpdateHandler()
       } 
       
       onCreateHandler()
    }

    const onCreateHandler = () => {
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
            hidden: formValue.hidden,
        }})
    }

    const onUpdateHandler = () => {
        if (imageLoading) {
            setError('iconUpload', true)
            setImageMessage('your image is still loading, please wait')
            setSubmitting(false)
            return
        }

        editMarkerTypeGQL({ variables: {
            id: markerType.id,
            label: formValue.label,
            value: formValue.value,
            priority: formValue.priority,
            icon_upload: formValue.iconUpload ? formValue.iconUpload.upload : null,
            hidden: formValue.hidden,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={markerType?.label ? `Updating ${markerType.label}` : 'Creating Marker Type'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={markerType?.id ? 'Update' : 'Create'}
                loading={submitting || createLoading || editLoading}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
                displayMode='panel'
            >
                <Stack spacing={2}>
                    <Paper variant='outlined' sx={{ p: 2 }}>
                        <Typography variant='subtitle1' sx={{ mb: 1.5, fontWeight: 700 }}>
                            Basic Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='label'
                                    value={formValue.label}
                                    onChange={(e) => onValueChangeHandler('label', e.target.value)}
                                    error={!!error.label}
                                    helperText={error.label}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='value'
                                    value={formValue.value}
                                    onChange={(e) => onValueChangeHandler('value', e.target.value)}
                                    error={!!error.value}
                                    helperText={error.value}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='priority'
                                    value={formValue.priority}
                                    onChange={(e) => onNumberChangeHandler('priority', e.target.value)}
                                    error={!!error.priority}
                                    helperText={error.priority}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Selectable
                                    label='hidden'
                                    value={formValue.hidden}
                                    onValueChange={(e) => onValueChangeHandler('hidden', e.target.value)}
                                    noDefault
                                    errorMessage={''}
                                    sx={fieldSx}
                                    list={[
                                        { value: false, label: 'no' },
                                        { value: true, label: 'yes' },
                                    ]}
                                    valueKey={'value'}
                                    textKey={'label'}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper variant='outlined' sx={{ p: 2 }}>
                        <Typography variant='subtitle1' sx={{ mb: 1.5, fontWeight: 700 }}>
                            Icon Upload
                        </Typography>
                        <input type='file' id='upload-image' style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor='upload-image'>
                            <FormControl variant='outlined' fullWidth sx={fieldSx}>
                                <Button 
                                    id='upload-image-button'
                                    variant='outlined'
                                    component='span'
                                    fullWidth
                                    startIcon={<InsertDriveFileIcon />}
                                    sx={{ minHeight: 44 }}
                                >
                                    Upload Image
                                </Button>
                                <FormHelperText htmlFor={'upload-image-button'} error={error.iconUpload}>
                                    {imageUploadMessage} {imageName}
                                </FormHelperText>
                            </FormControl>
                        </label>
                    </Paper>

                    { markerType && (
                        <Paper variant='outlined' sx={{ p: 2 }}>
                            <Typography variant='subtitle2' color='text.secondary'>
                                Created By {markerType.created_by.username} at {dayjs.utc(markerType.created_at).format('YYYY-MM-DD HH:mm')}
                            </Typography>
                            <Typography variant='subtitle2' color='text.secondary'>
                                Updated By {markerType.updated_by.username} at {dayjs.utc(markerType.updated_at).format('YYYY-MM-DD HH:mm')}
                            </Typography>
                        </Paper>
                    )}
                </Stack>
            </BaseForm>
        </>
    )
}

export default MarkerTypeForm
