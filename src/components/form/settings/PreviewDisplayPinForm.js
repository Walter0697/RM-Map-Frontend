import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Grid, Typography } from '@mui/material'

import backend from '../../../constant/backend'
import BaseForm from '../BaseForm'

function PreviewDisplayPinForm({
    open,
    handleClose,
    jwt,
    currentPinId,
    onUpdated,
}) {
    const [ pinList, setPinList ] = useState([])
    const [ groupedPins, setGroupedPins ] = useState([])
    const [ selectedPinId, setSelectedPinId ] = useState(-1)
    const [ pinLoading, setPinLoading ] = useState(false)
    const [ updateLoading, setUpdateLoading ] = useState(false)
    const [ updateError, setUpdateError ] = useState('')

    useEffect(() => {
        const loadPins = async () => {
            if (!jwt || !open) return
            setPinLoading(true)
            setUpdateError('')
            try {
                const response = await fetch(backend.withBasePath('settings/pins'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!response.ok) {
                    const text = await response.text()
                    setUpdateError(text || `Failed to load pin options (${response.status})`)
                    return
                }
                const body = await response.json()
                setPinList(Array.isArray(body?.pins) ? body.pins : [])
                setGroupedPins(Array.isArray(body?.groups) ? body.groups : [])
            } catch (error) {
                setUpdateError(error.message || 'Failed to load pin options')
            } finally {
                setPinLoading(false)
            }
        }
        loadPins()
    }, [jwt, open])

    useEffect(() => {
        setSelectedPinId(currentPinId || -1)
        setUpdateError('')
    }, [currentPinId, open])

    const confirmLoading = useMemo(() => {
        if (pinLoading) return true
        if (updateLoading) return true
        if (selectedPinId <= 0) return true
        return false
    }, [pinLoading, updateLoading, selectedPinId])

    const onSubmitHandler = async () => {
        if (!jwt || selectedPinId <= 0) return

        setUpdateLoading(true)
        setUpdateError('')

        try {
            const response = await fetch(backend.withBasePath('settings/preview-pin'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({ pin_id: selectedPinId }),
            })

            if (!response.ok) {
                const raw = await response.text()
                try {
                    const parsed = JSON.parse(raw)
                    setUpdateError(parsed.message || parsed.error || raw || 'Failed to update preview display pin')
                } catch (e) {
                    setUpdateError(raw || 'Failed to update preview display pin')
                }
                return
            }

            const body = await response.json()
            onUpdated && onUpdated(body)
        } catch (error) {
            setUpdateError(error.message || 'Failed to update preview display pin')
        } finally {
            setUpdateLoading(false)
        }
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Preview Display Pin'}
            maxWidth={'lg'}
            handleSubmit={onSubmitHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={confirmLoading}
        >
            {updateError ? (
                <Alert severity='error' style={{ marginBottom: '12px' }}>
                    {updateError}
                </Alert>
            ) : null}
            <Grid container spacing={2}>
                {(groupedPins.length ? groupedPins : [ { group_name: 'Ungrouped', pins: pinList } ]).map((section, sectionIndex) => (
                    <Grid item xs={12} key={`${section.group_name}-${sectionIndex}`}>
                        <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                            {section.group_name || 'Ungrouped'}
                        </Typography>
                        <Grid container spacing={2}>
                            {(section.pins || []).map((item, index) => (
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
                                        onClick={() => setSelectedPinId(item.id)}
                                    >
                                        {item.label}
                                        <img
                                            width='100%'
                                            src={backend.IMAGE_LINK + item.display_path}
                                            alt={item.label}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </BaseForm>
    )
}

export default PreviewDisplayPinForm
