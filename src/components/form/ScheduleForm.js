import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Stack,
    TextField,
} from '@mui/material'

import useObject from '../../hooks/useObject'

import BaseForm from './BaseForm'
import ScheduleDateTimeSelector from './ScheduleDateTimeSelector'
import ScheduleWeatherPreview from './ScheduleWeatherPreview'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

function ScheduleForm({
    open,
    handleClose,
    onCreated,
    marker,
    dispatch,
}) {
    const [ createScheduleGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.schedules.create, { errorPolicy: 'all' })

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: marker?.label || '',
        description: '',
        selected_time: null,
    })
    const [ error, setError ] = useObject({})

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)
    useEffect(() => {
        if (!marker) return

        setSubmitting(false)
        resetFormValue()
        setUnauthorized(false)
    }, [marker])

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            dispatch(actions.updateMarkerStatus(createData.createSchedule.marker))
            dispatch(actions.addSchedule(createData.createSchedule))
            
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

        if (!formValue.selected_time) {
            setError('selected_time', 'selected time cannot be empty')
            hasError = true
        }

        const markerID = Number(marker?.id ?? marker?.marker_id)
        if (!Number.isInteger(markerID) || markerID <= 0) {
            setError('label', 'selected marker is invalid')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        const selected_time = generic.time.toServerFormat(formValue.selected_time)

        createScheduleGQL({ variables: {
            label: formValue.label,
            description: formValue.description,
            selected_time,
            marker_id: markerID,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Create Schedule'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Create'}
                loading={submitting}
                isSubmitUnauthorized={isUnauthorized}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Stack spacing={2}>
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
                    <ScheduleDateTimeSelector
                        value={formValue.selected_time}
                        onValueChange={(value) => onValueChangeHandler('selected_time', value)}
                        errorMessage={error.selected_time}
                    />
                    <TextField
                        variant='outlined'
                        fullWidth
                        label='description'
                        value={formValue.description}
                        onChange={(e) => onValueChangeHandler('description', e.target.value)}
                        error={!!error.description}
                        helperText={error.description}
                    />
                    <ScheduleWeatherPreview
                        marker={marker}
                        selectedTime={formValue.selected_time}
                    />
                </Stack>
            </BaseForm>
        </>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(ScheduleForm)
