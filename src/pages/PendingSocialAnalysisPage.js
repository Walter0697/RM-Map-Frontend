import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
    Alert,
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    Button,
    Typography,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import TopBar from '../components/topbar/TopBar'
import Base from './Base'
import PendingSocialAnalysisItem from '../components/list/listitem/PendingSocialAnalysisItem'
import backend from '../constant/backend'
import { fetchPendingSocialMediaAnalysis, updatePendingSocialMediaAnalysis } from './socialMediaPending'

function PendingSocialAnalysisPage({ jwt }) {
    const history = useHistory()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [workingID, setWorkingID] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)

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
                <List disablePadding sx={{ display: 'grid', gap: 2 }}>
                    {items.map((item) => (
                        <PendingSocialAnalysisItem
                            key={item.job_id}
                            item={item}
                            onClick={() => setSelectedItem(item)}
                            onReject={() => update(item, 'reject')}
                            onApprove={() => update(item, 'approve')}
                            working={workingID === item.job_id}
                        />
                    ))}
                </List>
            </Box>
            <Dialog fullWidth maxWidth='sm' open={!!selectedItem} onClose={() => setSelectedItem(null)}>
                <DialogTitle>{selectedItem?.result?.location?.name || selectedItem?.result?.description || 'Pending marker details'}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        Review the extracted information before adding it to the map.
                    </Typography>
                    {selectedItem?.result?.location?.address ? <Typography sx={{ mb: 1 }}><strong>Address:</strong> {selectedItem.result.location.address}</Typography> : null}
                    {selectedItem?.result?.marker_type ? <Typography sx={{ mb: 1 }}><strong>Type:</strong> {selectedItem.result.marker_type}</Typography> : null}
                    {selectedItem?.result?.description ? <Typography sx={{ mb: 1 }}><strong>Description:</strong> {selectedItem.result.description}</Typography> : null}
                    {selectedItem?.result?.tags?.length ? <Typography sx={{ mb: 1 }}><strong>Tags:</strong> {selectedItem.result.tags.join(', ')}</Typography> : null}
                    {selectedItem?.result?.follow_up ? <Typography sx={{ mb: 1 }}><strong>Agent note:</strong> {selectedItem.result.follow_up}</Typography> : null}
                    <Divider sx={{ my: 2 }} />
                    <Button href={selectedItem?.source_url} target='_blank' rel='noreferrer' endIcon={<OpenInNewIcon />}>Open source post</Button>
                </DialogContent>
                <DialogActions>
                    <Button color='error' onClick={() => { const item = selectedItem; setSelectedItem(null); update(item, 'reject') }} disabled={!selectedItem || workingID === selectedItem.job_id}>Not good</Button>
                    <Button variant='contained' onClick={() => { const item = selectedItem; setSelectedItem(null); update(item, 'approve') }} disabled={!selectedItem || workingID === selectedItem.job_id}>Good, add marker</Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

export default connect((state) => ({ jwt: state.auth.jwt }))(PendingSocialAnalysisPage)
