import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'

import AutoHideAlert from '../AutoHideAlert'

const TransitionUp = (props) => {
    return <Slide {...props} direction="up" />
}

function BaseForm({
    children,
    open,
    handleClose,
    title,
    maxWidth,
    handleSubmit,
    cancelText,
    createText,
    loading,
    isSubmitUnauthorized,
}) {
    const history = useHistory()

    useEffect(() => {
        if (isSubmitUnauthorized) {
            window.setTimeout(() => {
                history.replace('/')
            }, 2000)
        }
    }, [isSubmitUnauthorized])

    return (
        <>
            <Dialog
                fullWidth
                maxWidth={maxWidth || 'lg'}
                open={open}
                onClose={handleClose}
                scroll={'paper'}
                TransitionComponent={TransitionUp}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText>
                        {children}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{cancelText}</Button>
                    <Button 
                        disabled={isSubmitUnauthorized || loading}
                        onClick={handleSubmit}
                    >   
                        {createText}
                    </Button>
                </DialogActions>
            </Dialog>
            <AutoHideAlert
                open={isSubmitUnauthorized}
                type={'error'}
                message={'Unauthorized, now redirecting to login screen...'}
                timing={2000}
            />
        </>
    )
}

export default BaseForm