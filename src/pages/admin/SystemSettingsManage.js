import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import AdminPageShell from '../../components/admin/AdminPageShell'
import backend from '../../constant/backend'
import httpScript from '../../scripts/http'

function validateShortcutURL(value) {
    const trimmed = (value || '').trim()
    if (!trimmed) return false
    try {
        const parsed = new URL(trimmed)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
        return !!parsed.hostname
    } catch (error) {
        return false
    }
}

function SystemSettingsManage({ jwt }) {
    const [ loading, setLoading ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ successMessage, setSuccessMessage ] = useState('')
    const [ shortcutURL, setShortcutURL ] = useState('')
    const trimmedShortcutURL = shortcutURL.trim()
    const hasShortcutURL = trimmedShortcutURL !== ''
    const isShortcutURLValid = validateShortcutURL(trimmedShortcutURL)

    const fetchSetting = async () => {
        if (!jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('admin/settings/ios-shortcut-install-url'), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                setErrorMessage(text || `Failed to load setting (${response.status})`)
                return
            }
            const data = await response.json()
            setShortcutURL(data?.ios_shortcut_install_url || '')
        } catch (error) {
            setErrorMessage(httpScript.toAuthAwareErrorMessage(error, 'Failed to load setting'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSetting()
    }, [jwt])

    const onSave = async () => {
        if (!jwt) return
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const response = await fetch(backend.withBasePath('admin/settings/ios-shortcut-install-url'), {
                method: 'PUT',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ios_shortcut_install_url: shortcutURL,
                }),
            })
            if (!response.ok) {
                const text = await response.text()
                setErrorMessage(text || `Failed to save setting (${response.status})`)
                return
            }
            const data = await response.json()
            setShortcutURL(data?.ios_shortcut_install_url || '')
            setSuccessMessage('Saved iOS shortcut install URL.')
        } catch (error) {
            setErrorMessage(httpScript.toAuthAwareErrorMessage(error, 'Failed to save setting'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminPageShell
            title='System Settings'
            description='Admin-only runtime settings for app integrations.'
            actions={(
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button className='admin-action-button' variant='outlined' onClick={fetchSetting} disabled={loading || saving}>
                        Refresh
                    </Button>
                    <Button
                        className='admin-action-button'
                        variant='contained'
                        onClick={onSave}
                        disabled={loading || saving || (hasShortcutURL && !isShortcutURLValid)}
                    >
                        Save
                    </Button>
                </Stack>
            )}
        >
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}
            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={2}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                background: 'linear-gradient(90deg, #e7f4ff 0%, #f5fbff 100%)',
                                border: '1px solid #d5e9fb',
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                                    iOS Shortcut Install URL
                                </Typography>
                                <Chip
                                    size='small'
                                    color={hasShortcutURL && isShortcutURLValid ? 'success' : 'default'}
                                    label={hasShortcutURL ? (isShortcutURLValid ? 'Configured' : 'Invalid URL') : 'Not configured'}
                                />
                            </Stack>
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
                                Shown on User Settings as the &quot;Install iOS Shortcut&quot; action. Leave empty to hide the button.
                            </Typography>
                        </Box>

                        <Divider />

                        <TextField
                            fullWidth
                            label='Shortcut URL'
                            placeholder='https://www.icloud.com/shortcuts/...'
                            value={shortcutURL}
                            onChange={(event) => setShortcutURL(event.target.value)}
                            disabled={loading || saving}
                            error={hasShortcutURL && !isShortcutURLValid}
                            helperText={hasShortcutURL && !isShortcutURLValid
                                ? 'Use an absolute http/https URL (for example: https://www.icloud.com/shortcuts/...)'
                                : 'Supports http/https URLs. Empty value disables the user-facing button.'}
                        />

                        <Button
                            className='admin-action-button'
                            variant='outlined'
                            onClick={() => setShortcutURL('')}
                            disabled={loading || saving || !hasShortcutURL}
                        >
                            Clear
                        </Button>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <Button
                                className='admin-action-button'
                                variant='contained'
                                onClick={onSave}
                                disabled={loading || saving || (hasShortcutURL && !isShortcutURLValid)}
                            >
                                Save
                            </Button>
                            <Button
                                className='admin-action-button'
                                variant='text'
                                onClick={() => window.open(trimmedShortcutURL, '_blank', 'noopener,noreferrer')}
                                disabled={!isShortcutURLValid}
                            >
                                Open Preview
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </AdminPageShell>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(SystemSettingsManage)
