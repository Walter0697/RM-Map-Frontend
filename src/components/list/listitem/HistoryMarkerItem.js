import React, { useState, useEffect } from 'react'
import {
    Button,
} from '@mui/material'
import backend from '../../../constant/backend'

import StarIcon from '@mui/icons-material/Star'
import PinDropIcon from '@mui/icons-material/PinDrop'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'

import ImageHeadText from '../../wrapper/ImageHeadText'
import constant from '../../../scripts/constant'

function HistoryMarkerItem({
    item,
    typeIcon,
    onClickHandler,
}) {
    const historyPreview = item?.history_preview
    const historyPreviewReady = historyPreview?.state === 'ready' && !!historyPreview?.image_src
    const historyPreviewUnavailableByBackend = historyPreview?.fallback_reason === 'feature_unavailable'
    const historyPreviewLoading = historyPreview?.state === 'loading'
    const markerImageReady = !!item?.image_link

    const [ previewVisible, setPreviewVisible ] = useState(historyPreviewReady)
    const [ markerImageVisible, setMarkerImageVisible ] = useState(markerImageReady)

    useEffect(() => {
        setPreviewVisible(historyPreviewReady)
    }, [historyPreviewReady])

    useEffect(() => {
        setMarkerImageVisible(markerImageReady)
    }, [markerImageReady])

    const shortDescription = (() => {
        const text = item?.description || ''
        if (text.length <= 56) return text
        return `${text.slice(0, 56)}...`
    })()

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
                backgroundColor: constant.StaticColour.CardBackground,
                borderRadius: '5px',
                height: '100%',
                minHeight: '120px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0',
                border: item.status === 'scheduled' ? `3px solid ${constant.StaticColour.ScheduledBorder}` : '',
                justifyContent: 'flex-start',
            }}
            onClick={onClickHandler}
        >
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'stretch',
                }}
            >
                <div
                    style={{
                        overflow: 'hidden',
                        width: '30%',
                        minWidth: '92px',
                        maxWidth: '112px',
                        paddingLeft: '10px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {markerImageVisible ? (
                        <img
                            style={{
                                width: '100%',
                                height: '88px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                            }}
                            src={backend.IMAGE_LINK + item.image_link}
                            onError={() => setMarkerImageVisible(false)}
                            alt={`${item.label} marker image`}
                        />
                    ) : (
                        <img
                            style={{
                                maxHeight: '84px',
                                maxWidth: '92%',
                                objectFit: 'contain',
                            }}
                            src={backend.IMAGE_LINK + typeIcon}
                            alt={`${item.label} type icon`}
                        />
                    )}
                </div>
                <div
                    style={{
                        padding: '12px 10px 10px 12px',
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <ImageHeadText
                            iconPath={backend.IMAGE_LINK + typeIcon}
                            iconSize='20px'
                            label={item.label}
                            labelSize='20px'
                            labelColor='black'
                        />
                    </div>
                    <div
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#1f2a50',
                            textAlign: 'left',
                        }}
                    >
                        {item.address}
                    </div>
                    <div
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '5px',
                            marginRight: '10px',
                            color: '#071c8d',
                            whiteSpace: 'nowrap',
                            width: '95%',
                            textAlign: 'left',
                        }}
                    >
                        {item.permanent && (
                            <PinDropIcon />
                        )} 
                        {item.need_booking && (
                            <LocalPhoneIcon />
                        )} 
                        {shortDescription}
                    </div>
                </div>
                <div
                    style={{
                        overflow: 'hidden',
                        width: '30%',
                        minWidth: '92px',
                        maxWidth: '112px',
                        paddingRight: '10px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {previewVisible ? (
                        <img
                            style={{
                                width: '100%',
                                height: '88px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                            }}
                            src={historyPreview.image_src}
                            onError={() => setPreviewVisible(false)}
                            alt={`${item.label} map preview`}
                        />
                    ) : historyPreviewUnavailableByBackend || historyPreviewLoading ? (
                        <img
                            style={{
                                maxHeight: '84px',
                                maxWidth: '92%',
                                objectFit: 'contain',
                            }}
                            src={backend.IMAGE_LINK + typeIcon}
                            alt={`${item.label} type icon`}
                        />
                    ) : item?.history_preview ? (
                        <div
                            style={{
                                width: '100%',
                                height: '88px',
                                borderRadius: '6px',
                                border: '1px solid #d6e2ec',
                                background: 'linear-gradient(135deg, #e8f0f6 0%, #f9fbfc 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: '#5d7282',
                                fontSize: '12px',
                                lineHeight: 1.3,
                                padding: '8px',
                            }}
                        >
                            {item.history_preview?.fallback_reason === 'no_coordinates' ? 'No map preview' : 'Preview unavailable'}
                        </div>
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '88px',
                                borderRadius: '6px',
                                border: '1px solid #d6e2ec',
                                background: 'linear-gradient(135deg, #e8f0f6 0%, #f9fbfc 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: '#5d7282',
                                fontSize: '12px',
                                lineHeight: 1.3,
                                padding: '8px',
                            }}
                        >
                            Preview unavailable
                        </div>
                    )}
                </div>
            </div>
            {item.is_fav && (
                <div
                    style={{ 
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                    }}
                >
                    <StarIcon sx={{ color: 'yellow' }}/>
                </div>
            )}
        </Button>
    )
}

export default HistoryMarkerItem
