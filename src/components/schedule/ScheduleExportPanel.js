import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import {
    Alert,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import IosShareIcon from '@mui/icons-material/IosShare'
import DownloadIcon from '@mui/icons-material/Download'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

import backend from '../../constant/backend'
import CircleIconButton from '../field/CircleIconButton'
import ScheduleShareView from './ScheduleShareView'

dayjs.extend(dayjsPluginUTC)

const exportFormats = [
    { id: 'text', label: 'Text' },
    { id: 'image', label: 'Image' },
    { id: 'notion', label: 'Notion' },
]

const isOfflineExportEnabled = () => {
    const rawValue = `${process.env.REACT_APP_OFFLINE_EXPORT_ENABLED || 'true'}`.trim().toLowerCase()
    return ![ '0', 'false', 'no', 'off' ].includes(rawValue)
}

const getAllowedFormatSet = () => {
    if (!isOfflineExportEnabled()) return new Set()
    const rawValue = `${process.env.REACT_APP_OFFLINE_EXPORT_FORMATS || 'text,image,notion'}`.trim()
    const values = rawValue
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter((item) => [ 'text', 'image', 'notion' ].includes(item))
    return new Set(values.length > 0 ? values : [ 'text', 'image', 'notion' ])
}

const formatStatusColor = (status) => {
    switch (`${status || ''}`.trim().toLowerCase()) {
    case 'succeeded':
        return 'success'
    case 'failed':
        return 'error'
    case 'processing':
        return 'warning'
    case 'queued':
        return 'info'
    default:
        return 'default'
    }
}

const toDateInputValue = (date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
}

const toRFC3339Window = (value, endOfDay = false) => {
    if (!value) return ''
    if (endOfDay) {
        return `${value}T23:59:59Z`
    }
    return `${value}T00:00:00Z`
}

function ScheduleExportPanel({ jwt, schedules }) {
    const offlineExportEnabled = isOfflineExportEnabled()
    const allowedFormatSet = getAllowedFormatSet()
    const visibleExportFormats = exportFormats.filter((item) => allowedFormatSet.has(item.id))

    if (!offlineExportEnabled || visibleExportFormats.length === 0) {
        return null
    }

    const [ open, setOpen ] = useState(false)
    const [ selectedFormats, setSelectedFormats ] = useState({
        text: allowedFormatSet.has('text'),
        image: allowedFormatSet.has('image'),
        notion: allowedFormatSet.has('notion'),
    })
    const [ scheduleFrom, setScheduleFrom ] = useState(() => toDateInputValue(new Date()))
    const [ scheduleTo, setScheduleTo ] = useState(() => {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        return toDateInputValue(nextWeek)
    })
    const [ createLoading, setCreateLoading ] = useState(false)
    const [ statusLoading, setStatusLoading ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ successMessage, setSuccessMessage ] = useState('')
    const [ exportJob, setExportJob ] = useState(null)
    const [ shareLoadingFormat, setShareLoadingFormat ] = useState('')
    const [ downloadLoadingFormat, setDownloadLoadingFormat ] = useState('')
    const [ localImageRequested, setLocalImageRequested ] = useState(false)
    const [ sharePreviewOpen, setSharePreviewOpen ] = useState(false)

    useEffect(() => {
        if (!exportJob) return undefined
        const status = `${exportJob.status || ''}`.trim().toLowerCase()
        if (status === 'succeeded' || status === 'failed' || status === 'partial_success') {
            return undefined
        }

        const timer = window.setInterval(async () => {
            setStatusLoading(true)
            try {
                const response = await fetch(backend.withBasePath(`exports/${exportJob.job_id}`), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!response.ok) {
                    throw new Error('Failed to refresh export status')
                }
                const payload = await response.json()
                setExportJob(payload?.job || null)
            } catch (error) {
                setErrorMessage(error.message || 'Failed to refresh export status')
            } finally {
                setStatusLoading(false)
            }
        }, 2000)

        return () => window.clearInterval(timer)
    }, [exportJob, jwt])

    const selectedFormatIDs = visibleExportFormats
        .filter((item) => selectedFormats[item.id])
        .map((item) => item.id)

    const imagePreviewSchedules = useMemo(() => {
        if (!Array.isArray(schedules) || schedules.length === 0) return []
        const start = scheduleFrom ? dayjs.utc(`${scheduleFrom}T00:00:00Z`) : null
        const end = scheduleTo ? dayjs.utc(`${scheduleTo}T23:59:59Z`) : null

        return [...schedules]
            .filter((item) => {
                if (!item?.selected_date) return false
                const value = dayjs.utc(item.selected_date)
                if (start && value.isBefore(start)) return false
                if (end && value.isAfter(end)) return false
                return true
            })
            .sort((a, b) => dayjs.utc(a.selected_date).valueOf() - dayjs.utc(b.selected_date).valueOf())
    }, [schedules, scheduleFrom, scheduleTo])

    const backendArtifacts = Array.isArray(exportJob?.artifacts)
        ? exportJob.artifacts.filter((artifact) => artifact.format !== 'image')
        : []

    const displayArtifacts = [
        ...backendArtifacts,
        ...(localImageRequested ? [{
            format: 'image',
            status: imagePreviewSchedules.length > 0 ? 'ready' : 'failed',
            source: 'local',
        }] : []),
    ]

    const toggleFormat = (formatID) => {
        setSelectedFormats((current) => ({
            ...current,
            [formatID]: !current[formatID],
        }))
    }

    const createExport = async () => {
        if (!jwt) {
            setErrorMessage('Login required')
            return
        }
        if (selectedFormatIDs.length === 0) {
            setErrorMessage('Select at least one export format')
            return
        }

        const wantsImagePreview = selectedFormatIDs.includes('image')
        const backendFormatIDs = selectedFormatIDs.filter((formatID) => formatID !== 'image')

        if (wantsImagePreview && imagePreviewSchedules.length === 0) {
            setErrorMessage('No schedules found in the selected window for image export')
            return
        }

        setCreateLoading(true)
        setErrorMessage('')
        setSuccessMessage('')
        setLocalImageRequested(wantsImagePreview)

        if (backendFormatIDs.length === 0) {
            setExportJob(null)
            setSuccessMessage('Schedule image preview is ready. Open Preview to share or download it.')
            setCreateLoading(false)
            return
        }
        try {
            const response = await fetch(backend.withBasePath('exports'), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formats: backendFormatIDs,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                    schedule_from: toRFC3339Window(scheduleFrom, false),
                    schedule_to: toRFC3339Window(scheduleTo, true),
                }),
            })
            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to create export')
            }
            const payload = await response.json()
            setExportJob(payload?.job || null)
            setSuccessMessage(wantsImagePreview
                ? 'Text and Notion exports are processing. Image preview is ready now.'
                : 'Export requested. Status will update automatically.')
        } catch (error) {
            setErrorMessage(error.message || 'Failed to create export')
        } finally {
            setCreateLoading(false)
        }
    }

    const downloadArtifact = async (formatID, shouldShare = false) => {
        if (!exportJob?.job_id) return

        if (shouldShare) {
            setShareLoadingFormat(formatID)
        } else {
            setDownloadLoadingFormat(formatID)
        }
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath(`exports/${exportJob.job_id}/artifacts/${formatID}`), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to download artifact')
            }
            const blob = await response.blob()
            const objectURL = window.URL.createObjectURL(blob)
            const disposition = response.headers.get('Content-Disposition') || ''
            const fileNameMatch = disposition.match(/filename="([^"]+)"/)
            const fileName = fileNameMatch?.[1] || `${formatID}-export`

            if (shouldShare && navigator.share && window.File) {
                const file = new window.File([blob], fileName, { type: blob.type || 'application/octet-stream' })
                if (!navigator.canShare || navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Offline export',
                    })
                    window.URL.revokeObjectURL(objectURL)
                    return
                }
            }

            const anchor = document.createElement('a')
            anchor.href = objectURL
            anchor.download = fileName
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            window.URL.revokeObjectURL(objectURL)
        } catch (error) {
            setErrorMessage(error.message || 'Failed to download artifact')
        } finally {
            setShareLoadingFormat('')
            setDownloadLoadingFormat('')
        }
    }

        return (
        <>
            <div style={{
                padding: '8px 12px 4px 12px',
                display: 'flex',
                justifyContent: 'flex-end',
            }}>
                <CircleIconButton
                    onClickHandler={() => setOpen(true)}
                    ariaLabel='Open export'
                    background='#48acdb'
                >
                    <FileDownloadIcon sx={{ color: '#455295' }} />
                </CircleIconButton>
            </div>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
                <DialogTitle>Offline Export</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
                        {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}
                        <Typography variant='body2' color='text.secondary'>
                            Choose the formats and schedule window to generate offline artifacts from your current relation.
                        </Typography>
                        <Stack direction='row' spacing={1} flexWrap='wrap'>
                            {visibleExportFormats.map((format) => (
                                <FormControlLabel
                                    key={format.id}
                                    control={(
                                        <Checkbox
                                            checked={selectedFormats[format.id]}
                                            onChange={() => toggleFormat(format.id)}
                                        />
                                    )}
                                    label={format.label}
                                />
                            ))}
                        </Stack>
                        <Stack direction='row' spacing={2}>
                            <TextField
                                label='From'
                                type='date'
                                value={scheduleFrom}
                                onChange={(event) => setScheduleFrom(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label='To'
                                type='date'
                                value={scheduleTo}
                                onChange={(event) => setScheduleTo(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Stack>
                        {(exportJob || localImageRequested) ? (
                            <Stack spacing={1.5} sx={{ borderTop: '1px solid #e6ebf0', pt: 2 }}>
                                {exportJob ? (
                                    <>
                                        <Typography variant='subtitle2'>
                                            Job `{exportJob.job_id}`
                                        </Typography>
                                        <Stack direction='row' spacing={1} alignItems='center'>
                                            <Chip label={exportJob.status} color={formatStatusColor(exportJob.status)} size='small' />
                                            {statusLoading ? <CircularProgress size={16} /> : null}
                                        </Stack>
                                    </>
                                ) : (
                                    <Typography variant='subtitle2'>
                                        Local image preview ready
                                    </Typography>
                                )}
                                {exportJob?.snapshot ? (
                                    <Typography variant='body2' color='text.secondary'>
                                        Generated: {exportJob.snapshot.generated_at || exportJob.created_at} | Timezone: {exportJob.snapshot.timezone || 'UTC'}
                                    </Typography>
                                ) : null}
                                {displayArtifacts.map((artifact) => (
                                    <Stack key={artifact.format} direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
                                        <Stack direction='row' spacing={1} alignItems='center'>
                                            <Typography variant='body2' sx={{ minWidth: 62 }}>
                                                {artifact.format}
                                            </Typography>
                                            <Chip label={artifact.status} color={formatStatusColor(artifact.status)} size='small' />
                                        </Stack>
                                        <Stack direction='row' spacing={1}>
                                            {artifact.source === 'local' ? (
                                                <Button
                                                    size='small'
                                                    startIcon={<IosShareIcon />}
                                                    disabled={artifact.status !== 'ready'}
                                                    onClick={() => setSharePreviewOpen(true)}
                                                >
                                                    Preview
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        size='small'
                                                        startIcon={<DownloadIcon />}
                                                        disabled={artifact.status !== 'succeeded' || downloadLoadingFormat === artifact.format}
                                                        onClick={() => downloadArtifact(artifact.format, false)}
                                                    >
                                                        Download
                                                    </Button>
                                                    <Button
                                                        size='small'
                                                        startIcon={<IosShareIcon />}
                                                        disabled={artifact.status !== 'succeeded' || shareLoadingFormat === artifact.format}
                                                        onClick={() => downloadArtifact(artifact.format, true)}
                                                    >
                                                        Share
                                                    </Button>
                                                </>
                                            )}
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                    <Button
                        variant='contained'
                        onClick={createExport}
                        disabled={createLoading}
                    >
                        {createLoading ? 'Creating...' : 'Create Export'}
                    </Button>
                </DialogActions>
            </Dialog>
            <ScheduleShareView
                open={sharePreviewOpen}
                handleClose={() => setSharePreviewOpen(false)}
                schedules={imagePreviewSchedules}
                scheduleFrom={scheduleFrom}
                scheduleTo={scheduleTo}
            />
        </>
    )
}

export default connect((state) => ({
    eventtypes: state.marker.eventtypes,
}))(ScheduleExportPanel)
