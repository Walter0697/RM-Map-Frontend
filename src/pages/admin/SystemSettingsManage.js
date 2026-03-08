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

function parsePositiveInteger(value) {
    const trimmed = `${value ?? ''}`.trim()
    if (!trimmed) return null
    if (!/^\d+$/.test(trimmed)) return null
    const parsed = Number(trimmed)
    if (!Number.isInteger(parsed) || parsed <= 0) return null
    return parsed
}

function SystemSettingsManage({ jwt }) {
    const [ loading, setLoading ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ successMessage, setSuccessMessage ] = useState('')
    const [ shortcutURL, setShortcutURL ] = useState('')
    const [ easyThresholdMinutes, setEasyThresholdMinutes ] = useState('')
    const [ difficultThresholdMinutes, setDifficultThresholdMinutes ] = useState('')
    const [ calendarShortMinutes, setCalendarShortMinutes ] = useState('')
    const [ calendarMediumMinutes, setCalendarMediumMinutes ] = useState('')
    const [ calendarLongMinutes, setCalendarLongMinutes ] = useState('')
    const [ calendarAutoMinutes, setCalendarAutoMinutes ] = useState('')
    const trimmedShortcutURL = shortcutURL.trim()
    const hasShortcutURL = trimmedShortcutURL !== ''
    const isShortcutURLValid = validateShortcutURL(trimmedShortcutURL)
    const parsedEasyThresholdMinutes = parsePositiveInteger(easyThresholdMinutes)
    const parsedDifficultThresholdMinutes = parsePositiveInteger(difficultThresholdMinutes)
    const areThresholdsPresent = parsedEasyThresholdMinutes !== null && parsedDifficultThresholdMinutes !== null
    const areThresholdsOrdered = areThresholdsPresent && parsedEasyThresholdMinutes < parsedDifficultThresholdMinutes
    const areThresholdsValid = areThresholdsPresent && areThresholdsOrdered
    const hasThresholdValues = `${easyThresholdMinutes}`.trim() !== '' || `${difficultThresholdMinutes}`.trim() !== ''
    const parsedCalendarShortMinutes = parsePositiveInteger(calendarShortMinutes)
    const parsedCalendarMediumMinutes = parsePositiveInteger(calendarMediumMinutes)
    const parsedCalendarLongMinutes = parsePositiveInteger(calendarLongMinutes)
    const parsedCalendarAutoMinutes = parsePositiveInteger(calendarAutoMinutes)
    const areCalendarDurationsValid = parsedCalendarShortMinutes !== null
        && parsedCalendarMediumMinutes !== null
        && parsedCalendarLongMinutes !== null
        && parsedCalendarAutoMinutes !== null
    const hasCalendarDurationValues = `${calendarShortMinutes}`.trim() !== ''
        || `${calendarMediumMinutes}`.trim() !== ''
        || `${calendarLongMinutes}`.trim() !== ''
        || `${calendarAutoMinutes}`.trim() !== ''

    const fetchSetting = async () => {
        if (!jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const [ shortcutResponse, thresholdResponse, calendarDurationResponse ] = await Promise.all([
                fetch(backend.withBasePath('admin/settings/ios-shortcut-install-url'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                }),
                fetch(backend.withBasePath('admin/settings/schedule-travel-thresholds'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                }),
                fetch(backend.withBasePath('admin/settings/calendar-sync-durations'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                }),
            ])
            if (!shortcutResponse.ok) {
                const text = await shortcutResponse.text()
                setErrorMessage(text || `Failed to load shortcut setting (${shortcutResponse.status})`)
                return
            }
            if (!thresholdResponse.ok) {
                const text = await thresholdResponse.text()
                setErrorMessage(text || `Failed to load travel thresholds (${thresholdResponse.status})`)
                return
            }
            if (!calendarDurationResponse.ok) {
                const text = await calendarDurationResponse.text()
                setErrorMessage(text || `Failed to load calendar sync durations (${calendarDurationResponse.status})`)
                return
            }

            const shortcutData = await shortcutResponse.json()
            setShortcutURL(shortcutData?.ios_shortcut_install_url || '')

            const thresholdData = await thresholdResponse.json()
            setEasyThresholdMinutes(`${thresholdData?.easy_threshold_minutes ?? ''}`)
            setDifficultThresholdMinutes(`${thresholdData?.difficult_threshold_minutes ?? ''}`)

            const calendarDurationData = await calendarDurationResponse.json()
            setCalendarShortMinutes(`${calendarDurationData?.short_minutes ?? ''}`)
            setCalendarMediumMinutes(`${calendarDurationData?.medium_minutes ?? ''}`)
            setCalendarLongMinutes(`${calendarDurationData?.long_minutes ?? ''}`)
            setCalendarAutoMinutes(`${calendarDurationData?.auto_minutes ?? ''}`)
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
            const shortcutResponse = await fetch(backend.withBasePath('admin/settings/ios-shortcut-install-url'), {
                method: 'PUT',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ios_shortcut_install_url: shortcutURL,
                }),
            })
            if (!shortcutResponse.ok) {
                const text = await shortcutResponse.text()
                setErrorMessage(text || `Failed to save shortcut setting (${shortcutResponse.status})`)
                return
            }

            const thresholdResponse = await fetch(backend.withBasePath('admin/settings/schedule-travel-thresholds'), {
                method: 'PUT',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    easy_threshold_minutes: parsedEasyThresholdMinutes,
                    difficult_threshold_minutes: parsedDifficultThresholdMinutes,
                }),
            })
            if (!thresholdResponse.ok) {
                const text = await thresholdResponse.text()
                setErrorMessage(text || `Failed to save travel thresholds (${thresholdResponse.status})`)
                return
            }

            const calendarDurationResponse = await fetch(backend.withBasePath('admin/settings/calendar-sync-durations'), {
                method: 'PUT',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    short_minutes: parsedCalendarShortMinutes,
                    medium_minutes: parsedCalendarMediumMinutes,
                    long_minutes: parsedCalendarLongMinutes,
                    auto_minutes: parsedCalendarAutoMinutes,
                }),
            })
            if (!calendarDurationResponse.ok) {
                const text = await calendarDurationResponse.text()
                setErrorMessage(text || `Failed to save calendar sync durations (${calendarDurationResponse.status})`)
                return
            }

            const shortcutData = await shortcutResponse.json()
            setShortcutURL(shortcutData?.ios_shortcut_install_url || '')

            const thresholdData = await thresholdResponse.json()
            setEasyThresholdMinutes(`${thresholdData?.easy_threshold_minutes ?? ''}`)
            setDifficultThresholdMinutes(`${thresholdData?.difficult_threshold_minutes ?? ''}`)
            const calendarDurationData = await calendarDurationResponse.json()
            setCalendarShortMinutes(`${calendarDurationData?.short_minutes ?? ''}`)
            setCalendarMediumMinutes(`${calendarDurationData?.medium_minutes ?? ''}`)
            setCalendarLongMinutes(`${calendarDurationData?.long_minutes ?? ''}`)
            setCalendarAutoMinutes(`${calendarDurationData?.auto_minutes ?? ''}`)
            setSuccessMessage('Saved system settings.')
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
                        disabled={loading || saving || (hasShortcutURL && !isShortcutURLValid) || !areThresholdsValid || !areCalendarDurationsValid}
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
                                variant='outlined'
                                onClick={() => window.open(trimmedShortcutURL, '_blank', 'noopener,noreferrer')}
                                disabled={!isShortcutURLValid}
                            >
                                Open Preview
                            </Button>
                        </Stack>

                        <Divider />

                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                background: 'linear-gradient(90deg, #e9fff2 0%, #f8fffb 100%)',
                                border: '1px solid #c7f1d7',
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                                    Schedule Travel Difficulty Thresholds
                                </Typography>
                                <Chip
                                    size='small'
                                    color={hasThresholdValues ? (areThresholdsValid ? 'success' : 'warning') : 'default'}
                                    label={hasThresholdValues ? (areThresholdsValid ? 'Configured' : 'Invalid thresholds') : 'Not configured'}
                                />
                            </Stack>
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
                                Controls difficulty bands for travel-time classification. Easy must be lower than difficult.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                type='number'
                                label='Easy Threshold (minutes)'
                                placeholder='20'
                                value={easyThresholdMinutes}
                                onChange={(event) => setEasyThresholdMinutes(event.target.value)}
                                disabled={loading || saving}
                                error={hasThresholdValues && !areThresholdsValid}
                                helperText={hasThresholdValues && !areThresholdsValid ? 'Enter a positive integer lower than Difficult threshold.' : 'Durations at or below this are labeled easy.'}
                            />
                            <TextField
                                fullWidth
                                type='number'
                                label='Difficult Threshold (minutes)'
                                placeholder='45'
                                value={difficultThresholdMinutes}
                                onChange={(event) => setDifficultThresholdMinutes(event.target.value)}
                                disabled={loading || saving}
                                error={hasThresholdValues && !areThresholdsValid}
                                helperText={hasThresholdValues && !areThresholdsValid ? 'Enter a positive integer greater than Easy threshold.' : 'Durations above this are labeled difficult.'}
                            />
                        </Stack>

                        <Divider />

                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                background: 'linear-gradient(90deg, #fff5e8 0%, #fffaf3 100%)',
                                border: '1px solid #f7dfbe',
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                                    Calendar Sync Duration Presets
                                </Typography>
                                <Chip
                                    size='small'
                                    color={hasCalendarDurationValues ? (areCalendarDurationsValid ? 'success' : 'warning') : 'default'}
                                    label={hasCalendarDurationValues ? (areCalendarDurationsValid ? 'Configured' : 'Invalid durations') : 'Not configured'}
                                />
                            </Stack>
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
                                Marker estimate-time buckets map to event length (short/medium/long). If marker estimate-time is missing, Auto fallback is used.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                type='number'
                                label='Short Duration (minutes)'
                                placeholder='30'
                                value={calendarShortMinutes}
                                onChange={(event) => setCalendarShortMinutes(event.target.value)}
                                disabled={loading || saving}
                                error={hasCalendarDurationValues && !areCalendarDurationsValid}
                                helperText={hasCalendarDurationValues && !areCalendarDurationsValid ? 'All values must be positive integers.' : 'Used when marker estimate_time=short.'}
                            />
                            <TextField
                                fullWidth
                                type='number'
                                label='Medium Duration (minutes)'
                                placeholder='60'
                                value={calendarMediumMinutes}
                                onChange={(event) => setCalendarMediumMinutes(event.target.value)}
                                disabled={loading || saving}
                                error={hasCalendarDurationValues && !areCalendarDurationsValid}
                                helperText={hasCalendarDurationValues && !areCalendarDurationsValid ? 'All values must be positive integers.' : 'Used when marker estimate_time=medium.'}
                            />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                type='number'
                                label='Long Duration (minutes)'
                                placeholder='120'
                                value={calendarLongMinutes}
                                onChange={(event) => setCalendarLongMinutes(event.target.value)}
                                disabled={loading || saving}
                                error={hasCalendarDurationValues && !areCalendarDurationsValid}
                                helperText={hasCalendarDurationValues && !areCalendarDurationsValid ? 'All values must be positive integers.' : 'Used when marker estimate_time=long.'}
                            />
                            <TextField
                                fullWidth
                                type='number'
                                label='Auto Fallback (minutes)'
                                placeholder='30'
                                value={calendarAutoMinutes}
                                onChange={(event) => setCalendarAutoMinutes(event.target.value)}
                                disabled={loading || saving}
                                error={hasCalendarDurationValues && !areCalendarDurationsValid}
                                helperText={hasCalendarDurationValues && !areCalendarDurationsValid ? 'All values must be positive integers.' : 'Used when marker estimate_time is missing or unknown.'}
                            />
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
