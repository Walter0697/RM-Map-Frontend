import React from 'react'
import { Button } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import MarkerItem from './MarkerItem'

export function buildPendingMarkerItem(item) {
    const result = item?.result || {}
    const location = result.location || {}
    return {
        id: item?.job_id,
        label: location.name || result.description || 'Pending marker',
        address: location.address || 'Location needs confirmation',
        description: result.description || 'The agent needs your review before this can become a marker.',
        image_link: result.image_url || '',
        type: result.marker_type || '',
        permanent: false,
        need_booking: !!result.need_booking,
        status: '',
    }
}

function PendingSocialAnalysisItem({ item, typeIcon, onClick, onApprove, onReject, working }) {
    return (
        <div>
            <MarkerItem
                item={buildPendingMarkerItem(item)}
                typeIcon={typeIcon}
                onClickHandler={onClick}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <Button size='small' color='error' variant='outlined' onClick={onReject} disabled={working}>Not good</Button>
                <Button size='small' variant='contained' onClick={onApprove} disabled={working}>Good, add marker</Button>
                <Button size='small' href={item.source_url} target='_blank' rel='noreferrer' endIcon={<OpenInNewIcon />} sx={{ color: '#071c8d' }}>Source</Button>
            </div>
        </div>
    )
}

export default PendingSocialAnalysisItem
