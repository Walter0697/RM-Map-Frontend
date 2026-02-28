import React, { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@apollo/client'
import {
    Box,
    Grid,
    TextField,
    Button,
    FormControl,
    FormHelperText,
    Paper,
    Stack,
    Typography,
} from '@mui/material'
import backend from '../../../constant/backend'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import useObject from '../../../hooks/useObject'

import BaseForm from '../BaseForm'
import Selectable from '../../field/Selectable'

import graphql from '../../../graphql'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'

dayjs.extend(dayjsPluginUTC)

function PinForm({
    open,
    handleClose,
    onCreated,
    onUpdated,
    typeList,
    pin,
}) {
    // graphql request
    const [ createPinGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.pins.create, { errorPolicy: 'all' })
    const [ editPinGQL, { data: editData, loading: editLoading, error: editError } ] = useMutation(graphql.pins.edit, { errorPolicy: 'all' })
    const [ previewPinGQL, { data: previewData, loading: previewLoading, error: previewError } ] = useMutation(graphql.pins.preview, { errorPolicy: 'all' })

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        top_left_x: 0,
        top_left_y: 0,
        bottom_right_x: 0,
        bottom_right_y: 0,
        imageUplaod: null,
    })
    const [ error, setError ] = useObject({})

    // preview related
    const [ selectedTypeId, setTypeId ] = useState('')
    const [ previewURL, setPreview ] = useState('')

    // handling image information
    const [ imageUploadMessage, setImageMessage ] = useState('please upload an image first')

    // handling loading and alert
    const [ submitting, setSubmitting ] = useState(false)
    
    const [ alertMessage, setAlertMessage ] = useState(null)
    const fieldSx = { width: { xs: '100%', md: 300 } }

    const canPreview = useMemo(() => {
        if (!formValue.imageUpload && !pin?.image_path) return false
        if (!selectedTypeId) return false
        return true
    }, [ formValue, selectedTypeId, pin ])

    const previewMessage = useMemo(() => {
        if (!formValue.imageUpload && !pin?.image_path) return 'cannot preview, no image available'
        if (!selectedTypeId) return 'cannot preview, marker type not selected'
        // if (formValue.top_left_x >= formValue.bottom_right_x) return 'x value invalid'
        // if (formValue.top_left_y >= formValue.bottom_right_y) return 'y value invalid'
        return ''
    }, [ formValue, selectedTypeId, pin ])

    useEffect(() => {
        setSubmitting(false)
        setTypeId('')
        setPreview('')
        resetFormValue()
        setImageMessage('please upload an image first')
        if (pin) {
            setFormValue('label', pin.label)
            setFormValue('top_left_x', pin.top_left_x)
            setFormValue('top_left_y', pin.top_left_y)
            setFormValue('bottom_right_x', pin.bottom_right_x)
            setFormValue('bottom_right_y', pin.bottom_right_y)
        }
    }, [pin, open])

    useEffect(() => {
        if (previewData) {
            setPreview(backend.IMAGE_LINK + previewData.previewPin)
        }

        if (previewError) {
            console.log(previewError)
        }
    }, [previewData, previewError])

  
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

    const onPreviewTypeChangeHandler = (e) => {
        setTypeId(e.target.value)
    }

    // handle image upload
    const handleImageChange = (e) => {
        if (e.target.files.length) {
            setFormValue('imageUpload', {
                upload: e.target.files[0],
            })
            
            setError('imageUpload', false)
        }
    }

    const getPreviewUpload = async () => {
        if (formValue.imageUpload?.upload) {
            return formValue.imageUpload.upload
        }

        if (!pin?.image_path) return null

        const existingImageUrl = backend.IMAGE_LINK + pin.image_path
        const response = await fetch(existingImageUrl)
        if (!response.ok) {
            throw new Error('failed to load current image for preview')
        }
        const blob = await response.blob()
        return new File([blob], pin.image_path.split('/').pop() || 'pin-preview.png', {
            type: blob.type || 'image/png',
        })
    }

    const onPreviewGenerate = async () => {
        if (!canPreview) return
        try {
            const uploadFile = await getPreviewUpload()
            if (!uploadFile) {
                setAlertMessage({
                    type: 'error',
                    message: 'No image available for preview',
                })
                return
            }

            previewPinGQL({ variables: {
                top_left_x: formValue.top_left_x,
                top_left_y: formValue.top_left_y,
                bottom_right_x: formValue.bottom_right_x,
                bottom_right_y: formValue.bottom_right_y,
                image_upload: uploadFile,
                type_id: selectedTypeId,
            }})
        } catch (e) {
            setAlertMessage({
                type: 'error',
                message: `Failed to generate preview: ${e.message}`,
            })
        }
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()
        setSubmitting(true)

       if (pin?.id) {
           return onUpdateHandler()
       } 
       
       onCreateHandler()
    }

    const onCreateHandler = () => {
        let hasError = false

        if (formValue.label === '') {
            setError('label', 'label cannot be empty')
            hasError = true
        }

        if (!formValue.imageUpload) {
            setError('imageUpload', false)
            setImageMessage('please upload an image')
            hasError = true
        }

        // if (formValue.top_left_x && formValue.bottom_right_x) {
        //     if (formValue.top_left_x <= formValue.bottom_right_x) {
        //         setError('top_left_x', 'invalid')
        //         setError('bottom_right_x', 'invalid')
        //         hasError = true
        //     }
        // } else {
        //     if (!formValue.top_left_x) {
        //         setError('top_left_x', 'missing')
        //         hasError = true
        //     }
        //     if (!formValue.bottom_right_x) {
        //         setError('bottom_right_x', 'missing')
        //         hasError = true
        //     }
        // }

        // if (formValue.top_left_y && formValue.bottom_right_y) {
        //     if (formValue.top_left_y <= formValue.bottom_right_y) {
        //         setError('top_left_y', 'invalid')
        //         setError('bottom_right_y', 'invalid')
        //         hasError = true
        //     }
        // } else {
        //     if (!formValue.top_left_y) {
        //         setError('top_left_y', 'missing')
        //         hasError = true
        //     }
        //     if (!formValue.bottom_right_y) {
        //         setError('bottom_right_y', 'missing')
        //         hasError = true
        //     }
        // }

        if (hasError) {
            setSubmitting(false)
            return
        }

        createPinGQL({ variables: {
            label: formValue.label,
            top_left_x: formValue.top_left_x,
            top_left_y: formValue.top_left_y,
            bottom_right_x: formValue.bottom_right_x,
            bottom_right_y: formValue.bottom_right_y,
            image_upload: formValue.imageUpload.upload,
        }})
    }

    const onUpdateHandler = () => {
        editPinGQL({ variables: {
            id: pin.id,
            label: formValue.label,
            top_left_x: formValue.top_left_x,
            top_left_y: formValue.top_left_y,
            bottom_right_x: formValue.bottom_right_x,
            bottom_right_y: formValue.bottom_right_y,
            image_upload: formValue.imageUpload? formValue.imageUpload.upload : null,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={pin?.label ? `Updating ${pin.label}` : 'Creating Pin'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={pin?.id ? 'Update' : 'Create'}
                loading={submitting}
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
                            <Grid item xs={12}>
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
                            <Grid item xs={12}>
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
                                        <FormHelperText htmlFor={'upload-image-button'} error={error.imageUpload}>
                                            {imageUploadMessage}
                                        </FormHelperText>
                                    </FormControl>
                                </label>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper variant='outlined' sx={{ p: 2 }}>
                        <Typography variant='subtitle1' sx={{ mb: 1.5, fontWeight: 700 }}>
                            Map Coordinates
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='top left x'
                                    value={formValue.top_left_x}
                                    onChange={(e) => onNumberChangeHandler('top_left_x', e.target.value)}
                                    error={!!error.top_left_x}
                                    helperText={error.top_left_x}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='top left y'
                                    value={formValue.top_left_y}
                                    onChange={(e) => onNumberChangeHandler('top_left_y', e.target.value)}
                                    error={!!error.top_left_y}
                                    helperText={error.top_left_y}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='bottom right x'
                                    value={formValue.bottom_right_x}
                                    onChange={(e) => onNumberChangeHandler('bottom_right_x', e.target.value)}
                                    error={!!error.bottom_right_x}
                                    helperText={error.bottom_right_x}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    sx={fieldSx}
                                    required
                                    label='bottom right y'
                                    value={formValue.bottom_right_y}
                                    onChange={(e) => onNumberChangeHandler('bottom_right_y', e.target.value)}
                                    error={!!error.bottom_right_y}
                                    helperText={error.bottom_right_y}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper variant='outlined' sx={{ p: 2 }}>
                        <Typography variant='subtitle1' sx={{ mb: 1.5, fontWeight: 700 }}>
                            Preview
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Stack spacing={0.75} sx={fieldSx}>
                                    <Selectable
                                        label='type'
                                        value={selectedTypeId}
                                        onValueChange={onPreviewTypeChangeHandler}
                                        noDefault={false}
                                        defaultSelectValue=''
                                        defaultSelectText='Select marker type'
                                        errorMessage={error.preview}
                                        list={typeList}
                                        valueKey={'id'}
                                        textKey={'label'}
                                    />
                                    <Typography variant='caption' color='text.secondary'>
                                        {previewMessage || 'Select a marker type to preview overlay on the pin image.'}
                                    </Typography>
                                </Stack>
                            </Grid>
                            { canPreview && (
                                <Grid item xs={12}>
                                    <Button
                                        variant='outlined'
                                        onClick={onPreviewGenerate}
                                        sx={{ minHeight: 44 }}
                                    >
                                        Generate Preview
                                    </Button>
                                </Grid>
                            )}
                            { previewURL && (
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            ...fieldSx,
                                            height: 190,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            bgcolor: '#f8fbff',
                                            p: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <img
                                            src={previewURL}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                width: 'auto',
                                                height: 'auto',
                                                objectFit: 'contain',
                                                display: 'block',
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    { pin && (
                        <Paper variant='outlined' sx={{ p: 2 }}>
                            <Typography variant='subtitle2' color='text.secondary'>
                                Created By {pin.created_by.username} at {dayjs.utc(pin.created_at).format('YYYY-MM-DD HH:mm')}
                            </Typography>
                            <Typography variant='subtitle2' color='text.secondary'>
                                Updated By {pin.updated_by.username} at {dayjs.utc(pin.updated_at).format('YYYY-MM-DD HH:mm')}
                            </Typography>
                        </Paper>
                    )}
                </Stack>
            </BaseForm>
        </>
    )
}

export default PinForm
