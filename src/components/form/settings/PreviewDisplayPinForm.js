import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Typography } from '@mui/material'
import Grid from '@mui/material/GridLegacy'

import backend from '../../../constant/backend'
import BaseForm from '../BaseForm'

function PreviewDisplayPinForm({
    open,
    handleClose,
    jwt,
    currentPinId,
    onUpdated,
}) {
    const normalizePinID = (value) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : -1
    }

    const [ pinList, setPinList ] = useState([])
    const [ groupedPins, setGroupedPins ] = useState([])
    const [ selectedPinId, setSelectedPinId ] = useState(-1)
    const [ selectedGroupKey, setSelectedGroupKey ] = useState('all')
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
        setSelectedPinId(normalizePinID(currentPinId))
        setSelectedGroupKey('all')
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

    const allPins = useMemo(() => (Array.isArray(pinList) ? pinList : []), [pinList])
    const ungroupedSection = useMemo(
        () => groupedPins.find((section) => (section.group_name || '').toLowerCase() === 'ungrouped'),
        [groupedPins],
    )
    const groupedOnly = useMemo(
        () => groupedPins.filter((section) => (section.group_name || '').toLowerCase() !== 'ungrouped'),
        [groupedPins],
    )

    const pickPreviewPin = (groupKey, pins) => {
        if (!Array.isArray(pins) || pins.length === 0) return null
        let hash = 0
        for (let i = 0; i < groupKey.length; i += 1) {
            hash = ((hash << 5) - hash) + groupKey.charCodeAt(i)
            hash |= 0
        }
        const index = Math.abs(hash) % pins.length
        return pins[index]
    }

    const groupOptions = useMemo(() => {
        const options = [
            { key: 'all', label: 'All', pins: allPins },
            ...groupedOnly.map((section, index) => ({
                key: `group-${section.group_id ?? section.group_name ?? index}`,
                label: section.group_name || `Group ${index + 1}`,
                pins: Array.isArray(section.pins) ? section.pins : [],
            })),
            { key: 'ungrouped', label: 'Ungrouped', pins: Array.isArray(ungroupedSection?.pins) ? ungroupedSection.pins : [] },
        ]
        return options
    }, [allPins, groupedOnly, ungroupedSection])

    const displayedPins = useMemo(() => {
        const selectedGroup = groupOptions.find((group) => group.key === selectedGroupKey)
        return selectedGroup?.pins || []
    }, [groupOptions, selectedGroupKey])

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
                <Grid item xs={12}>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                        Groups
                    </Typography>
                    <Grid container spacing={2}>
                        {groupOptions.map((group) => {
                            const previewPin = pickPreviewPin(group.key, group.pins)
                            return (
                                <Grid item xs={4} md={3} lg={2} key={group.key}>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            backgroundColor: selectedGroupKey === group.key ? '#f7f9fc' : '#fff',
                                            padding: '6px',
                                            border: selectedGroupKey === group.key ? '2px dashed #1976d2' : '1px solid #8a8a8a',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setSelectedGroupKey(group.key)}
                                    >
                                        <Box
                                            sx={{
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                mb: '4px',
                                            }}
                                        >
                                            {group.label}
                                        </Box>
                                        {previewPin ? (
                                            <img
                                                width='100%'
                                                src={backend.IMAGE_LINK + previewPin.display_path}
                                                alt={group.label}
                                                style={{
                                                    height: '72px',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'text.secondary' }}>
                                                No Pin
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                        Pins
                    </Typography>
                    <Grid container spacing={2}>
                        {displayedPins.map((item, index) => (
                            <Grid
                                item xs={4} md={4} lg={4}
                                key={`${selectedGroupKey}-${index}-${item.id}`}
                                style={{
                                    marginBottom: '8px',
                                    borderRadius: '5px',
                                    paddingLeft: '4px',
                                    paddingRight: '4px',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        backgroundColor: '#fff',
                                        padding: '6px',
                                        border: (selectedPinId === Number(item.id)) ? '2px solid red' : '2px solid black',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedPinId(Number(item.id))}
                                >
                                    <Box
                                        sx={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            mb: '4px',
                                        }}
                                    >
                                        {item.label}
                                    </Box>
                                    <img
                                        width='100%'
                                        src={backend.IMAGE_LINK + item.display_path}
                                        alt={item.label}
                                        style={{
                                            height: '72px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default PreviewDisplayPinForm
