import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import backend from '../../constant/backend'
import AdminPageShell from '../../components/admin/AdminPageShell'

const defaultRange = () => {
    const now = new Date()
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const toLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    const fromLocal = new Date(from.getTime() - from.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    return { fromLocal, toLocal }
}

const pct = (num, total) => {
    if (!total) return '0.0%'
    return `${((num / total) * 100).toFixed(1)}%`
}

function ExternalAPIUsageManage({ jwt }) {
    const history = useHistory()
    const location = useLocation()
    const initial = useMemo(() => defaultRange(), [])

    const query = useMemo(() => new URLSearchParams(location.search), [location.search])
    const initialProvider = query.get('provider') || 'all'
    const initialInterval = query.get('interval') || '1h'
    const initialFrom = query.get('from') || initial.fromLocal
    const initialTo = query.get('to') || initial.toLocal

    const [provider, setProvider] = useState(initialProvider)
    const [interval, setInterval] = useState(initialInterval)
    const [fromInput, setFromInput] = useState(initialFrom)
    const [toInput, setToInput] = useState(initialTo)

    const [providers, setProviders] = useState([])
    const [summary, setSummary] = useState(null)
    const [trends, setTrends] = useState([])
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [accessDenied, setAccessDenied] = useState(false)

    const parseResponseError = async (resp) => {
        const text = await resp.text()
        if (!text) return `${resp.status} ${resp.statusText}`
        return text
    }

    const toISO = (value) => {
        if (!value) return ''
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) return ''
        return parsed.toISOString()
    }

    const fetchJSON = async (path) => {
        const resp = await fetch(backend.withBasePath(path), {
            method: 'GET',
            headers: {
                Authorization: jwt,
            },
        })
        if (resp.status === 401 || resp.status === 403) {
            setAccessDenied(true)
            throw new Error(await parseResponseError(resp))
        }
        if (!resp.ok) {
            throw new Error(await parseResponseError(resp))
        }
        return resp.json()
    }

    const buildQuery = () => {
        const params = new URLSearchParams()
        const fromISO = toISO(fromInput)
        const toISOValue = toISO(toInput)
        if (fromISO) params.set('from', fromISO)
        if (toISOValue) params.set('to', toISOValue)
        if (provider !== 'all') params.set('provider', provider)
        params.set('interval', interval)
        return params
    }

    const loadData = async () => {
        if (!jwt) {
            setErrorMessage('Login required')
            return
        }

        setLoading(true)
        setErrorMessage('')
        try {
            const providerPayload = await fetchJSON('admin/api-usage/providers')
            const providerItems = Array.isArray(providerPayload.items) ? providerPayload.items : []
            setProviders(providerItems)

            const params = buildQuery()
            history.replace(`/admin/api-usage?${params.toString()}`)

            const summaryParams = new URLSearchParams(params.toString())
            summaryParams.delete('interval')
            const summaryPayload = await fetchJSON(`admin/api-usage/summary?${summaryParams.toString()}`)
            const trendPayload = await fetchJSON(`admin/api-usage/trends?${summaryParams.toString()}&interval=${encodeURIComponent(interval)}`)
            setSummary(summaryPayload)
            setTrends(Array.isArray(trendPayload.points) ? trendPayload.points : [])
            setAccessDenied(false)
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [jwt])

    const providerRows = summary && Array.isArray(summary.providers) ? summary.providers : []
    const overall = summary && summary.overall ? summary.overall : null
    const maxTrend = trends.reduce((max, item) => Math.max(max, Number(item.total_calls || 0)), 0)
    const providerValue = provider === 'all' || providers.some((item) => item.id === provider) ? provider : 'all'

    return (
        <AdminPageShell
            title='External API Usage'
            description='Audit-based usage analytics for managed external providers'
            actions={(
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button className='admin-action-button' variant='outlined' onClick={loadData} disabled={loading}>
                        Refresh
                    </Button>
                    <Button className='admin-action-button' variant='contained' onClick={loadData} disabled={loading}>
                        Apply Filters
                    </Button>
                </Stack>
            )}
        >
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            {accessDenied ? <Alert severity='warning'>This admin route requires authenticated admin permissions.</Alert> : null}

            <Card className='admin-panel'>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size='small'>
                                <InputLabel id='api-usage-provider'>Provider</InputLabel>
                                <Select
                                    labelId='api-usage-provider'
                                    value={providerValue}
                                    label='Provider'
                                    onChange={(e) => setProvider(e.target.value)}
                                    inputProps={{ 'data-testid': 'api-usage-provider-input' }}
                                >
                                    <MenuItem value='all'>All providers</MenuItem>
                                    {providers.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size='small'
                                label='From'
                                type='datetime-local'
                                value={fromInput}
                                onChange={(e) => setFromInput(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size='small'
                                label='To'
                                type='datetime-local'
                                value={toInput}
                                onChange={(e) => setToInput(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size='small'>
                                <InputLabel id='api-usage-interval'>Interval</InputLabel>
                                <Select
                                    labelId='api-usage-interval'
                                    value={interval}
                                    label='Interval'
                                    onChange={(e) => setInterval(e.target.value)}
                                    inputProps={{ 'data-testid': 'api-usage-interval-input' }}
                                >
                                    <MenuItem value='15m'>15 min</MenuItem>
                                    <MenuItem value='1h'>1 hour</MenuItem>
                                    <MenuItem value='6h'>6 hours</MenuItem>
                                    <MenuItem value='1d'>1 day</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <Card className='admin-panel'><CardContent><Typography variant='overline'>Total Calls</Typography><Typography variant='h5'>{overall ? overall.total_calls : 0}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card className='admin-panel'><CardContent><Typography variant='overline'>Success Rate</Typography><Typography variant='h5'>{overall ? pct(overall.success_count, overall.total_calls) : '0.0%'}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card className='admin-panel'><CardContent><Typography variant='overline'>Error Rate</Typography><Typography variant='h5'>{overall ? pct(overall.error_count, overall.total_calls) : '0.0%'}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card className='admin-panel'><CardContent><Typography variant='overline'>Avg Latency (ms)</Typography><Typography variant='h5'>{overall ? Number(overall.avg_latency_ms || 0).toFixed(1) : '0.0'}</Typography></CardContent></Card>
                </Grid>
            </Grid>

            <Card className='admin-panel'>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>Trend</Typography>
                    {loading ? <Typography color='text.secondary'>Loading trend data...</Typography> : null}
                    {!loading && trends.length === 0 ? <Typography color='text.secondary'>No trend data available for the selected filters.</Typography> : null}
                    <Stack spacing={1}>
                        {trends.map((item) => {
                            const totalCalls = Number(item.total_calls || 0)
                            const widthPct = maxTrend > 0 ? Math.max(5, (totalCalls / maxTrend) * 100) : 5
                            return (
                                <Box key={item.bucket_start}>
                                    <Typography variant='caption' color='text.secondary'>
                                        {new Date(item.bucket_start).toLocaleString()} | Calls: {totalCalls} | Success: {item.success_count} | Error: {item.error_count}
                                    </Typography>
                                    <Box sx={{ height: 8, borderRadius: 8, backgroundColor: '#e8edf4', overflow: 'hidden', mt: 0.5 }}>
                                        <Box sx={{ height: '100%', width: `${widthPct}%`, backgroundColor: '#1f6feb' }} />
                                    </Box>
                                </Box>
                            )
                        })}
                    </Stack>
                </CardContent>
            </Card>

            <Card className='admin-panel'>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>Provider Breakdown</Typography>
                    {loading ? <Typography color='text.secondary'>Loading providers...</Typography> : null}
                    {!loading && providerRows.length === 0 ? <Typography color='text.secondary'>No provider summary rows available.</Typography> : null}
                    <Stack spacing={1.5}>
                        {providerRows.map((item) => (
                            <Box key={item.provider} sx={{ border: '1px solid #d7e0ea', borderRadius: 1.5, px: 1.5, py: 1 }}>
                                <Typography variant='subtitle2'>{item.provider_label} ({item.provider})</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                    Calls: {item.total_calls} | Success: {item.success_count} | Error: {item.error_count} | Avg latency: {Number(item.avg_latency_ms || 0).toFixed(1)}ms
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </AdminPageShell>
    )
}

const mapStateToProps = (state) => ({
    jwt: state.auth.jwt,
})

export default connect(mapStateToProps)(ExternalAPIUsageManage)
