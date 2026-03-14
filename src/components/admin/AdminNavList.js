import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import adminNavItems, { isAdminNavPathActive } from './adminNavItems'

function AdminNavList({ onNavigate }) {
    const history = useHistory()
    const location = useLocation()

    const onRouteClick = (path) => {
        history.replace(path)
        onNavigate && onNavigate()
    }

    return (
        <Stack spacing={1.25}>
            {adminNavItems.map((item) => {
                const active = isAdminNavPathActive(location.pathname, item.path)
                return (
                    <Button
                        key={item.path}
                        className='admin-action-button'
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => onRouteClick(item.path)}
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            px: 1.5,
                            py: 1,
                            minHeight: 48,
                            transition: 'all 180ms ease',
                        }}
                    >
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant='subtitle2'>
                                {item.label}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                {item.description}
                            </Typography>
                        </Box>
                        <ArrowForwardIcon />
                    </Button>
                )
            })}
        </Stack>
    )
}

export default AdminNavList
