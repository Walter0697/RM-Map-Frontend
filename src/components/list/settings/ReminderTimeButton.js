import React from 'react'
import { Button } from '@mui/material'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'

function ReminderTimeButton({
    reminderTime,
    onClickHandler,
}) {
    return (
        <Button
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#48acdb',
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
            onClick={onClickHandler}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <AccessAlarmIcon />
                RoroadBot Reminder Time ({reminderTime || '09:00'})
            </span>
        </Button>
    )
}

export default ReminderTimeButton
