import React from 'react'
import { Button } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'

function PreviewDisplayPinButton({
    onClickHandler,
    pinLabel,
}) {
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
            }}
            onClick={onClickHandler}
        >
            <VisibilityIcon sx={{ marginRight: '15px' }} />
            Preview Display Pin: {pinLabel || 'Not Set'}
        </Button>
    )
}

export default PreviewDisplayPinButton
