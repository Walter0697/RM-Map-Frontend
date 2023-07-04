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

import useObject from '../../hooks/useObject'

import BaseForm from './BaseForm'
import ImageLinkValidate from './image/ImageLinkValidate'
import ImagePreview from './image/ImagePreview'
import Selectable from '../field/Selectable'
import NullableDatePicker from '../field/NullableDatePicker'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

function MovieForm({
    open,
    handleClose,
    onCreated,
    movie,
    markers,
    eventtypes,
    dispatch,
}) {
    const [ createMovieScheduleGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.movies.schedule, { errorPolicy: 'all' })

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        description: '',
        selected_time: null,
        marker_id: null,
        movie_name: '',
        movie_release: '',
        movie_image: false,
    })
    const [ error, setError ] = useObject({})

    const [ selectedType, setSelectedType ] = useState(-1)

    const [ imageFormState , setImageState ] = useState('') // weblink, preview, scrap
    const [ imageSubmitMessage, setImageMessage ] = useState('')

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
        setSubmitting(false)
        resetFormValue()
        setImageMessage('')
        setImageState('')
        setUnauthorized(false)

        if (movie) {
            if (movie.title) {
                setFormValue('label', movie.title)
            }
        }
    }, [movie])

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            if (createData.createMovieSchedule.marker) {
                dispatch(actions.updateMarkerStatus(createData.createMovieSchedule.marker))
            }
            dispatch(actions.addSchedule(createData.createMovieSchedule))
            
            onCreated && onCreated()
        }
    }, [createData, createError])

    const onValueChangeHandler = (field, value) => {
        setFormValue(field, value)
        setError(field, '')
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

        if (!formValue.selected_time) {
            setError('selected_time', 'selected time cannot be empty')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        const selected_time = formValue.selected_time ? generic.time.toServerFormat(formValue.selected_time) : null
        
        createMovieScheduleGQL({ variables: {
            label: formValue.label,
            description: formValue.description,
            selected_time,
            marker_id: formValue.marker_id,
            movie_rid: movie?.ref_id,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Create Movie Schedule'}
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
                        <NullableDatePicker
                            label={'selected time'}
                            required
                            noPast
                            value={formValue.selected_time}
                            onValueChange={(e) => onValueChangeHandler('selected_time', e)}
                            errorMessage={error.selected_time}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            disabled
                            label='movie title'
                            value={movie?.title}
                            error={!!error.movie_name}
                            helperText={error.movie_name}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <FormControl component='image' fullWidth>
                            <FormLabel 
                                component='legend'
                            >
                                Preview
                            </FormLabel>
                            <Grid container spacing={0} fullWidth>
                                <Grid item xs={12} md={12} lg={12}>
                                    <Button 
                                        variant='outlined'
                                        fullWidth
                                        disabled={!movie?.image_link}
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
                        <TextField
                            variant='outlined'
                            fullWidth
                            disabled
                            label='release date'
                            value={movie?.release_date}
                            error={!!error.movie_release}
                            helperText={error.movie_release}
                        />
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
            <ImagePreview
                shouldOpen={imageFormState === 'preview'}
                handleClose={() => setImageState('')}
                imageInfo={{
                    type: 'weblink',
                    value: movie?.image_link,
                }}
            />
        </>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
}))(MovieForm)