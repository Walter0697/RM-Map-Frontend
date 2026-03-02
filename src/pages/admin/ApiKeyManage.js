import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Checkbox,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'

import AdminPageShell from '../../components/admin/AdminPageShell'
import backend from '../../constant/backend'

const availableScopes = [
    'markers:read',
    'markers:write',
    'schedules:read',
    'schedules:write',
    'stations:read',
    'stations:write',
    'settings:read',
    'settings:write',
    'static-preview:generate',
]

function ApiKeyManage({ jwt }) {
    const authBackend = backend.AUTH_BACKEND
    const apiKeyBackend = backend.APIKEY_BACKEND || authBackend

    const [ loading, setLoading ] = useState(false)
    const [ items, setItems ] = useState([])
    const [ users, setUsers ] = useState([])
    const [ relations, setRelations ] = useState([])
    const [ errorMessage, setErrorMessage ] = useState('')

    const [ form, setForm ] = useState({
        name: '',
        relation_id: '',
        actor_user_id: '',
        expires_at: '',
        scopes: ['markers:read'],
    })

    const [ latestToken, setLatestToken ] = useState('')
    const [ latestTokenName, setLatestTokenName ] = useState('')
    const [ createDialogOpen, setCreateDialogOpen ] = useState(false)
    const formFieldSx = { width: { xs: '100%', md: 300 } }

    const [ alertOpen, triggerAlert ] = useBoop(2500)
    const [ alertMessage, setAlertMessage ] = useState('')

    const canCreate = useMemo(() => {
        if (!form.name.trim()) return false
        if (!form.relation_id.trim()) return false
        if (!form.actor_user_id.trim()) return false
        return form.scopes.length > 0
    }, [form])
    const allScopesSelected = form.scopes.length === availableScopes.length

    const parseJsonError = async (resp) => {
        if (resp.status === 404) {
            return '404 page not found. Backend route /auth/apikeys is unavailable. Restart backend with latest code or verify REACT_APP_BACKEND_BASE_URL.'
        }
        const text = await resp.text()
        if (!text) return `${resp.status} ${resp.statusText}`
        try {
            const body = JSON.parse(text)
            if (typeof body.error === 'string') return body.error
            if (typeof body.message === 'string') return body.message
        } catch (e) {
            return text
        }
        return text
    }

    const fetchKeys = async () => {
        if (!apiKeyBackend || !jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const resp = await fetch(`${apiKeyBackend}/apikeys`, {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to load API keys: ${errText}`)
                return
            }
            const body = await resp.json()
            setItems(Array.isArray(body.items) ? body.items : [])
        } catch (e) {
            setErrorMessage(`Failed to load API keys: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const fetchOptions = async () => {
        if (!apiKeyBackend || !jwt) return
        setErrorMessage('')
        try {
            const resp = await fetch(`${apiKeyBackend}/apikeys/options`, {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to load API key options: ${errText}`)
                return
            }
            const body = await resp.json()
            const fetchedUsers = Array.isArray(body.users) ? body.users : []
            const fetchedRelations = Array.isArray(body.relations) ? body.relations : []
            setUsers(fetchedUsers)
            setRelations(fetchedRelations)

            setForm((prev) => ({
                ...prev,
                relation_id: prev.relation_id || (fetchedRelations[0] ? String(fetchedRelations[0].id) : ''),
                actor_user_id: prev.actor_user_id || (fetchedUsers[0] ? String(fetchedUsers[0].id) : ''),
            }))
        } catch (e) {
            setErrorMessage(`Failed to load API key options: ${e.message}`)
        }
    }

    useEffect(() => {
        fetchKeys()
    }, [apiKeyBackend, jwt])

    useEffect(() => {
        fetchOptions()
    }, [apiKeyBackend, jwt])

    const onFormChange = (field) => (e) => {
        setForm({
            ...form,
            [field]: e.target.value,
        })
    }

    const onScopeChange = (scope) => (e) => {
        if (e.target.checked) {
            if (form.scopes.includes(scope)) return
            setForm({
                ...form,
                scopes: [...form.scopes, scope],
            })
            return
        }
        setForm({
            ...form,
            scopes: form.scopes.filter((item) => item !== scope),
        })
    }

    const onCreate = async () => {
        if (!canCreate || !apiKeyBackend || !jwt) return false

        setLoading(true)
        setErrorMessage('')
        try {
            const payload = {
                name: form.name.trim(),
                relation_id: Number(form.relation_id),
                actor_user_id: Number(form.actor_user_id),
                scopes: form.scopes,
            }
            if (form.expires_at.trim()) {
                payload.expires_at = new Date(form.expires_at).toISOString()
            }

            const resp = await fetch(`${apiKeyBackend}/apikeys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify(payload),
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to create API key: ${errText}`)
                return false
            }
            const body = await resp.json()
            setLatestToken(body.token || '')
            setLatestTokenName(body.api_key?.name || payload.name)
            setAlertMessage('API key created')
            triggerAlert()
            setForm({
                ...form,
                name: '',
                expires_at: '',
            })
            await fetchOptions()
            await fetchKeys()
            return true
        } catch (e) {
            setErrorMessage(`Failed to create API key: ${e.message}`)
            return false
        } finally {
            setLoading(false)
        }
    }

    const onRotate = async (id, name) => {
        if (!window.confirm('Rotate this API key? The current key will stop working.')) return
        if (!apiKeyBackend || !jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const resp = await fetch(`${apiKeyBackend}/apikeys/${id}/rotate`, {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to rotate API key: ${errText}`)
                return
            }
            const body = await resp.json()
            setLatestToken(body.token || '')
            setLatestTokenName(body.api_key?.name || name)
            setAlertMessage('API key rotated')
            triggerAlert()
            await fetchKeys()
        } catch (e) {
            setErrorMessage(`Failed to rotate API key: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete API key "${name}"? This cannot be undone.`)) return
        if (!apiKeyBackend || !jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const resp = await fetch(`${apiKeyBackend}/apikeys/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to delete API key: ${errText}`)
                return
            }
            setAlertMessage('API key deleted')
            triggerAlert()
            await fetchKeys()
        } catch (e) {
            setErrorMessage(`Failed to delete API key: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const copyLatestToken = async () => {
        if (!latestToken) return
        try {
            await navigator.clipboard.writeText(latestToken)
            setAlertMessage('API key copied to clipboard')
            triggerAlert()
        } catch (e) {
            setErrorMessage('Clipboard copy failed, please copy manually')
        }
    }

    const onOpenCreateDialog = () => setCreateDialogOpen(true)
    const onCloseCreateDialog = () => setCreateDialogOpen(false)
    const onSelectAllScopes = () => {
        setForm({
            ...form,
            scopes: [...availableScopes],
        })
    }
    const onClearAllScopes = () => {
        setForm({
            ...form,
            scopes: [],
        })
    }

    const formatDateTime = (value) => {
        if (!value) return '-'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return date.toLocaleString()
    }

    return (
        <AdminPageShell
            title='API Key Manage'
            description='Manage machine credentials for integrations and automation.'
            alertOpen={alertOpen}
            alertMessage={alertMessage}
            actions={(
                <>
                    <Button
                        className='admin-action-button'
                        variant='contained'
                        onClick={onOpenCreateDialog}
                    >
                        New API Key
                    </Button>
                    <Button
                        className='admin-action-button'
                        variant='outlined'
                        onClick={fetchKeys}
                        disabled={loading}
                    >
                        Refresh Keys
                    </Button>
                    <Button
                        className='admin-action-button'
                        variant='outlined'
                        onClick={fetchOptions}
                        disabled={loading}
                    >
                        Refresh Options
                    </Button>
                </>
            )}
        >
            {errorMessage ? (
                <Alert severity='error'>{errorMessage}</Alert>
            ) : null}

            {latestToken ? (
                <Card className='admin-panel' sx={{ borderColor: '#d4a106', borderWidth: 2 }}>
                    <CardContent>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>New secret (visible once)</Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                            Save this token now for <b>{latestTokenName}</b>. It cannot be retrieved later.
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            sx={{ mt: 1.25, fontFamily: 'monospace' }}
                            value={latestToken}
                            InputProps={{ readOnly: true }}
                        />
                        <Button
                            className='admin-action-button'
                            variant='contained'
                            sx={{ mt: 1.25 }}
                            onClick={copyLatestToken}
                        >
                            Copy Token
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            <Card className='admin-panel'>
                <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Active keys</Typography>
                        <Chip label={`${items.length} key(s)`} size='small' />
                    </Stack>
                    <Divider sx={{ my: 1.25 }} />

                    {items.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>
                            {loading ? 'Loading keys...' : 'No API keys found.'}
                        </Typography>
                    ) : (
                        <Stack spacing={0.75}>
                            {items.map((item) => {
                                const isRevoked = item.status === 'revoked'
                                const itemScopes = Array.isArray(item.scopes) ? item.scopes : []
                                const visibleScopes = itemScopes.slice(0, 3)
                                const hiddenScopesCount = Math.max(itemScopes.length - visibleScopes.length, 0)
                                return (
                                    <Card key={item.id} variant='outlined' sx={{ borderRadius: 1.5 }}>
                                        <CardContent sx={{ py: 0.9, '&:last-child': { pb: 0.9 } }}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 220px 170px' },
                                                    gap: 1,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mb: 0.25 }}>
                                                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                                                            {item.name}
                                                        </Typography>
                                                        <Chip
                                                            size='small'
                                                            color={isRevoked ? 'default' : 'success'}
                                                            label={item.status || 'active'}
                                                        />
                                                    </Stack>
                                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                        Prefix: <Box component='span' sx={{ fontFamily: 'monospace' }}>{item.prefix || '-'}</Box>
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                        Relation #{item.relation_id} | Actor #{item.actor_user_id}
                                                    </Typography>
                                                    <Stack direction='row' spacing={0.5} flexWrap='wrap' sx={{ mt: 0.5 }}>
                                                        {visibleScopes.map((scope) => (
                                                            <Chip key={scope} size='small' variant='outlined' label={scope} />
                                                        ))}
                                                        {hiddenScopesCount > 0 ? (
                                                            <Chip size='small' variant='outlined' label={`+${hiddenScopesCount} more`} />
                                                        ) : null}
                                                    </Stack>
                                                </Box>
                                                <Box>
                                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                        Last used: {formatDateTime(item.last_used_at)}
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                        Expires: {formatDateTime(item.expires_at)}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                                    }}
                                                >
                                                    <Stack direction='row' spacing={0.75} justifyContent='flex-end'>
                                                        <Button
                                                            className='admin-action-button'
                                                            variant='outlined'
                                                            size='small'
                                                            disabled={loading || isRevoked}
                                                            onClick={() => onRotate(item.id, item.name)}
                                                        >
                                                            Rotate
                                                        </Button>
                                                        <Button
                                                            className='admin-action-button'
                                                            variant='outlined'
                                                            color='error'
                                                            size='small'
                                                            disabled={loading}
                                                            onClick={() => onDelete(item.id, item.name)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </Stack>
                    )}
                </CardContent>
            </Card>
            <Dialog
                fullWidth
                maxWidth='md'
                open={createDialogOpen}
                onClose={onCloseCreateDialog}
            >
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    sx={formFieldSx}
                                    label='Key Name'
                                    value={form.name}
                                    onChange={onFormChange('name')}
                                    placeholder='e.g. deploy-bot-prod'
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type='datetime-local'
                                    sx={formFieldSx}
                                    label='Expiration (optional)'
                                    value={form.expires_at}
                                    onChange={onFormChange('expires_at')}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={formFieldSx}>
                                    <InputLabel id='relation-select-label'>Relation</InputLabel>
                                    <Select
                                        labelId='relation-select-label'
                                        label='Relation'
                                        value={form.relation_id}
                                        onChange={onFormChange('relation_id')}
                                    >
                                        {relations.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.display} (#{item.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={formFieldSx}>
                                    <InputLabel id='actor-select-label'>Actor User</InputLabel>
                                    <Select
                                        labelId='actor-select-label'
                                        label='Actor User'
                                        value={form.actor_user_id}
                                        onChange={onFormChange('actor_user_id')}
                                    >
                                        {users.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.username} ({item.role}) #{item.id}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box>
                            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
                                <Typography variant='subtitle2'>Scopes</Typography>
                                <Stack direction='row' spacing={1}>
                                    <Button
                                        size='small'
                                        variant='text'
                                        disabled={allScopesSelected}
                                        onClick={onSelectAllScopes}
                                    >
                                        Add All
                                    </Button>
                                    <Button
                                        size='small'
                                        variant='text'
                                        disabled={form.scopes.length === 0}
                                        onClick={onClearAllScopes}
                                    >
                                        Clear All
                                    </Button>
                                </Stack>
                            </Stack>
                            <Stack spacing={0.25}>
                                {availableScopes.map((scope) => (
                                    <Box key={scope} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <FormControlLabel
                                            control={(
                                                <Checkbox
                                                    checked={form.scopes.includes(scope)}
                                                    onChange={onScopeChange(scope)}
                                                />
                                            )}
                                            label={scope}
                                            sx={{ width: '100%', minHeight: 40, m: 0 }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseCreateDialog}>Cancel</Button>
                    <Button
                        variant='contained'
                        disabled={!canCreate || loading}
                        onClick={async () => {
                            const created = await onCreate()
                            if (created) onCloseCreateDialog()
                        }}
                    >
                        Generate API Key
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminPageShell>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(ApiKeyManage)
