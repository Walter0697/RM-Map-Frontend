import React from 'react'
import {
    Box,
    Button,
    Typography,
} from '@mui/material'

function SectionHeader({
    icon,
    title,
}) {
    return (
        <Button
            size='large'
            style={{
                backgroundColor: '#bbe9ff',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
            }}
        >
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    paddingTop: '6px',
                }}
            >
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </span>
                <Typography component='span'>
                    {title}
                </Typography>
            </Box>
        </Button>
    )
}

export default SectionHeader