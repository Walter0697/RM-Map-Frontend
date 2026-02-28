import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material'
import backend from '../../../constant/backend'

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
                displayMode='panel'
            >
                <Stack spacing={1.5}>
                    <Typography variant='body2' color='text.secondary'>
                        Select one pin as the default value for this slot.
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: 1.25,
                        }}
                    >
                        {pinList.map((item, index) => (
                            <Box key={index}>
                                <Card
                                    variant='outlined'
                                    onClick={() => setSelected(item.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        borderWidth: 2,
                                        borderColor: selectedPin === item.id ? 'primary.main' : 'divider',
                                        height: 190,
                                        display: 'flex',
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            p: 1.25,
                                            '&:last-child': { pb: 1.25 },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            width: '100%',
                                        }}
                                    >
                                        <Typography
                                            variant='subtitle2'
                                            sx={{
                                                mb: 1,
                                                minHeight: 34,
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: 13,
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Stack
                                            sx={{
                                                flex: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                bgcolor: '#f8fbff',
                                                p: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <img
                                                src={backend.IMAGE_LINK + item.display_path}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    width: 'auto',
                                                    height: 'auto',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                }}
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Stack>
            </BaseForm>
        </>
    )
}

export default DefaultPinForm
