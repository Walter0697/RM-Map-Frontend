import React from 'react'
import { Button } from '@mui/material'
import backend from '../../../constant/backend'

function PreviewDisplayPinButton({
    onClickHandler,
    pinLabel,
    pinImagePath,
}) {
    const hasPreviewPin = !!pinImagePath

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#dbfdff',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                color: '#12244d',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '6px',
                padding: '8px',
            }}
            onClick={onClickHandler}
        >
            <span style={{ fontSize: '12px', color: '#315786' }}>Preview Display Pin</span>
            {hasPreviewPin ? (
                <img
                    src={backend.IMAGE_LINK + pinImagePath}
                    alt={pinLabel || 'Selected preview pin'}
                    style={{
                        width: '64px',
                        height: '44px',
                        objectFit: 'contain',
                    }}
                />
            ) : (
                <span style={{ fontWeight: 600 }}>Not Set</span>
            )}
            <span
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}
            >
                {pinLabel || 'Select Pin'}
            </span>
        </Button>
    )
}

export default PreviewDisplayPinButton
