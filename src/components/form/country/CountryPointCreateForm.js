import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

import graphql from '../../../graphql'

function CountryPointCreateform({
    open,
    handleClose,
    position,
    mapName,
    onCreated,
    dispatch,
}) {
    const [ createCountryPointGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.countries.createCountryPoint, { errorPolicy: 'all' })

    const [ label, setLabel ] = useState('')
    const [ error, setError ] = useState('')

    const [ submitting, setSubmitting ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            console.log(createData)
            onCreated && onCreated()
            
        }
    }, [createData, createError])

    const onSubmitHandler = () => {
        if (!label) {
            setError('Label is required')
            return
        }

        createCountryPointGQL({ variables: {
            label: label,
            map_name: mapName,
            photo_x: position.x,
            photo_y: position.y,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title="Create Country Point"
                alertMessage={alertMessage}
                loading={submitting}
                cancelText={'Cancel'}
                createText={'Create'}
                handleSubmit={onSubmitHandler}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            required
                            label='label'
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            error={!!error}
                            helperText={error}
                        />
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(CountryPointCreateform)