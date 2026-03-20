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
import httpScript from '../../scripts/http'

const defaultAvailableScopes = [
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
    const adminBackend = backend.withBasePath('admin')

    const [ loading, setLoading ] = useState(false)
    const [ items, setItems ] = useState([])
    const [ testingFilter, setTestingFilter ] = useState('all')
    const [ serviceAccounts, setServiceAccounts ] = useState([])
    const [ relations, setRelations ] = useState([])
    const [ serviceAccountsLoading, setServiceAccountsLoading ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ healthErrorMessage, setHealthErrorMessage ] = useState('')
    const [ authHealth, setAuthHealth ] = useState(null)
    const [ availableScopes, setAvailableScopes ] = useState(defaultAvailableScopes)

    const [ form, setForm ] = useState({
        name: '',
        testing: false,
        relation_id: '',
        service_account_id: '',
        expires_at: '',
        scopes: [defaultAvailableScopes[0]],
    })
    const [ serviceAccountForm, setServiceAccountForm ] = useState({
        name: '',
        description: '',
        role: 'user',
        relation_id: '',
        active: true,
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
        if (!form.service_account_id.trim()) return false
        return form.scopes.length > 0
    }, [form])
    const allScopesSelected = form.scopes.length === availableScopes.length
    const canCreateServiceAccount = useMemo(() => (
        !!serviceAccountForm.name.trim() && !!serviceAccountForm.role.trim() && !!serviceAccountForm.relation_id.trim()
    ), [serviceAccountForm])

    const parseJsonError = async (resp) => {
        if (resp.status === 503) {
            return httpScript.AUTH_STATE_UNAVAILABLE_UI_MESSAGE
        }
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

    const fetchAuthHealth = async () => {
        if (!authBackend || !jwt) return
        setHealthErrorMessage('')
        try {
            const resp = await fetch(`${authBackend}/health`, {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setHealthErrorMessage(`Failed to load auth health: ${errText}`)
                return
            }
            const body = await resp.json()
            setAuthHealth(body)
        } catch (e) {
            setHealthErrorMessage(`Failed to load auth health: ${httpScript.toAuthAwareErrorMessage(e, 'Unknown error')}`)
        }
    }

    const fetchKeys = async () => {
        if (!apiKeyBackend || !jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const params = new URLSearchParams()
            if (testingFilter === 'true' || testingFilter === 'false') {
                params.set('testing', testingFilter)
            }
            const queryString = params.toString()
            const resp = await fetch(`${apiKeyBackend}/apikeys${queryString ? `?${queryString}` : ''}`, {
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
            const fetchedRelations = Array.isArray(body.relations) ? body.relations : []
            const fetchedServiceAccounts = Array.isArray(body.service_accounts) ? body.service_accounts : []
            const backendScopes = Array.isArray(body.available_scopes)
                ? body.available_scopes
                : (Array.isArray(body.scopes) ? body.scopes : [])
            const normalizedScopes = Array.from(new Set(backendScopes
                .map((scope) => (typeof scope === 'string' ? scope.trim() : ''))
                .filter(Boolean)))
            const nextAvailableScopes = normalizedScopes.length > 0 ? normalizedScopes : defaultAvailableScopes
            setRelations(fetchedRelations)
            setServiceAccounts(fetchedServiceAccounts)
            setAvailableScopes(nextAvailableScopes)

            setForm((prev) => ({
                ...prev,
                relation_id: prev.relation_id || (fetchedRelations[0] ? String(fetchedRelations[0].id) : ''),
                service_account_id: prev.service_account_id || (fetchedServiceAccounts[0] ? String(fetchedServiceAccounts[0].id) : ''),
                scopes: (() => {
                    const filteredScopes = prev.scopes.filter((scope) => nextAvailableScopes.includes(scope))
                    if (filteredScopes.length > 0) return filteredScopes
                    return nextAvailableScopes[0] ? [nextAvailableScopes[0]] : []
                })(),
            }))
            setServiceAccountForm((prev) => ({
                ...prev,
                relation_id: prev.relation_id || (fetchedRelations[0] ? String(fetchedRelations[0].id) : ''),
            }))
        } catch (e) {
            setErrorMessage(`Failed to load API key options: ${e.message}`)
        }
    }

    const fetchServiceAccounts = async () => {
        if (!adminBackend || !jwt) return
        setServiceAccountsLoading(true)
        setErrorMessage('')
        try {
            const resp = await fetch(`${adminBackend}/service-accounts`, {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to load service accounts: ${errText}`)
                return
            }
            const body = await resp.json()
            setServiceAccounts(Array.isArray(body.items) ? body.items : [])
        } catch (e) {
            setErrorMessage(`Failed to load service accounts: ${e.message}`)
        } finally {
            setServiceAccountsLoading(false)
        }
    }

    useEffect(() => {
        fetchKeys()
    }, [apiKeyBackend, jwt, testingFilter])

    useEffect(() => {
        fetchOptions()
    }, [apiKeyBackend, jwt])

    useEffect(() => {
        fetchServiceAccounts()
    }, [adminBackend, jwt])

    useEffect(() => {
        fetchAuthHealth()
    }, [authBackend, jwt])

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
                testing: !!form.testing,
                relation_id: Number(form.relation_id),
                service_account_id: Number(form.service_account_id),
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
                testing: false,
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

    const onServiceAccountFormChange = (field) => (event) => {
        setServiceAccountForm({
            ...serviceAccountForm,
            [field]: event.target.value,
        })
    }

    const onCreateServiceAccount = async () => {
        if (!canCreateServiceAccount || !adminBackend || !jwt) return
        setServiceAccountsLoading(true)
        setErrorMessage('')
        try {
            const payload = {
                name: serviceAccountForm.name.trim(),
                description: serviceAccountForm.description.trim(),
                role: serviceAccountForm.role.trim(),
                relation_id: Number(serviceAccountForm.relation_id),
                active: !!serviceAccountForm.active,
            }
            const resp = await fetch(`${adminBackend}/service-accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify(payload),
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to create service account: ${errText}`)
                return
            }
            setAlertMessage('Service account created')
            triggerAlert()
            setServiceAccountForm({
                ...serviceAccountForm,
                name: '',
                description: '',
                relation_id: serviceAccountForm.relation_id,
                active: true,
            })
            await fetchServiceAccounts()
            await fetchOptions()
        } catch (e) {
            setErrorMessage(`Failed to create service account: ${e.message}`)
        } finally {
            setServiceAccountsLoading(false)
        }
    }

    const onToggleServiceAccountActive = async (item) => {
        if (!adminBackend || !jwt) return
        setServiceAccountsLoading(true)
        setErrorMessage('')
        try {
            const resp = await fetch(`${adminBackend}/service-accounts/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({
                    active: !item.active,
                }),
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to update service account: ${errText}`)
                return
            }
            setAlertMessage(`Service account ${item.active ? 'deactivated' : 'activated'}`)
            triggerAlert()
            await fetchServiceAccounts()
            await fetchOptions()
        } catch (e) {
            setErrorMessage(`Failed to update service account: ${e.message}`)
        } finally {
            setServiceAccountsLoading(false)
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
                    <FormControl size='small' sx={{ minWidth: 160 }}>
                        <InputLabel id='apikey-testing-filter-label'>Testing</InputLabel>
                        <Select
                            labelId='apikey-testing-filter-label'
                            value={testingFilter}
                            label='Testing'
                            onChange={(event) => setTestingFilter(event.target.value)}
                        >
                            <MenuItem value='all'>All</MenuItem>
                            <MenuItem value='false'>Production</MenuItem>
                            <MenuItem value='true'>Testing</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        className='admin-action-button'
                        variant='outlined'
                        onClick={fetchOptions}
                        disabled={loading}
                    >
                        Refresh Options
                    </Button>
                    <Button
                        className='admin-action-button'
                        variant='outlined'
                        onClick={fetchAuthHealth}
                        disabled={loading}
                    >
                        Refresh Auth Health
                    </Button>
                </>
            )}
        >
            {errorMessage ? (
                <Alert severity='error'>{errorMessage}</Alert>
            ) : null}
            {healthErrorMessage ? (
                <Alert severity='warning'>{healthErrorMessage}</Alert>
            ) : null}

            <Card className='admin-panel'>
                <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Auth state health</Typography>
                        <Chip label={authHealth?.status || 'unknown'} size='small' />
                    </Stack>
                    <Divider sx={{ my: 1.25 }} />
                    <Grid container spacing={1.5}>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Mode</Typography>
                            <Typography variant='body1'>{authHealth?.mode || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Auth-state migration</Typography>
                            <Typography variant='body1'>{authHealth?.authState?.migrationMode || '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Redis enabled</Typography>
                            <Typography variant='body1'>{String(!!authHealth?.authState?.redisEnabled)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Session TTL (sec)</Typography>
                            <Typography variant='body1'>{authHealth?.authState?.sessionTTL ?? '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Validate count</Typography>
                            <Typography variant='body1'>{authHealth?.authState?.metrics?.validateCount ?? '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Fallback count</Typography>
                            <Typography variant='body1'>{authHealth?.authState?.metrics?.validateFallbackCount ?? '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Validate errors</Typography>
                            <Typography variant='body1'>{authHealth?.authState?.metrics?.validateErrorCount ?? '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant='body2' color='text.secondary'>Revocation errors</Typography>
                            <Typography variant='body1'>{authHealth?.authState?.metrics?.revocationErrorCount ?? '-'}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card className='admin-panel'>
                <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Service Accounts</Typography>
                        <Stack direction='row' spacing={1} alignItems='center'>
                            <Chip label={`${serviceAccounts.length} account(s)`} size='small' />
                            <Button
                                className='admin-action-button'
                                variant='outlined'
                                size='small'
                                disabled={serviceAccountsLoading}
                                onClick={fetchServiceAccounts}
                            >
                                Refresh
                            </Button>
                        </Stack>
                    </Stack>
                    <Divider sx={{ my: 1.25 }} />
                    <Grid container spacing={1.5}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label='Name'
                                value={serviceAccountForm.name}
                                onChange={onServiceAccountFormChange('name')}
                                placeholder='integration-bot-prod'
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label='Description'
                                value={serviceAccountForm.description}
                                onChange={onServiceAccountFormChange('description')}
                                placeholder='Used by integration jobs'
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id='service-account-role-label'>Role</InputLabel>
                                <Select
                                    labelId='service-account-role-label'
                                    label='Role'
                                    value={serviceAccountForm.role}
                                    onChange={onServiceAccountFormChange('role')}
                                >
                                    <MenuItem value='user'>user</MenuItem>
                                    <MenuItem value='admin'>admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel id='service-account-relation-label'>Relation</InputLabel>
                                <Select
                                    labelId='service-account-relation-label'
                                    label='Relation'
                                    value={serviceAccountForm.relation_id}
                                    onChange={onServiceAccountFormChange('relation_id')}
                                >
                                    {relations.map((item) => (
                                        <MenuItem key={item.id} value={String(item.id)}>
                                            {item.display} (#{item.id})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                fullWidth
                                variant='contained'
                                disabled={!canCreateServiceAccount || serviceAccountsLoading}
                                onClick={onCreateServiceAccount}
                                sx={{ height: '100%' }}
                            >
                                Add
                            </Button>
                        </Grid>
                    </Grid>
                    <Stack spacing={0.75} sx={{ mt: 2 }}>
                        {serviceAccounts.length === 0 ? (
                            <Typography variant='body2' color='text.secondary'>
                                {serviceAccountsLoading ? 'Loading service accounts...' : 'No service accounts found.'}
                            </Typography>
                        ) : serviceAccounts.map((item) => (
                            <Card key={item.id} variant='outlined' sx={{ borderRadius: 1.5 }}>
                                <CardContent sx={{ py: 0.9, '&:last-child': { pb: 0.9 } }}>
                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Stack direction='row' spacing={0.75} alignItems='center'>
                                                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                                                    {item.name}
                                                </Typography>
                                                <Chip size='small' label={item.role || 'user'} />
                                                <Chip size='small' color={item.active ? 'success' : 'default'} label={item.active ? 'active' : 'inactive'} />
                                            </Stack>
                                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                Relation #{item.relation_id}
                                            </Typography>
                                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                {item.description || '-'}
                                            </Typography>
                                        </Box>
                                        <Button
                                            className='admin-action-button'
                                            variant='outlined'
                                            size='small'
                                            disabled={serviceAccountsLoading}
                                            onClick={() => onToggleServiceAccountActive(item)}
                                        >
                                            {item.active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

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
                                                        <Chip
                                                            size='small'
                                                            variant='outlined'
                                                            color={item.testing ? 'warning' : 'default'}
                                                            label={item.testing ? 'testing' : 'production'}
                                                        />
                                                    </Stack>
                                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                        Prefix: <Box component='span' sx={{ fontFamily: 'monospace' }}>{item.prefix || '-'}</Box>
                                                    </Typography>
                                                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                                                        Relation #{item.relation_id} | {item.service_account_id ? `Service Account: ${item.service_account_name || `#${item.service_account_id}`}` : `Actor #${item.actor_user_id}`}
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
                                        disabled
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
                                    <InputLabel id='service-account-select-label'>Service Account</InputLabel>
                                    <Select
                                        labelId='service-account-select-label'
                                        label='Service Account'
                                        value={form.service_account_id}
                                        onChange={(event) => {
                                            const selectedId = event.target.value
                                            const selectedAccount = serviceAccounts.find((item) => String(item.id) === String(selectedId))
                                            setForm({
                                                ...form,
                                                service_account_id: selectedId,
                                                relation_id: selectedAccount?.relation_id ? String(selectedAccount.relation_id) : form.relation_id,
                                            })
                                        }}
                                    >
                                        {serviceAccounts.map((item) => (
                                            <MenuItem key={item.id} value={String(item.id)}>
                                                {item.name} ({item.role}) - relation #{item.relation_id}{item.active ? '' : ' [inactive]'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            checked={!!form.testing}
                                            onChange={(event) => setForm({
                                                ...form,
                                                testing: event.target.checked,
                                            })}
                                        />
                                    )}
                                    label='Testing key (hidden from non-admin by default)'
                                />
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
