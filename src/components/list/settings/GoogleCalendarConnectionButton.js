import React from 'react'
import { Button } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LinkOffIcon from '@mui/icons-material/LinkOff'

function GoogleCalendarConnectionButton({
    connected,
    loading,
    onConnect,
    onDisconnect,
}) {
    const isConnected = !!connected

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                backgroundColor: isConnected ? '#f8b84d' : '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                color: '#1c76d2',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                paddingLeft: '12px',
                paddingRight: '12px',
            }}
            disabled={loading}
            onClick={isConnected ? onDisconnect : onConnect}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {isConnected ? <LinkOffIcon /> : <CalendarTodayIcon />}
                {isConnected ? 'Disconnect Google Calendar' : 'Connect Google Calendar'}
            </span>
        </Button>
    )
}

export default GoogleCalendarConnectionButton
