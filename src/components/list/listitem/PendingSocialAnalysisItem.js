import React from 'react'
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

function PendingSocialAnalysisItem({ item, typeIcon, onClick }) {
    return (
        <MarkerItem
            item={buildPendingMarkerItem(item)}
            typeIcon={typeIcon}
            onClickHandler={onClick}
        />
    )
}

export default PendingSocialAnalysisItem
