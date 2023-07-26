import React from 'react'
import {
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
// import {
//     LocalizationProvider,
//     DateTimePicker,
// } from '@mui/lab'
// import AdapterDateFns from '@mui/lab/AdapterDateFns'

import ClearIcon from '@mui/icons-material/Clear'

function NullableDatePicker({
    label,
    value,
    required,
    noPast,
    onValueChange,
    errorMessage,
}) {

    const clearDate = () => {
        onValueChange(null)
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
                slotProps={{ textField: { fullWidth: true } }}
                renderInput={(props) => (
                    <TextField 
                        {...props} 
                        fullWidth
                        required={required}
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
                            )),
                        }}
                    />
                )}
                minDate={noPast ? new Date() : null}
                label={label}
                value={value}
                onChange={onValueChange}
            />
        </LocalizationProvider>
    )
}

export default NullableDatePicker