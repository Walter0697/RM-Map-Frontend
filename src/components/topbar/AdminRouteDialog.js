import React from 'react'
import { useHistory } from 'react-router-dom'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Slide,
} from '@mui/material'

const TransitionRight = (props) => {
    return <Slide {...props} direction='right' />
}

function AdminRouteDialog({
    open,
    handleClose,
}) { 
    const history = useHistory()

    const directTo = (path) => {
        history.replace(path)
    }

    return (
        <Dialog
            fullWidth
            maxWidth='md'
            open={open}
            onClose={handleClose}
            scroll={'paper'}
            TransitionComponent={TransitionRight}
        >
            <DialogTitle>Admin Route</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Button
                        fullWidth
                        onClick={() => directTo('/admin/type')}
                    >
                        Testing
                    </Button>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default AdminRouteDialog