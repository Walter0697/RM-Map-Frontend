import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
} from '@mui/material'

import useObject from '../../hooks/useObject'

import BaseForm from './BaseForm'
import NullableDatePicker from '../field/NullableDatePicker'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

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
        selected_time: null,
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
        setFormValue('selected_time', dayjs.utc(schedule.selected_date).format('MM/DD/YYYY HH:mm'))

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
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        Marker Name: <span 
                            style={{ fontWeight: 'bold' }}>
                            {schedule?.marker?.label}
                        </span>
                    </Grid>
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
                            label='description'
                            value={formValue.description}
                            onChange={(e) => onValueChangeHandler('description', e.target.value)}
                            error={!!error.description}
                            helperText={error.description}
                        />
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(ScheduleEditForm)