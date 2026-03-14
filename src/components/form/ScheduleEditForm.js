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
import dayjs from 'dayjs'

function ScheduleEditForm({
    open,
    handleClose,
    onUpdated,
    schedule,
    dispatch,
}) { 

    // graphql request
    const [ editScheduleGQL, { data: editData, loading: editLoading, error: editError } ] = useMutation(graphql.schedules.edit, { errorPolicy: 'all' })

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        description: '',
        selected_time: dayjs().toDate(),
    }) 

    const [ error, setError ] = useObject({})

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)
    useEffect(() => {
        if (!schedule) return 

        setSubmitting(false)
        setUnauthorized(false)

        setFormValue('label', schedule.label)
        setFormValue('description', schedule.description)
        setFormValue('selected_time', schedule.selected_date ? new Date(schedule.selected_date) : null)

    }, [schedule])

    useEffect(() => {
        if (editError) {
            setAlertMessage({
                type: 'error',
                message: editError.message,
            })
            setSubmitting(false)
        }

        if (editData) {
            dispatch(actions.editSchedule(editData.editSchedule))
            
            onUpdated && onUpdated()
        }
    }, [editData, editError])

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

        if (hasError) {
            setSubmitting(false)
            return
        }

        const selected_time = generic.time.toServerFormat(formValue.selected_time)
        
        editScheduleGQL({ variables: {
            id: schedule.id,
            label: formValue.label,
            description: formValue.description,
            selected_time,
        }})

    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Edit'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Update'}
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
                        marker={schedule?.marker}
                        selectedTime={formValue.selected_time}
                    />
                </Stack>
            </BaseForm>
        </>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(ScheduleEditForm)
