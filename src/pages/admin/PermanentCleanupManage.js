import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'
import backend from '../../constant/backend'
import AdminPageShell from '../../components/admin/AdminPageShell'

const listOptions = {
    marker: {
        endpoint: 'admin/cleanup/markers',
        sort: ['updated_at', 'created_at', 'label', 'status', 'type', 'to_time'],
    },
    schedule: {
        endpoint: 'admin/cleanup/schedules',
        sort: ['selected_date', 'updated_at', 'created_at', 'label', 'status'],
    },
}

export const normalizeCleanupSortBy = (entityType, sortBy) => {
    const options = listOptions[entityType] || listOptions.marker
    if (options.sort.includes(sortBy)) {
        return sortBy
    }
    return options.sort[0]
}

function PermanentCleanupManage({ jwt }) {
    const [entityType, setEntityType] = useState('marker')
    const [testingFilter, setTestingFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [sortBy, setSortBy] = useState('updated_at')
    const [order, setOrder] = useState('desc')

    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [accessDenied, setAccessDenied] = useState(false)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteConfirmLabel, setDeleteConfirmLabel] = useState('')

    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
    const [scheduleTarget, setScheduleTarget] = useState(null)
    const [scheduleConfirmLabel, setScheduleConfirmLabel] = useState('')
    const [scheduleReason, setScheduleReason] = useState('')
    const [scheduleExecuteAt, setScheduleExecuteAt] = useState('')
    const [clearDialogOpen, setClearDialogOpen] = useState(false)
    const [clearConfirm, setClearConfirm] = useState('')
    const [clearResult, setClearResult] = useState(null)

    const [alertOpen, triggerAlert] = useBoop(2500)
    const [alertMessage, setAlertMessage] = useState('')

    const currentOptions = useMemo(() => listOptions[entityType], [entityType])

    const parseResponseError = async (resp) => {
        const text = await resp.text()
        if (!text) return `${resp.status} ${resp.statusText}`
        return text
    }

    const listEndpoint = useMemo(() => backend.withBasePath(currentOptions.endpoint), [currentOptions])

    const loadItems = async () => {
        if (!jwt) {
            setErrorMessage('Login required')
            return
        }
        const effectiveSortBy = normalizeCleanupSortBy(entityType, sortBy)

        setLoading(true)
        setErrorMessage('')
        try {
            const params = new URLSearchParams()
            params.set('limit', '50')
            params.set('offset', '0')
            params.set('sort_by', effectiveSortBy)
            params.set('order', order)
            if (search.trim()) params.set('search', search.trim())
            if (status.trim()) params.set('status', status.trim())
            if (testingFilter === 'true' || testingFilter === 'false') {
                params.set('testing', testingFilter)
            }

            const resp = await fetch(`${listEndpoint}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (resp.status === 401 || resp.status === 403) {
                setAccessDenied(true)
                setItems([])
                setTotal(0)
                setErrorMessage(await parseResponseError(resp))
                return
            }
            if (!resp.ok) {
                setErrorMessage(await parseResponseError(resp))
                return
            }

            setAccessDenied(false)
            const payload = await resp.json()
            setItems(Array.isArray(payload.items) ? payload.items : [])
            setTotal(Number(payload.total || 0))
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setSortBy(entityType === 'marker' ? 'updated_at' : 'selected_date')
        setStatus('')
        setSearch('')
        setTestingFilter('all')
        setItems([])
        setTotal(0)
    }, [entityType])

    useEffect(() => {
        loadItems()
    }, [jwt, sortBy, order, testingFilter])

    const openDeleteDialog = (item) => {
        setDeleteTarget(item)
        setDeleteConfirmLabel('')
        setDeleteDialogOpen(true)
    }

    const openScheduleDialog = (item) => {
        const now = new Date(Date.now() + 60 * 60 * 1000)
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

        setScheduleTarget(item)
        setScheduleConfirmLabel('')
        setScheduleReason('')
        setScheduleExecuteAt(localDateTime)
        setScheduleDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
    }

    const closeScheduleDialog = () => {
        setScheduleDialogOpen(false)
        setScheduleTarget(null)
    }

    const openClearDialog = () => {
        setClearConfirm('')
        setClearDialogOpen(true)
    }

    const closeClearDialog = () => {
        setClearDialogOpen(false)
    }

    const canDelete = deleteTarget && deleteConfirmLabel.trim() === deleteTarget.label
    const canSchedule = scheduleTarget
        && scheduleConfirmLabel.trim() === scheduleTarget.label
        && scheduleExecuteAt.trim() !== ''

    const submitDelete = async () => {
        if (!canDelete || !deleteTarget || !jwt) return

        setLoading(true)
        setErrorMessage('')
        try {
            const endpoint = entityType === 'marker'
                ? backend.withBasePath(`admin/cleanup/markers/${deleteTarget.id}`)
                : backend.withBasePath(`admin/cleanup/schedules/${deleteTarget.id}`)

            const resp = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({
                    confirm_id: Number(deleteTarget.id),
                    confirm_label: deleteConfirmLabel.trim(),
                }),
            })
            if (resp.status === 401 || resp.status === 403) {
                setAccessDenied(true)
                setErrorMessage(await parseResponseError(resp))
                return
            }
            if (!resp.ok) {
                setErrorMessage(await parseResponseError(resp))
                return
            }

            setAlertMessage(`${entityType === 'marker' ? 'Marker' : 'Schedule'} ${deleteTarget.id} permanently deleted`)
            triggerAlert()
            closeDeleteDialog()
            await loadItems()
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    const submitSchedule = async () => {
        if (!canSchedule || !scheduleTarget || !jwt) return

        setLoading(true)
        setErrorMessage('')
        try {
            const executeAtIso = new Date(scheduleExecuteAt).toISOString()
            const resp = await fetch(backend.withBasePath('admin/cleanup/jobs'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({
                    entity_type: entityType,
                    target_id: Number(scheduleTarget.id),
                    confirm_id: Number(scheduleTarget.id),
                    confirm_label: scheduleConfirmLabel.trim(),
                    execute_at: executeAtIso,
                    reason: scheduleReason.trim(),
                }),
            })

            if (resp.status === 401 || resp.status === 403) {
                setAccessDenied(true)
                setErrorMessage(await parseResponseError(resp))
                return
            }
            if (!resp.ok) {
                setErrorMessage(await parseResponseError(resp))
                return
            }

            setAlertMessage(`${entityType === 'marker' ? 'Marker' : 'Schedule'} ${scheduleTarget.id} cleanup scheduled`)
            triggerAlert()
            closeScheduleDialog()
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    const submitClearTesting = async () => {
        if (clearConfirm.trim().toLowerCase() !== 'clear testing' || !jwt) return

        setLoading(true)
        setErrorMessage('')
        setClearResult(null)
        try {
            const resp = await fetch(backend.withBasePath('admin/cleanup/testing/clear'), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
            })
            if (resp.status === 401 || resp.status === 403) {
                setAccessDenied(true)
                setErrorMessage(await parseResponseError(resp))
                return
            }
            if (!resp.ok) {
                setErrorMessage(await parseResponseError(resp))
                return
            }

            const payload = await resp.json()
            setClearResult(payload)
            setAlertMessage(`Cleared testing items: ${payload.marker_deleted || 0} marker(s), ${payload.schedule_deleted || 0} schedule(s). API keys were not removed.`)
            triggerAlert()
            closeClearDialog()
            await loadItems()
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    const renderItemMeta = (item) => {
        if (entityType === 'marker') {
            return (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                    <Chip size='small' color={item.testing ? 'warning' : 'default'} label={item.testing ? 'Testing' : 'Production'} />
                    <Chip size='small' label={`Type: ${item.type || '-'}`} />
                    <Chip size='small' label={`Status: ${item.status || '(empty)'}`} />
                    <Chip size='small' label={`Relation: ${item.relation_id || '-'}`} />
                    <Chip size='small' label={`Country: ${item.country_code || '-'}`} />
                </Stack>
            )
        }

        return (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <Chip size='small' color={item.testing ? 'warning' : 'default'} label={item.testing ? 'Testing' : 'Production'} />
                <Chip size='small' label={`Status: ${item.status || '(empty)'}`} />
                <Chip size='small' label={`Relation: ${item.relation_id || '-'}`} />
                <Chip size='small' label={`Marker: ${item.marker_label || '-'}`} />
                <Chip size='small' label={`Selected: ${item.selected_date || '-'}`} />
            </Stack>
        )
    }

    return (
        <AdminPageShell
            title='Permanent Cleanup'
            description='Admin-only permanent deletion and cleanup scheduling for markers and schedules.'
            alertOpen={alertOpen}
            alertMessage={alertMessage}
            actions={(
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button className='admin-action-button' variant='contained' color='warning' onClick={openClearDialog} disabled={loading || accessDenied}>
                        Clear Testing Items
                    </Button>
                    <Button className='admin-action-button' variant='outlined' onClick={loadItems} disabled={loading}>
                        Refresh
                    </Button>
                    <Button className='admin-action-button' variant='contained' onClick={loadItems} disabled={loading}>
                        Search
                    </Button>
                </Stack>
            )}
        >
            <Card className='admin-panel'>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id='cleanup-entity-label'>Entity</InputLabel>
                                <Select
                                    labelId='cleanup-entity-label'
                                    value={entityType}
                                    label='Entity'
                                    onChange={(e) => setEntityType(e.target.value)}
                                >
                                    <MenuItem value='marker'>Marker</MenuItem>
                                    <MenuItem value='schedule'>Schedule</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label='Search keyword'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder='label, description, address'
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                fullWidth
                                label='Status'
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                placeholder='optional'
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id='cleanup-testing-label'>Testing</InputLabel>
                                <Select
                                    labelId='cleanup-testing-label'
                                    value={testingFilter}
                                    label='Testing'
                                    onChange={(e) => setTestingFilter(e.target.value)}
                                >
                                    <MenuItem value='all'>All</MenuItem>
                                    <MenuItem value='false'>Production</MenuItem>
                                    <MenuItem value='true'>Testing</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id='cleanup-sort-label'>Sort By</InputLabel>
                                <Select
                                    labelId='cleanup-sort-label'
                                    value={sortBy}
                                    label='Sort By'
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    {currentOptions.sort.map((item) => (
                                        <MenuItem key={item} value={item}>{item}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id='cleanup-order-label'>Order</InputLabel>
                                <Select
                                    labelId='cleanup-order-label'
                                    value={order}
                                    label='Order'
                                    onChange={(e) => setOrder(e.target.value)}
                                >
                                    <MenuItem value='desc'>desc</MenuItem>
                                    <MenuItem value='asc'>asc</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            {accessDenied ? <Alert severity='warning'>This admin route requires authenticated admin permissions.</Alert> : null}
            {clearResult ? (
                <Alert severity='info'>
                    Cleared testing items: {clearResult.marker_deleted || 0} marker(s), {clearResult.schedule_deleted || 0} schedule(s). API keys are preserved.
                </Alert>
            ) : null}

            <Card className='admin-panel'>
                <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                            {entityType === 'marker' ? 'Marker Results' : 'Schedule Results'}
                        </Typography>
                        <Chip label={`Total: ${total}`} />
                    </Stack>

                    <Stack spacing={1.25}>
                        {items.length === 0 ? (
                            <Box sx={{ py: 2, color: 'text.secondary' }}>
                                <Typography variant='body2'>No records found.</Typography>
                            </Box>
                        ) : items.map((item) => (
                            <Card key={`${entityType}-${item.id}`} variant='outlined'>
                                <CardContent>
                                    <Stack
                                        direction={{ xs: 'column', md: 'row' }}
                                        justifyContent='space-between'
                                        alignItems={{ xs: 'flex-start', md: 'center' }}
                                        spacing={1.5}
                                    >
                                        <Box>
                                            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                                                #{item.id} {item.label}
                                            </Typography>
                                            {renderItemMeta(item)}
                                        </Box>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                            <Button
                                                className='admin-action-button'
                                                variant='outlined'
                                                onClick={() => openScheduleDialog(item)}
                                                disabled={loading || accessDenied}
                                            >
                                                Schedule Cleanup
                                            </Button>
                                            <Button
                                                className='admin-action-button'
                                                variant='contained'
                                                color='error'
                                                onClick={() => openDeleteDialog(item)}
                                                disabled={loading || accessDenied}
                                            >
                                                Permanently Delete
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} fullWidth maxWidth='sm'>
                <DialogTitle>Confirm Permanent Deletion</DialogTitle>
                <DialogContent>
                    <Typography variant='body2' sx={{ mb: 2 }}>
                        Type exact label <strong>{deleteTarget?.label}</strong> to permanently delete {entityType} #{deleteTarget?.id}.
                    </Typography>
                    <Stack spacing={1.5}>
                        <TextField
                            fullWidth
                            label='Confirm label'
                            value={deleteConfirmLabel}
                            onChange={(e) => setDeleteConfirmLabel(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>
                    <Button color='error' variant='contained' onClick={submitDelete} disabled={!canDelete || loading}>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={scheduleDialogOpen} onClose={closeScheduleDialog} fullWidth maxWidth='sm'>
                <DialogTitle>Schedule Cleanup</DialogTitle>
                <DialogContent>
                    <Typography variant='body2' sx={{ mb: 2 }}>
                        Type exact label <strong>{scheduleTarget?.label}</strong> and choose execution time for {entityType} #{scheduleTarget?.id}.
                    </Typography>
                    <Stack spacing={1.5}>
                        <TextField
                            fullWidth
                            label='Confirm label'
                            value={scheduleConfirmLabel}
                            onChange={(e) => setScheduleConfirmLabel(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            type='datetime-local'
                            label='Execute at'
                            value={scheduleExecuteAt}
                            onChange={(e) => setScheduleExecuteAt(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label='Reason (optional)'
                            value={scheduleReason}
                            onChange={(e) => setScheduleReason(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeScheduleDialog}>Cancel</Button>
                    <Button variant='contained' onClick={submitSchedule} disabled={!canSchedule || loading}>
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={clearDialogOpen} onClose={closeClearDialog} fullWidth maxWidth='sm'>
                <DialogTitle>Clear Testing Items</DialogTitle>
                <DialogContent>
                    <Typography variant='body2' sx={{ mb: 2 }}>
                        This deletes all markers and schedules with <strong>testing=true</strong>. API keys are not deleted.
                    </Typography>
                    <TextField
                        fullWidth
                        label='Type clear testing to confirm'
                        value={clearConfirm}
                        onChange={(e) => setClearConfirm(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeClearDialog}>Cancel</Button>
                    <Button
                        color='warning'
                        variant='contained'
                        disabled={loading || clearConfirm.trim().toLowerCase() !== 'clear testing'}
                        onClick={submitClearTesting}
                    >
                        Clear Testing Items
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminPageShell>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(PermanentCleanupManage)
