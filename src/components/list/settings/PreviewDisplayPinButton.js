import React from 'react'
import { Button } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                color: '#1c76d2',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                paddingLeft: '12px',
                paddingRight: '12px',
            }}
            onClick={onClickHandler}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <VisibilityIcon />
                Preview Display Pin
            </span>
            {hasPreviewPin ? (
                <img
                    src={backend.IMAGE_LINK + pinImagePath}
                    alt={pinLabel || 'Selected preview pin'}
                    style={{
                        width: '26px',
                        height: '26px',
                        objectFit: 'contain',
                    }}
                />
            ) : (
                <span>Not Set</span>
            )}
        </Button>
    )
}

export default PreviewDisplayPinButton
