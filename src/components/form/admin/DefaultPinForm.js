import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    FormHelperText,
} from '@mui/material'

import BaseForm from '../BaseForm'

import graphql from '../../../graphql'

function DefaultPinForm({
    open,
    handleClose,
    onUpdated,
    pinList,
    defaultPin,
}) {
    // graphql request
    const [ updateDefaultPinGQL, { data, updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.defaults.update_pin, { errorPolicy: 'all' })

    const [ selectedPin, setSelected ] = useState(defaultPin.id ?? -1)
    
    const [ submitting, setSubmitting ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        setSubmitting(false)
    }, [open])

    useEffect(() => {
        if (updateData) {
            onUpdated && onUpdated()
        }

        if (updateError) {
            setAlertMessage({
                type: 'error',
                message: updateError.message,
            })
            setSubmitting(false)
        }
    }, [updateData, updateError])

    const onUpdateHandler = (e) => {
        e.preventDefault()
        setSubmitting(true)

        updateDefaultPinGQL({ variables: {
            label: defaultPin.label,
            pin_id: selectedPin,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={`Setting ${defaultPin.label}`}
                maxWidth={'lg'}
                handleSubmit={onUpdateHandler}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={submitting}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
            </BaseForm>
        </>
    )
}

export default DefaultPinForm