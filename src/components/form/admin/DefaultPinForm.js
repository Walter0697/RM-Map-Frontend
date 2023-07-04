import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
} from '@mui/material'

import BaseForm from '../BaseForm'

import graphql from '../../../graphql'
import constants from '../../../constant'

function DefaultPinForm({
    open,
    handleClose,
    onUpdated,
    pinList,
    defaultPin,
}) {
    // graphql request
    const [ updateDefaultPinGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.defaults.update_pin, { errorPolicy: 'all' })

    const [ selectedPin, setSelected ] = useState(defaultPin?.pin?.id ?? -1)
    
    const [ submitting, setSubmitting ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        setSubmitting(false)
        setSelected(defaultPin?.pin?.id ?? -1)
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

        if (selectedPin === -1) return

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
                title={`Setting ${defaultPin?.label}`}
                maxWidth={'lg'}
                handleSubmit={onUpdateHandler}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={submitting}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Grid container spacing={2}>
                    {
                        pinList.map(( item, index ) => (
                            <Grid 
                                item xs={6} md={6} lg={6}
                                key={index}
                                style={{
                                    marginBottom: '15px',
                                    borderRadius: '5px',
                                    paddingLeft: '5px',
                                    paddingRight: '5px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#dbfdff',
                                        padding: '5px',
                                        border: (selectedPin === item.id) ? '3px solid red' : '3px solid black',
                                    }}
                                    onClick={() => setSelected(item.id)}
                                >
                                    {item.label}  
                                    <img
                                        width='100%'
                                        src={constants.BackendImageLink + item.display_path}
                                    />  
                                </div>
                            </Grid>
                        ))
                    }
                </Grid>
            </BaseForm>
        </>
    )
}

export default DefaultPinForm