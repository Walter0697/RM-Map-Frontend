import React from 'react'
import {
    Box,
    Select,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
} from '@mui/material'

function Selectable({
    label,
    value,
    required,
    onValueChange,
    errorMessage,
    noDefault,
    defaultSelectValue,
    defaultSelectText,
    list,
    valueKey,
    textKey,
    iconKey,
    iconBaseUrl,
    sx,
}) {
    const toIconSrc = (item) => {
        if (!iconKey || !item) return ''
        const raw = `${item[iconKey] || ''}`.trim()
        if (!raw) return ''
        if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
        if (!iconBaseUrl) return raw
        return `${iconBaseUrl}${raw}`
    }

    return (
        <FormControl variant='outlined' fullWidth sx={sx}>
            <InputLabel id={'select-' + label} error={!!errorMessage}>{label + (required ? ' *' : '')}</InputLabel>
            <Select
                required={required}
                label={label + (required ? ' *' : '')}
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
                { list && list.map((item, index) => {
                    const iconSrc = toIconSrc(item)
                    return (
                        <MenuItem value={item[valueKey]} key={index}>
                            {iconSrc ? (
                                <Box
                                    component='img'
                                    src={iconSrc}
                                    alt=''
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        mr: 1,
                                        objectFit: 'contain',
                                        flexShrink: 0,
                                    }}
                                />
                            ) : null}
                            <span>{item[textKey]}</span>
                        </MenuItem>
                    )
                })}
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
