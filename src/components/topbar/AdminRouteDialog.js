import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Slide,
    Stack,
    Typography,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { isAdminNavPathActive } from '../admin/adminNavItems'

const TransitionRight = (props) => {
    return <Slide {...props} direction='right' />
}

function RouteBox({
    label,
    description,
    route,
    directTo,
    active,
}) {
    return (
        <Button
            fullWidth
            className='admin-action-button'
            variant={active ? 'contained' : 'outlined'}
            color={active ? 'primary' : 'inherit'}
            onClick={() => directTo(route)}
            sx={{
                justifyContent: 'space-between',
                px: 2,
                py: 1.25,
                borderRadius: 1.5,
                textTransform: 'none',
            }}
        >
            <Box sx={{ textAlign: 'left' }}>
                <Typography variant='subtitle2'>{label}</Typography>
                <Typography variant='body2' color='text.secondary'>
                    {description}
                </Typography>
            </Box>
            <ArrowForwardIcon />
        </Button>
    )
}

function AdminRouteDialog({
    open,
    handleClose,
}) { 
    const history = useHistory()
    const location = useLocation()

    const directTo = (path) => {
        history.replace(path)
        handleClose()
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
            <DialogTitle sx={{ pb: 0.5 }}>Admin Route</DialogTitle>
            <DialogContent>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Choose a management area. Current route is highlighted.
                </Typography>
                <Stack spacing={1.25}>
                    <RouteBox
                        label='Type'
                        description='Marker type icons and priority'
                        route='/admin/type'
                        active={isAdminNavPathActive(location.pathname, '/admin/type')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='Pin'
                        description='Pin labels, images, and bounds'
                        route='/admin/pin'
                        active={isAdminNavPathActive(location.pathname, '/admin/pin')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='Pin Group'
                        description='Manage reusable pin groups'
                        route='/admin/pin-groups'
                        active={isAdminNavPathActive(location.pathname, '/admin/pin-groups')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='Default Pin'
                        description='Fallback pin assignments'
                        route='/admin/defaultpin'
                        active={isAdminNavPathActive(location.pathname, '/admin/defaultpin')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='API Key'
                        description='Automation client credentials'
                        route='/admin/apikey'
                        active={isAdminNavPathActive(location.pathname, '/admin/apikey')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='Train Station'
                        description='Map image, pins, lines, and JSON export'
                        route='/admin/station'
                        active={isAdminNavPathActive(location.pathname, '/admin/station')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='Permanent Cleanup'
                        description='Search, delete, and schedule cleanup actions'
                        route='/admin/cleanup'
                        active={isAdminNavPathActive(location.pathname, '/admin/cleanup')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='API Usage'
                        description='External API usage summary and trends'
                        route='/admin/api-usage'
                        active={isAdminNavPathActive(location.pathname, '/admin/api-usage')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='System Settings'
                        description='Runtime integration configuration'
                        route='/admin/system-settings'
                        active={isAdminNavPathActive(location.pathname, '/admin/system-settings')}
                        directTo={directTo}
                    />
                    <RouteBox
                        label='Release Notes'
                        description='Draft, edit, and publish release announcements'
                        route='/admin/release-notes'
                        active={isAdminNavPathActive(location.pathname, '/admin/release-notes')}
                        directTo={directTo}
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

export default AdminRouteDialog
