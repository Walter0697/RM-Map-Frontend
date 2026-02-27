import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Typography,
    Card,
    CardContent,
    Divider,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'

import AdminTopBar from '../../components/topbar/AdminTopBar'

const availableScopes = [
    'markers:read',
    'markers:write',
    'schedules:read',
    'schedules:write',
    'stations:read',
    'stations:write',
    'settings:read',
    'settings:write',
]

function ApiKeyManage({ jwt }) {
    const authBackend = process.env.REACT_APP_AUTH_BACKEND
    const apiKeyBackend = process.env.REACT_APP_APIKEY_BACKEND || authBackend

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

    const [ alertOpen, triggerAlert ] = useBoop(2500)
    const [ alertMessage, setAlertMessage ] = useState('')

    const canCreate = useMemo(() => {
        if (!form.name.trim()) return false
        if (!form.relation_id.trim()) return false
        if (!form.actor_user_id.trim()) return false
        return form.scopes.length > 0
    }, [form])

    const parseJsonError = async (resp) => {
        if (resp.status === 404) {
            return '404 page not found. Backend route /auth/apikeys is unavailable. Restart backend with latest code or set REACT_APP_APIKEY_BACKEND.'
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
        if (!canCreate || !apiKeyBackend || !jwt) return

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
                return
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
        } catch (e) {
            setErrorMessage(`Failed to create API key: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const onRevoke = async (id) => {
        if (!window.confirm('Revoke this API key?')) return
        if (!apiKeyBackend || !jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const resp = await fetch(`${apiKeyBackend}/apikeys/${id}/revoke`, {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!resp.ok) {
                const errText = await parseJsonError(resp)
                setErrorMessage(`Failed to revoke API key: ${errText}`)
                return
            }
            setAlertMessage('API key revoked')
            triggerAlert()
            await fetchKeys()
        } catch (e) {
            setErrorMessage(`Failed to revoke API key: ${e.message}`)
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

    return (
        <>
            <AdminTopBar
                label={'API Key Manage'}
                alertOpen={alertOpen}
                alertMessage={alertMessage}
            />
            <Grid
                container
                spacing={2}
                style={{
                    marginTop: '10px',
                    marginLeft: '1%',
                    width: '98%',
                    marginBottom: '20px',
                }}
            >
                <Grid item xs={12} md={12} lg={12}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6'>Create API Key</Typography>
                            <Grid container spacing={2} style={{ marginTop: '5px' }}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label='Key Name'
                                        value={form.name}
                                        onChange={onFormChange('name')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
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
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
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
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type='datetime-local'
                                        label='Expires At (optional)'
                                        value={form.expires_at}
                                        onChange={onFormChange('expires_at')}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant='body2' style={{ marginBottom: '8px' }}>
                                        Scopes
                                    </Typography>
                                    <Stack direction='row' spacing={1} flexWrap='wrap'>
                                        {availableScopes.map((scope) => (
                                            <FormControlLabel
                                                key={scope}
                                                control={(
                                                    <Checkbox
                                                        checked={form.scopes.includes(scope)}
                                                        onChange={onScopeChange(scope)}
                                                    />
                                                )}
                                                label={scope}
                                            />
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant='contained'
                                        disabled={!canCreate || loading}
                                        onClick={onCreate}
                                    >
                                        Create API Key
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        style={{ marginLeft: '10px' }}
                                        disabled={loading}
                                        onClick={fetchKeys}
                                    >
                                        Refresh
                                    </Button>
                                    <Button
                                        variant='outlined'
                                        style={{ marginLeft: '10px' }}
                                        disabled={loading}
                                        onClick={fetchOptions}
                                    >
                                        Refresh Options
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {latestToken ? (
                    <Grid item xs={12} md={12} lg={12}>
                        <Card style={{ border: '1px solid #f0b400' }}>
                            <CardContent>
                                <Typography variant='h6'>New Secret (show once)</Typography>
                                <Typography variant='body2' color='textSecondary'>
                                    Save this now for <b>{latestTokenName}</b>. You cannot retrieve it again later.
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    style={{ marginTop: '10px' }}
                                    value={latestToken}
                                    InputProps={{ readOnly: true }}
                                />
                                <Button
                                    variant='outlined'
                                    style={{ marginTop: '10px' }}
                                    onClick={copyLatestToken}
                                >
                                    Copy Token
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : null}

                <Grid item xs={12} md={12} lg={12}>
                    <Card>
                        <CardContent>
                            <Typography variant='h6'>Existing API Keys</Typography>
                            <Divider style={{ marginTop: '8px', marginBottom: '8px' }} />
                            {errorMessage ? (
                                <Typography color='error' style={{ marginBottom: '10px' }}>
                                    {errorMessage}
                                </Typography>
                            ) : null}
                            {items.length === 0 ? (
                                <Typography variant='body2' color='textSecondary'>
                                    {loading ? 'Loading...' : 'No API keys found.'}
                                </Typography>
                            ) : null}
                            {items.map((item) => (
                                <Card key={item.id} style={{ marginTop: '10px', backgroundColor: '#f8fbff' }}>
                                    <CardContent>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12} md={9}>
                                                <Typography variant='subtitle1'>
                                                    {item.name} ({item.status})
                                                </Typography>
                                                <Typography variant='body2' color='textSecondary'>
                                                    Prefix: {item.prefix}
                                                </Typography>
                                                <Typography variant='body2' color='textSecondary'>
                                                    Scopes: {Array.isArray(item.scopes) ? item.scopes.join(', ') : '-'}
                                                </Typography>
                                                <Typography variant='body2' color='textSecondary'>
                                                    Relation ID: {item.relation_id} | Actor User ID: {item.actor_user_id}
                                                </Typography>
                                                <Typography variant='body2' color='textSecondary'>
                                                    Last Used: {item.last_used_at || '-'}
                                                </Typography>
                                                <Typography variant='body2' color='textSecondary'>
                                                    Expires At: {item.expires_at || '-'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Button
                                                    fullWidth
                                                    variant='outlined'
                                                    disabled={loading || item.status === 'revoked'}
                                                    onClick={() => onRotate(item.id, item.name)}
                                                >
                                                    Rotate
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant='outlined'
                                                    color='error'
                                                    style={{ marginTop: '8px' }}
                                                    disabled={loading || item.status === 'revoked'}
                                                    onClick={() => onRevoke(item.id)}
                                                >
                                                    Revoke
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(ApiKeyManage)
