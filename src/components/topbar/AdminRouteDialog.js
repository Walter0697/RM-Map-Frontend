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

function RouteBox({
    label,
    route,
    directTo,
}) {
    return (
        <Button
            fullWidth
            onClick={() => directTo(route)}
        >
            {label}
        </Button>
    )
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
                    <RouteBox label='type' route='/admin/type' directTo={directTo}/>
                    <RouteBox label='pin' route='/admin/pin' directTo={directTo}/>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

export default AdminRouteDialog