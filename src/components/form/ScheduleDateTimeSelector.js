import React from 'react'
import {
    DateTimePicker,
    LocalizationProvider,
} from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime())
}

function ScheduleDateTimeSelector({
    value,
    onValueChange,
    errorMessage,
}) {
    const selected = isValidDate(value) ? value : null
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
                label='selected time'
                value={selected}
                disablePast
                ampm={false}
                timeSteps={{ minutes: 15 }}
                onChange={(next) => onValueChange(next)}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errorMessage,
                        helperText: errorMessage || 'Choose date and time',
                    },
                }}
            />
        </LocalizationProvider>
    )
}

export default ScheduleDateTimeSelector
