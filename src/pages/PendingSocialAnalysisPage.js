import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material'
import TopBar from '../components/topbar/TopBar'
import Base from './Base'
import backend from '../constant/backend'
import { fetchPendingSocialMediaAnalysis, updatePendingSocialMediaAnalysis } from './socialMediaPending'

function resultSummary(result) {
    if (!result || typeof result !== 'object') return 'The agent needs your review before this can become a marker.'
    const location = result.location?.address || result.location?.name
    return [result.description, location, result.marker_type].filter(Boolean).join(' · ') || 'The agent needs your review before this can become a marker.'
}

function PendingSocialAnalysisPage({ jwt }) {
    const history = useHistory()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [workingID, setWorkingID] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const payload = await fetchPendingSocialMediaAnalysis(fetch, backend.BACKEND_BASE_URL, jwt)
            setItems(payload.items)
        } catch (loadError) {
            setError(loadError.message)
        } finally {
            setLoading(false)
        }
    }, [jwt])

    useEffect(() => { load() }, [load])

    const update = async (item, action) => {
        setWorkingID(item.job_id)
        setError('')
        try {
            await updatePendingSocialMediaAnalysis(fetch, backend.BACKEND_BASE_URL, jwt, item.job_id, action)
            await load()
        } catch (updateError) {
            setError(updateError.message)
        } finally {
            setWorkingID('')
        }
    }

    return (
        <Base>
            <TopBar label='Pending Markers' onBackHandler={() => history.replace('/setting')} />
            <Box sx={{ p: 2 }}>
                {error ? <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert> : null}
                {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box> : null}
                {!loading && items.length === 0 ? <Typography color='text.secondary'>No pending markers.</Typography> : null}
                <List disablePadding>
                    {items.map((item) => (
                        <ListItem key={item.job_id} divider sx={{ display: 'block', py: 2 }}>
                            <ListItemText
                                primary={item.result?.location?.name || item.result?.description || 'Pending marker'}
                                secondary={<><span>{resultSummary(item.result)}</span><br /><a href={item.source_url} target='_blank' rel='noreferrer'>Open source post</a></>}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
                                <Button color='error' onClick={() => update(item, 'reject')} disabled={workingID === item.job_id}>Not good</Button>
                                <Button variant='contained' onClick={() => update(item, 'approve')} disabled={workingID === item.job_id}>Good, add marker</Button>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Base>
    )
}

export default connect((state) => ({ jwt: state.auth.jwt }))(PendingSocialAnalysisPage)
