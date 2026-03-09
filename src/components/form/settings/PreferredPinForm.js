import React, { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@apollo/client' 
import {
    Alert,
    Box,
    Grid,
    Typography,
} from '@mui/material'
import backend from '../../../constant/backend'

import BaseForm from '../BaseForm'

import graphql from '../../../graphql'

function PreferredPinForm({
    open,
    pinInfo,
    handleClose,
    onCreated,
    jwt,
}) {
    // graphql request
    const [ updatePreferredPinGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.users.update_pin, { errorPolicy: 'all' })
    
    const [ pinList, setPinList ] = useState([])
    const [ groupedPins, setGroupedPins ] = useState([])
    const [ selectedPinId, setPinId ] = useState(-1)
    const [ pinLoading, setPinLoading ] = useState(false)
    const [ pinError, setPinError ] = useState('')

    const confirmLoading = useMemo(() => {
        if (selectedPinId === -1) return true
        if (pinLoading) return true
        if (updateLoading) return true
        return false
    }, [ selectedPinId, pinLoading, updateLoading ])

    useEffect(() => {
        setPinId(pinInfo?.pin_id ?? -1)
    }, [pinInfo, open])

    useEffect(() => {
        const loadPins = async () => {
            if (!jwt || !open) return
            setPinLoading(true)
            setPinError('')
            try {
                const response = await fetch(backend.withBasePath('settings/pins'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!response.ok) {
                    const text = await response.text()
                    setPinError(text || `Failed to load pin options (${response.status})`)
                    return
                }
                const data = await response.json()
                setPinList(Array.isArray(data?.pins) ? data.pins : [])
                setGroupedPins(Array.isArray(data?.groups) ? data.groups : [])
            } catch (error) {
                setPinError(error.message || 'Failed to load pin options')
            } finally {
                setPinLoading(false)
            }
        }
        loadPins()
    }, [jwt, open])

    useEffect(() => {
        if (updateData) {
            onCreated && onCreated(updateData)
        }

    }, [updateData, updateError])

    const onSubmitHandler = () => {
        if (selectedPinId === -1) return 
        updatePreferredPinGQL({ variables: { 
            label: pinInfo.label,
            pin_id: selectedPinId,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={pinInfo ? `Editing ${pinInfo.name}` : 'Editing'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={confirmLoading}
            >
                {pinError ? (
                    <Alert severity='error' sx={{ mb: 1.5 }}>
                        {pinError}
                    </Alert>
                ) : null}
                <Grid container spacing={2}>
                    {(groupedPins.length ? groupedPins : [ { group_name: 'Ungrouped', pins: pinList } ]).map((section, sectionIndex) => (
                        <Grid item xs={12} key={`${section.group_name}-${sectionIndex}`}>
                            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                                {section.group_name || 'Ungrouped'}
                            </Typography>
                            <Grid container spacing={2}>
                                {(section.pins || []).map(( item, index ) => (
                                    <Grid 
                                        item xs={6} md={4} lg={3}
                                        key={`${section.group_name}-${index}-${item.id}`}
                                        style={{
                                            marginBottom: '15px',
                                            borderRadius: '5px',
                                            paddingLeft: '5px',
                                            paddingRight: '5px',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                backgroundColor: '#dbfdff',
                                                padding: '5px',
                                                border: (selectedPinId === item.id) ? '3px solid red' : '3px solid black',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setPinId(item.id)}
                                        >
                                            {item.label}  
                                            <img
                                                width='100%'
                                                src={backend.IMAGE_LINK + item.display_path}
                                            />  
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </BaseForm>
        </>
    )
}

export default PreferredPinForm
