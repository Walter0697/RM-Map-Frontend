import React from 'react'
import {
    Box,
    Paper,
    Stack,
    Typography,
} from '@mui/material'

import AdminTopBar from '../topbar/AdminTopBar'
import AdminNavList from './AdminNavList'
import adminTokens from './adminTokens'

function AdminPageShell({
    title,
    description,
    alertOpen,
    alertMessage,
    actions,
    children,
}) {
    return (
        <>
            <AdminTopBar
                label={title}
                alertOpen={alertOpen}
                alertMessage={alertMessage}
            />
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    px: { xs: 1, sm: 2, md: 3 },
                    py: { xs: 1.5, sm: 2.5 },
                    background: adminTokens.shellBackground,
                }}
            >
                <Box
                    sx={{
                        maxWidth: 1240,
                        mx: 'auto',
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        alignItems='stretch'
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                width: { xs: '100%', md: 250 },
                                borderRadius: adminTokens.borderRadius,
                                border: `1px solid ${adminTokens.panelBorder}`,
                                p: 2,
                                backgroundColor: adminTokens.panelBackground,
                                height: 'fit-content',
                                position: { md: 'sticky' },
                                top: { md: 16 },
                            }}
                        >
                            <Typography
                                variant='subtitle1'
                                sx={{
                                    fontWeight: 700,
                                    color: adminTokens.titleColor,
                                    mb: 1.25,
                                }}
                            >
                                Admin Navigation
                            </Typography>
                            <AdminNavList />
                        </Paper>

                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: adminTokens.sectionGap,
                                animation: 'adminPageEnter 220ms ease-out',
                                '@keyframes adminPageEnter': {
                                    from: {
                                        opacity: 0,
                                        transform: 'translateY(8px)',
                                    },
                                    to: {
                                        opacity: 1,
                                        transform: 'translateY(0)',
                                    },
                                },
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: adminTokens.borderRadius,
                                    border: `1px solid ${adminTokens.panelBorder}`,
                                    p: adminTokens.panelPadding,
                                    backgroundColor: adminTokens.panelBackground,
                                }}
                            >
                                <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    justifyContent='space-between'
                                    alignItems={{ xs: 'flex-start', md: 'center' }}
                                    spacing={1.5}
                                >
                                    <Box>
                                        <Typography
                                            variant='h6'
                                            sx={{
                                                color: adminTokens.titleColor,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {title}
                                        </Typography>
                                        {description ? (
                                            <Typography
                                                variant='body2'
                                                sx={{
                                                    mt: 0.5,
                                                    color: adminTokens.subtitleColor,
                                                }}
                                            >
                                                {description}
                                            </Typography>
                                        ) : null}
                                    </Box>
                                    {actions ? (
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            spacing={1}
                                            sx={{
                                                width: { xs: '100%', md: 'auto' },
                                                '& .admin-action-button': {
                                                    minHeight: adminTokens.minTargetSize,
                                                },
                                            }}
                                        >
                                            {actions}
                                        </Stack>
                                    ) : null}
                                </Stack>
                            </Paper>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: adminTokens.sectionGap,
                                    '& .admin-panel': {
                                        borderRadius: adminTokens.borderRadius,
                                        border: `1px solid ${adminTokens.panelBorder}`,
                                        backgroundColor: adminTokens.panelBackground,
                                    },
                                    '& .admin-action-button': {
                                        minHeight: adminTokens.minTargetSize,
                                        '&:focus-visible': {
                                            outline: '3px solid #0d6efd',
                                            outlineOffset: 2,
                                        },
                                    },
                                    '& .admin-icon-button': {
                                        minWidth: adminTokens.minTargetSize,
                                        minHeight: adminTokens.minTargetSize,
                                        '&:focus-visible': {
                                            outline: '3px solid #0d6efd',
                                            outlineOffset: 2,
                                        },
                                    },
                                    '& .MuiFormControlLabel-root': {
                                        minHeight: adminTokens.minTargetSize,
                                        mr: 2,
                                    },
                                }}
                            >
                                {children}
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </>
    )
}

export default AdminPageShell
