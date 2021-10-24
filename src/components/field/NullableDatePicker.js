import React from 'react'
import {
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material'
import {
    LocalizationProvider,
    DateTimePicker,
} from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns'

import ClearIcon from '@mui/icons-material/Clear'

function NullableDatePicker({
    label,
    value,
    onValueChange,
    errorMessage,
}) {

    const clearDate = () => {
        onValueChange(null)
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
                renderInput={(props) => (
                    <TextField 
                        {...props} 
                        fullWidth
                        error={!!errorMessage}
                        helperText={errorMessage}
                        InputProps={{
                            endAdornment: (value && (
                                <InputAdornment position='end'>
                                    <IconButton
                                        onClick={clearDate}
                                        edge='end'
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ))
                        }}
                    />
                )}
                fullWidth
                label={label}
                value={value}
                onChange={onValueChange}
            />
        </LocalizationProvider>
    )
}

export default NullableDatePicker