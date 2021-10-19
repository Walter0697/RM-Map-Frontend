import React from 'react'
import {
    Select,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
} from '@mui/material'

function Selectable({
    label,
    value,
    onValueChange,
    errorMessage,
    noDefault,
    defaultSelectValue,
    defaultSelectText,
    list,
    valueKey,
    textKey,
}) {
    return (
        <FormControl variant="outlined" fullWidth>
            <InputLabel id={'select-' + label} error={!!errorMessage}>{label}</InputLabel>
            <Select
                label={label}
                labelId={'select-' + label}
                id={'selector-' + label}
                value={value}
                fullWidth
                onChange={onValueChange}
                error={!!errorMessage}
            >
                { !noDefault && 
                    <MenuItem value={defaultSelectValue}>{defaultSelectText}</MenuItem>
                }
                {list.map((item, index) => (
                    <MenuItem value={item[valueKey]} key={index}>{item[textKey]}</MenuItem>
                ))}
            </Select>
            {errorMessage && (
                <FormHelperText htmlFor={'selector-' + label} error={!!errorMessage}>
                    {errorMessage}
                </FormHelperText>
            )}
        </FormControl>
    )
}

export default Selectable