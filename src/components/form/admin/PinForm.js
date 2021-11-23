import React, { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    FormHelperText,
} from '@mui/material'

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

    const canPreview = useMemo(() => {
        if (!formValue.imageUpload) return false
        if (!selectedTypeId) return false
        return true
    }, [ formValue, selectedTypeId ])

    const previewMessage = useMemo(() => {
        if (!formValue.imageUpload) return 'cannot preview, no image uploaded'
        if (!selectedTypeId) return 'cannot preview, marker type not selected'
        // if (formValue.top_left_x >= formValue.bottom_right_x) return 'x value invalid'
        // if (formValue.top_left_y >= formValue.bottom_right_y) return 'y value invalid'
        return ''
    }, [ formValue, selectedTypeId ])

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
            setPreview(process.env.REACT_APP_IMAGE_LINK + previewData.previewPin)
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

    const onPreviewGenerate = () => {
        if (!canPreview) return
        previewPinGQL({ variables: {
            top_left_x: formValue.top_left_x,
            top_left_y: formValue.top_left_y,
            bottom_right_x: formValue.bottom_right_x,
            bottom_right_y: formValue.bottom_right_y,
            image_upload: formValue.imageUpload.upload,
            type_id: selectedTypeId,
        }})
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
                                <FormHelperText htmlFor={'upload-image-button'} error={error.imageUpload}>
                                    {imageUploadMessage}
                                </FormHelperText>
                            </FormControl>
                        </label>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <InputLabel>Top Left Corner</InputLabel>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <FormControl variant='outlined' fullWidth>
                            <Grid container fullWidth>
                                <Grid item xs={6} md={6} lg={6}>
                                    <TextField
                                        variant='outlined'
                                        fullWidth
                                        required
                                        label='x'
                                        value={formValue.top_left_x}
                                        onChange={(e) => onNumberChangeHandler('top_left_x', e.target.value)}
                                        error={!!error.top_left_x}
                                        helperText={error.top_left_x}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} lg={6}>
                                    <TextField
                                        variant='outlined'
                                        fullWidth
                                        required
                                        label='y'
                                        value={formValue.top_left_y}
                                        onChange={(e) => onNumberChangeHandler('top_left_y', e.target.value)}
                                        error={!!error.top_left_y}
                                        helperText={error.top_left_y}
                                    />
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <InputLabel>Bottom Right Corner</InputLabel>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <FormControl variant='outlined' fullWidth>
                            <Grid container fullWidth>
                                <Grid item xs={6} md={6} lg={6}>
                                    <TextField
                                        variant='outlined'
                                        fullWidth
                                        required
                                        label='x'
                                        value={formValue.bottom_right_x}
                                        onChange={(e) => onNumberChangeHandler('bottom_right_x', e.target.value)}
                                        error={!!error.bottom_right_x}
                                        helperText={error.bottom_right_x}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} lg={6}>
                                    <TextField
                                        variant='outlined'
                                        fullWidth
                                        required
                                        label='y'
                                        value={formValue.bottom_right_y}
                                        onChange={(e) => onNumberChangeHandler('bottom_right_y', e.target.value)}
                                        error={!!error.bottom_right_y}
                                        helperText={error.bottom_right_y}
                                    />
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <InputLabel>Preview</InputLabel>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='type'
                            value={selectedTypeId}
                            onValueChange={onPreviewTypeChangeHandler}
                            noDefault
                            errorMessage={error.preview}
                            list={typeList}
                            valueKey={'id'}
                            textKey={'label'}
                        />
                    </Grid>
                    { previewMessage && (
                        <Grid item xs={12} md={12} lg={12}>
                            <InputLabel>{previewMessage}</InputLabel>
                        </Grid>
                    )}
                    { canPreview && (
                        <Grid item xs={12} md={12} lg={12}>
                            <InputLabel onClick={onPreviewGenerate}>Click here to preview</InputLabel>
                        </Grid>
                    )}
                    { previewURL && (
                        <Grid item xs={12} md={12} lg={12} fullWidth>
                            <img 
                                src={previewURL}
                                style={{
                                    width: '100%',
                                }}
                            />
                        </Grid>
                    )}
                    { pin && (
                        <Grid item xs={12} md={6} lg={6}
                            style={{
                                fontSize: '10px',
                                color: 'grey',
                            }}
                        >
                            <span style={{ display: 'block' }}>Created By {pin.created_by.username} at {dayjs.utc(pin.created_at).format('YYYY-MM-DD HH:mm')}</span>
                            <span style={{ display: 'block' }}>Updated By {pin.updated_by.username} at {dayjs.utc(pin.updated_at).format('YYYY-MM-DD HH:mm')}</span>
                        </Grid>
                    )}
                </Grid>
            </BaseForm>
        </>
    )
}

export default PinForm