import React, { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@apollo/client'
import {
    Alert,
    Box,
    Button,
    Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Grid from '@mui/material/GridLegacy'
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
    const normalizePinID = (value) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : -1
    }

    const [ updatePreferredPinGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.users.update_pin, { errorPolicy: 'all' })

    const [ pinList, setPinList ] = useState([])
    const [ groupedPins, setGroupedPins ] = useState([])
    const [ selectedPinId, setPinId ] = useState(-1)
    const [ selectedGroupKey, setSelectedGroupKey ] = useState('')
    const [ pinLoading, setPinLoading ] = useState(false)
    const [ pinError, setPinError ] = useState('')

    const confirmLoading = useMemo(() => {
        if (selectedPinId === -1) return true
        if (pinLoading) return true
        if (updateLoading) return true
        return false
    }, [ selectedPinId, pinLoading, updateLoading ])

    useEffect(() => {
        setPinId(normalizePinID(pinInfo?.pin_id))
        setSelectedGroupKey('')
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
        if (selectedPinId <= 0) return 
        updatePreferredPinGQL({ variables: { 
            label: pinInfo.label,
            pin_id: selectedPinId,
        }})
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

    const selectedGroup = useMemo(
        () => groupOptions.find((group) => group.key === selectedGroupKey) || null,
        [groupOptions, selectedGroupKey],
    )
    const displayedPins = selectedGroup?.pins || []

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
                    {!selectedGroup ? (
                        <Grid item xs={12} sx={{ animation: 'fadeInPanel 220ms ease-in-out', '@keyframes fadeInPanel': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                                Groups
                            </Typography>
                            <Grid container spacing={1.5}>
                                {groupOptions.map((group) => {
                                    const previewPin = pickPreviewPin(group.key, group.pins)
                                    return (
                                        <Grid item xs={12} md={6} key={group.key}>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    padding: '10px',
                                                    border: '1px solid #8a8a8a',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setSelectedGroupKey(group.key)}
                                            >
                                                {previewPin ? (
                                                    <img
                                                        width='52'
                                                        src={backend.IMAGE_LINK + previewPin.display_path}
                                                        alt={group.label}
                                                        style={{
                                                            height: '52px',
                                                            objectFit: 'contain',
                                                        }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'text.secondary' }}>
                                                        -
                                                    </Box>
                                                )}
                                                <Box>
                                                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                                                        {group.label}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary'>
                                                        {group.pins.length} pins
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ marginLeft: 'auto', color: '#6e6e6e' }}>
                                                    <ChevronRightIcon fontSize='small' />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid item xs={12} sx={{ animation: 'fadeInPanel 220ms ease-in-out', '@keyframes fadeInPanel': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Button size='small' variant='outlined' startIcon={<ArrowBackIcon fontSize='small' />} onClick={() => setSelectedGroupKey('')}>
                                    Back
                                </Button>
                                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                                    {selectedGroup.label}
                                </Typography>
                            </Box>
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
                                            onClick={() => setPinId(Number(item.id))}
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
                    )}
                </Grid>
            </BaseForm>
        </>
    )
}

export default PreferredPinForm
