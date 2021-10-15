import React, { useEffect } from 'react'
import { 
    Snackbar,
    Alert,
    Slide,
} from '@mui/material'

const TransitionUp = (props) => {
    return <Slide {...props} direction="up" />
}

function AutoHideAlert({
    open,
    type, //severity
    message,
    timing,
}) {
    return (
        <Snackbar
            style={{ marginBottom: '25%' }}
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