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
                renderInput={(params) => {
                    const pickerEndAdornment = params?.InputProps?.endAdornment
                    return (
                        <TextField 
                            {...params} 
                            fullWidth
                            required={required}
                            error={!!errorMessage}
                            helperText={errorMessage}
                            sx={{
                                '& .MuiInputBase-input': {
                                    textAlign: 'left',
                                },
                            }}
                            inputProps={{
                                ...params?.inputProps,
                                style: {
                                    ...(params?.inputProps?.style || {}),
                                    textAlign: 'left',
                                },
                            }}
                            InputProps={{
                                ...params?.InputProps,
                                endAdornment: (
                                    <>
                                        {value && (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onClick={clearDate}
                                                    edge='end'
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )}
                                        {pickerEndAdornment}
                                    </>
                                ),
                            }}
                        />
                    )
                }}
                disablePast={!!noPast}
                ampm={false}
                label={label}
                value={value || null}
                onChange={onValueChange}
            />
        </LocalizationProvider>
    )
}

export default NullableDatePicker
