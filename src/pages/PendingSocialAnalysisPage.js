import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    List,
    Typography,
} from '@mui/material'
import TopBar from '../components/topbar/TopBar'
import Base from './Base'
import PendingSocialAnalysisItem, { buildPendingMarkerItem } from '../components/list/listitem/PendingSocialAnalysisItem'
import MarkerView from '../components/marker/MarkerView'
import backend from '../constant/backend'
import { fetchPendingSocialMediaAnalysis, updatePendingSocialMediaAnalysis } from './socialMediaPending'

function PendingSocialAnalysisPage({ jwt, eventtypes }) {
    const history = useHistory()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [workingID, setWorkingID] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)

    const selectedMarker = selectedItem ? {
        ...buildPendingMarkerItem(selectedItem),
        link: selectedItem.source_url,
        social_media_link: selectedItem.source_url,
        latitude: selectedItem.result?.location?.latitude || 0,
        longitude: selectedItem.result?.location?.longitude || 0,
    } : null

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
                        (() => {
                            const markerType = item.result?.marker_type || ''
                            const typeIcon = eventtypes.find((eventtype) => eventtype.value === markerType)?.icon_path || ''
                            return (
                        <PendingSocialAnalysisItem
                            key={item.job_id}
                            item={item}
                            typeIcon={typeIcon}
                            onClick={() => setSelectedItem(item)}
                        />
                            )
                        })()
                    ))}
                </List>
            </Box>
            <MarkerView
                open={!!selectedItem}
                handleClose={() => setSelectedItem(null)}
                marker={selectedMarker}
                noStar
                pendingActions={selectedItem ? <>
                    <Button color='error' onClick={() => { const item = selectedItem; setSelectedItem(null); update(item, 'reject') }} disabled={workingID === selectedItem.job_id}>Not good</Button>
                    <Button variant='contained' onClick={() => { const item = selectedItem; setSelectedItem(null); update(item, 'approve') }} disabled={workingID === selectedItem.job_id}>Good, add marker</Button>
                </> : null}
            />
        </Base>
    )
}

export default connect((state) => ({ jwt: state.auth.jwt, eventtypes: state.marker.eventtypes || [] }))(PendingSocialAnalysisPage)
