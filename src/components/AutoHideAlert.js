import React from 'react'
import { 
    Snackbar,
    Alert,
    Slide,
} from '@mui/material'
import useMobileDetect from 'use-mobile-detect-hook'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function AutoHideAlert({
    open,
    type, //severity
    message,
    timing,
}) {
    const detectMobile = useMobileDetect()

    const margin = detectMobile.isMobile() ? '25%' : '5%'
    return (
        <Snackbar
            style={{ marginBottom: margin }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={timing}
            TransitionComponent={TransitionUp}
            open={open}
            message={message}
        >
            <Alert severity={type}>
                {message}
            </Alert>
        </Snackbar>
    )
}

export default AutoHideAlert