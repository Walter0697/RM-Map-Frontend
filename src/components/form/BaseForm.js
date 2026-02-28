import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    Slide,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'

import AutoHideAlert from '../AutoHideAlert'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
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
    alertMessage,
    clearAlertMessage,
    displayMode,
}) {
    const history = useHistory()

    const [ currentMessage, setMessage ] = useState(null)
    const [ messageDisplay, activateMessage ] = useBoop(3000)

    useEffect(() => {
        if (alertMessage) {
            setMessage(alertMessage)
            activateMessage()
            clearAlertMessage()
        }
    }, [alertMessage])

    useEffect(() => {
        if (messageDisplay) return
        setMessage(null)
    }, [messageDisplay])

    useEffect(() => {
        if (isSubmitUnauthorized) {
            window.setTimeout(() => {
                history.replace('/')
            }, 2000)
        }
    }, [isSubmitUnauthorized])

    const actionButtons = (
        <>
            <Button
                disabled={isSubmitUnauthorized || loading}
                onClick={handleClose}
            >
                {cancelText}
            </Button>
            {createText && (
                <Button
                    disabled={isSubmitUnauthorized || loading}
                    onClick={handleSubmit}
                >
                    {createText}
                </Button>
            )}
        </>
    )

    return (
        <>
            {displayMode === 'panel' ? (
                <Drawer
                    anchor='right'
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            width: { xs: '100%', sm: 560, lg: 680 },
                            maxWidth: '100vw',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
                    <DialogContent
                        dividers
                        sx={{
                            flex: 1,
                            '& .MuiGrid-container': {
                                alignContent: 'flex-start',
                            },
                        }}
                    >
                        <Box sx={{ py: 0.5 }}>
                            {children}
                        </Box>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            position: 'sticky',
                            bottom: 0,
                            bgcolor: 'background.paper',
                        }}
                    >
                        {actionButtons}
                    </DialogActions>
                </Drawer>
            ) : (
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
                        {children}
                    </DialogContent>
                    <DialogActions>
                        {actionButtons}
                    </DialogActions>
                </Dialog>
            )}

            <AutoHideAlert
                open={isSubmitUnauthorized}
                type={'error'}
                message={'Unauthorized, now redirecting to login screen...'}
                timing={2000}
            />
            <AutoHideAlert
                open={messageDisplay}
                type={currentMessage ? currentMessage.type : ''}
                message={currentMessage ? currentMessage.message: ''}
                timing={2000}
            />
        </>
    )
}

export default BaseForm
