import React, { useState } from 'react'
import { Button, Chip } from '@mui/material'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import backend from '../../../constant/backend'

function resolveImageURL(value) {
    const imageURL = `${value || ''}`.trim()
    if (!imageURL) return ''
    if (/^https?:\/\//i.test(imageURL)) return imageURL
    if (imageURL.startsWith('/')) return `${backend.IMAGE_LINK}${imageURL}`
    return `${backend.IMAGE_LINK}/${imageURL}`
}

function PendingSocialAnalysisItem({ item, typeIcon, onClick, onApprove, onReject, working }) {
    const [imageFailed, setImageFailed] = useState(false)
    const result = item?.result || {}
    const location = result.location || {}
    const imageURL = resolveImageURL(result.image_url)
    const categoryIconURL = typeIcon ? `${backend.IMAGE_LINK}${typeIcon.startsWith('/') ? typeIcon : `/${typeIcon}`}` : ''
    const title = location.name || result.description || 'Pending marker'
    const description = result.description || 'The agent needs your review before this can become a marker.'

    return (
        <div
            style={{
                position: 'relative',
                backgroundColor: '#48acdb',
                borderRadius: '5px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                padding: '12px',
                boxSizing: 'border-box',
                cursor: 'pointer',
            }}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onClick(event)
            }}
            role='button'
            tabIndex={0}
        >
            <div style={{ display: 'flex', minWidth: 0, alignItems: 'stretch' }}>
                <div style={{ width: '34%', minWidth: '96px', maxWidth: '130px', minHeight: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px', background: '#d9e6f3' }}>
                    {imageURL && !imageFailed ? (
                        <img src={imageURL} alt='' onError={() => setImageFailed(true)} style={{ width: '100%', height: '96px', objectFit: 'cover' }} />
                    ) : categoryIconURL ? (
                        <img src={categoryIconURL} alt='' style={{ maxHeight: '84px', maxWidth: '92%', objectFit: 'contain' }} />
                    ) : <FactCheckIcon sx={{ fontSize: 56, color: '#1f76bd' }} />}
                </div>
                <div style={{ paddingLeft: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '20px', fontWeight: 600, color: 'black', lineHeight: 1.2 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                    </div>
                    <div style={{ marginTop: '6px', color: '#1f2a50', wordBreak: 'break-word' }}>
                        {location.address || 'Location needs confirmation'}
                    </div>
                    <div style={{ marginTop: '6px', color: '#071c8d', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {description}
                    </div>
                    <Chip label='Needs review' size='small' sx={{ mt: 1, backgroundColor: '#fff3cd', color: '#6b4e00', fontWeight: 600 }} />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <Button size='small' color='error' variant='outlined' onClick={(event) => { event.stopPropagation(); onReject() }} disabled={working}>Not good</Button>
                <Button size='small' variant='contained' onClick={(event) => { event.stopPropagation(); onApprove() }} disabled={working}>Good, add marker</Button>
                <Button size='small' href={item.source_url} target='_blank' rel='noreferrer' endIcon={<OpenInNewIcon />} onClick={(event) => event.stopPropagation()} sx={{ color: '#071c8d' }}>Source</Button>
            </div>
        </div>
    )
}

export default PendingSocialAnalysisItem
