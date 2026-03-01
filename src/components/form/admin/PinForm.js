import React, { useState, useEffect, useMemo } from 'react'
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
import backend from '../../../constant/backend'

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import useObject from '../../../hooks/useObject'

import BaseForm from '../BaseForm'
import PinPlacementCanvas from './PinPlacementCanvas'

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

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        top_left_x: 0,
        top_left_y: 0,
        bottom_right_x: 0,
        bottom_right_y: 0,
        imageUpload: null,
    })
    const [ error, setError ] = useObject({})

    // preview related
    const [ selectedTypeId, setTypeId ] = useState('')
    const [ canvasImageURL, setCanvasImageURL ] = useState('')

    // handling image information
    const [ imageUploadMessage, setImageMessage ] = useState('please upload an image first')

    // handling loading and alert
    const [ submitting, setSubmitting ] = useState(false)
    
    const [ alertMessage, setAlertMessage ] = useState(null)
    const fieldSx = { width: { xs: '100%', md: 300 } }

    const selectedType = useMemo(() => {
        if (!selectedTypeId) return null
        return typeList.find((item) => String(item.id) === String(selectedTypeId)) ?? null
    }, [selectedTypeId, typeList])

    const selectedTypeIconURL = useMemo(() => {
        if (!selectedType?.icon_path) return ''
        if (/^https?:\/\//i.test(selectedType.icon_path)) {
            return selectedType.icon_path
        }
        return `${backend.IMAGE_LINK}${selectedType.icon_path}`
    }, [selectedType])

    useEffect(() => {
        setSubmitting(false)
        setTypeId('')
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
        if (formValue.imageUpload?.upload) {
            const objectURL = URL.createObjectURL(formValue.imageUpload.upload)
            setCanvasImageURL(objectURL)
            return () => URL.revokeObjectURL(objectURL)
        }

        if (pin?.image_path) {
            setCanvasImageURL(backend.IMAGE_LINK + pin.image_path)
            return
        }

        setCanvasImageURL('')
    }, [formValue.imageUpload, pin])

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

    const onCanvasGeometryChange = (nextGeometry) => {
        setFormValue('top_left_x', nextGeometry.top_left_x)
        setFormValue('top_left_y', nextGeometry.top_left_y)
        setFormValue('bottom_right_x', nextGeometry.bottom_right_x)
        setFormValue('bottom_right_y', nextGeometry.bottom_right_y)
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
                            Pin Placement Canvas
                        </Typography>
                        <PinPlacementCanvas
                            imageSrc={canvasImageURL}
                            iconSrc={selectedTypeIconURL}
                            markerTypes={typeList}
                            selectedTypeId={selectedTypeId}
                            onSelectedTypeIdChange={setTypeId}
                            iconSources={typeList.map((type) => {
                                if (!type?.icon_path) return ''
                                if (/^https?:\/\//i.test(type.icon_path)) return type.icon_path
                                return `${backend.IMAGE_LINK}${type.icon_path}`
                            }).filter(Boolean)}
                            geometry={{
                                top_left_x: Number(formValue.top_left_x || 0),
                                top_left_y: Number(formValue.top_left_y || 0),
                                bottom_right_x: Number(formValue.bottom_right_x || 0),
                                bottom_right_y: Number(formValue.bottom_right_y || 0),
                            }}
                            onGeometryChange={onCanvasGeometryChange}
                        />
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
