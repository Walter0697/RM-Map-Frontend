import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
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

const metricColor = {
    total: '#1f6feb',
    success: '#2e7d32',
    error: '#d32f2f',
    latency: '#6a4fb3',
}

const providerPalette = ['#1f6feb', '#2e7d32', '#8e24aa', '#ef6c00', '#00838f', '#c2185b']

const numberFmt = (value) => Number(value || 0).toLocaleString()

const buildSparkline = (points, width = 560, height = 140, padding = 14) => {
    if (!Array.isArray(points) || points.length === 0) return ''
    const maxValue = points.reduce((max, item) => Math.max(max, Number(item.total_calls || 0)), 1)
    const innerWidth = width - padding * 2
    const innerHeight = height - padding * 2
    return points.map((item, index) => {
        const x = points.length === 1
            ? padding + innerWidth / 2
            : padding + (index / (points.length - 1)) * innerWidth
        const y = padding + innerHeight - (Number(item.total_calls || 0) / maxValue) * innerHeight
        return `${x},${y}`
    }).join(' ')
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
    const totalCalls = Number(overall?.total_calls || 0)
    const successCount = Number(overall?.success_count || 0)
    const errorCount = Number(overall?.error_count || 0)
    const avgLatency = Number(overall?.avg_latency_ms || 0)
    const successPctRaw = totalCalls > 0 ? (successCount / totalCalls) * 100 : 0
    const errorPctRaw = totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0
    const usedPct = Math.min(100, successPctRaw + errorPctRaw)
    const donutBackground = `conic-gradient(${metricColor.success} 0 ${successPctRaw}%, ${metricColor.error} ${successPctRaw}% ${usedPct}%, #d9e3ee ${usedPct}% 100%)`
    const sortedProviders = [...providerRows].sort((a, b) => Number(b.total_calls || 0) - Number(a.total_calls || 0))
    const avgCallsPerBucket = trends.length > 0
        ? (trends.reduce((sum, item) => sum + Number(item.total_calls || 0), 0) / trends.length).toFixed(1)
        : '0.0'
    const peakBucket = trends.length > 0
        ? trends.reduce((prev, current) => (Number(current.total_calls || 0) > Number(prev.total_calls || 0) ? current : prev), trends[0])
        : null
    const sparkline = buildSparkline(trends)

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
                    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
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

            <Card className='admin-panel'>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 1.5 }}>Usage Summary</Typography>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ border: '1px solid #d7e0ea', borderRadius: 2, px: 2.25, py: 1.75, background: 'linear-gradient(135deg, #f7fbff 0%, #ffffff 100%)' }}>
                            <Typography variant='overline' sx={{ color: metricColor.total }}>Total Calls</Typography>
                            <Typography variant='h5'>{numberFmt(totalCalls)}</Typography>
                            <Typography variant='caption' color='text.secondary'>Volume in selected range</Typography>
                        </Box>
                        <Box sx={{ border: '1px solid #d7e0ea', borderRadius: 2, px: 2.25, py: 1.75, background: 'linear-gradient(135deg, #f6fff8 0%, #ffffff 100%)' }}>
                            <Typography variant='overline' sx={{ color: metricColor.success }}>Success Rate</Typography>
                            <Typography variant='h5'>{pct(successCount, totalCalls)}</Typography>
                            <Typography variant='caption' color='text.secondary'>{numberFmt(successCount)} successful calls</Typography>
                        </Box>
                        <Box sx={{ border: '1px solid #d7e0ea', borderRadius: 2, px: 2.25, py: 1.75, background: 'linear-gradient(135deg, #fff8f8 0%, #ffffff 100%)' }}>
                            <Typography variant='overline' sx={{ color: metricColor.error }}>Error Rate</Typography>
                            <Typography variant='h5'>{pct(errorCount, totalCalls)}</Typography>
                            <Typography variant='caption' color='text.secondary'>{numberFmt(errorCount)} failed calls</Typography>
                        </Box>
                        <Box sx={{ border: '1px solid #d7e0ea', borderRadius: 2, px: 2.25, py: 1.75, background: 'linear-gradient(135deg, #f9f7ff 0%, #ffffff 100%)' }}>
                            <Typography variant='overline' sx={{ color: metricColor.latency }}>Avg Latency (ms)</Typography>
                            <Typography variant='h5'>{avgLatency.toFixed(1)}</Typography>
                            <Typography variant='caption' color='text.secondary'>Mean response time</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box
                sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 2,
                }}
            >
                <Card className='admin-panel' sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant='h6' sx={{ mb: 2 }}>Usage Split</Typography>
                        <Stack direction='row' spacing={2} alignItems='center' justifyContent='center'>
                            <Box
                                sx={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    background: donutBackground,
                                    position: 'relative',
                                    flexShrink: 0,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 18,
                                        borderRadius: '50%',
                                        backgroundColor: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        border: '1px solid #d7e0ea',
                                    }}
                                >
                                    <Typography variant='caption' color='text.secondary'>Total</Typography>
                                    <Typography variant='h6'>{numberFmt(totalCalls)}</Typography>
                                </Box>
                            </Box>
                            <Stack spacing={1.25} sx={{ minWidth: 160 }}>
                                <Box>
                                    <Typography variant='body2'>Success</Typography>
                                    <Typography variant='h6' sx={{ color: metricColor.success }}>{pct(successCount, totalCalls)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant='body2'>Error</Typography>
                                    <Typography variant='h6' sx={{ color: metricColor.error }}>{pct(errorCount, totalCalls)}</Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
                <Card className='admin-panel' sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant='h6' sx={{ mb: 1.5 }}>Range Snapshot</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant='caption' color='text.secondary'>Buckets</Typography>
                                <Typography variant='h6'>{numberFmt(trends.length)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant='caption' color='text.secondary'>Avg Calls / Bucket</Typography>
                                <Typography variant='h6'>{avgCallsPerBucket}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant='caption' color='text.secondary'>Peak Bucket</Typography>
                                <Typography variant='h6'>{peakBucket ? numberFmt(peakBucket.total_calls) : '0'}</Typography>
                            </Grid>
                        </Grid>
                        {peakBucket ? (
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 1.5 }}>
                                Peak at {new Date(peakBucket.bucket_start).toLocaleString()}
                            </Typography>
                        ) : null}
                    </CardContent>
                </Card>
            </Box>

            <Card className='admin-panel'>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>Trend</Typography>
                    {loading ? <Typography color='text.secondary'>Loading trend data...</Typography> : null}
                    {!loading && trends.length === 0 ? <Typography color='text.secondary'>No trend data available for the selected filters.</Typography> : null}
                    {trends.length > 0 ? (
                        <Box sx={{ mb: 2 }}>
                            <svg viewBox='0 0 560 140' width='100%' height='160' role='img' aria-label='trend-line-chart'>
                                <rect x='0' y='0' width='560' height='140' fill='#f5f8fc' rx='10' />
                                <polyline
                                    points={sparkline}
                                    fill='none'
                                    stroke={metricColor.total}
                                    strokeWidth='3'
                                    strokeLinejoin='round'
                                    strokeLinecap='round'
                                />
                            </svg>
                        </Box>
                    ) : null}
                    <Stack spacing={1.25}>
                        {trends.map((item) => {
                            const totalCalls = Number(item.total_calls || 0)
                            const widthPct = maxTrend > 0 ? Math.max(5, (totalCalls / maxTrend) * 100) : 5
                            const successWidthPct = totalCalls > 0 ? (Number(item.success_count || 0) / totalCalls) * 100 : 0
                            const errorWidthPct = totalCalls > 0 ? (Number(item.error_count || 0) / totalCalls) * 100 : 0
                            return (
                                <Box key={item.bucket_start} sx={{ border: '1px solid #e3eaf2', borderRadius: 1.5, p: 1 }}>
                                    <Typography variant='caption' color='text.secondary'>
                                        {new Date(item.bucket_start).toLocaleString()} | Calls: {totalCalls} | Success: {item.success_count} | Error: {item.error_count}
                                    </Typography>
                                    <Box sx={{ height: 9, borderRadius: 8, backgroundColor: '#e8edf4', overflow: 'hidden', mt: 0.75, width: `${widthPct}%` }}>
                                        <Box sx={{ height: '100%', width: `${successWidthPct}%`, backgroundColor: metricColor.success, float: 'left' }} />
                                        <Box sx={{ height: '100%', width: `${errorWidthPct}%`, backgroundColor: metricColor.error, float: 'left' }} />
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
                        {sortedProviders.map((item, index) => {
                            const rowTotal = Number(item.total_calls || 0)
                            const sharePct = totalCalls > 0 ? (rowTotal / totalCalls) * 100 : 0
                            const barColor = providerPalette[index % providerPalette.length]
                            return (
                                <Box key={item.provider} sx={{ border: '1px solid #d7e0ea', borderRadius: 1.5, px: 1.5, py: 1.25 }}>
                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                        <Typography variant='subtitle2'>{item.provider_label} ({item.provider})</Typography>
                                        <Typography variant='subtitle2' sx={{ color: barColor }}>{sharePct.toFixed(1)}%</Typography>
                                    </Stack>
                                    <Box sx={{ mt: 0.6, height: 8, borderRadius: 8, backgroundColor: '#edf2f7', overflow: 'hidden' }}>
                                        <Box sx={{ height: '100%', width: `${Math.max(4, sharePct)}%`, backgroundColor: barColor }} />
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant='body2' color='text.secondary'>
                                        Calls: {numberFmt(item.total_calls)} | Success: {numberFmt(item.success_count)} | Error: {numberFmt(item.error_count)} | Avg latency: {Number(item.avg_latency_ms || 0).toFixed(1)}ms
                                    </Typography>
                                </Box>
                            )
                        })}
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
