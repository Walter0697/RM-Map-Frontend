import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import SignpostOutlinedIcon from '@mui/icons-material/SignpostOutlined'
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined'

import countryFlagEmoji from 'country-flag-emoji'
import AsyncSelect from 'react-select/async'

import BaseForm from './BaseForm'

import apis from '../../apis'

function SearchLocationForm({
    open,
    handleClose,
    filtercountry,
    initialMethod,
    onFinished,
}) {
    const mappedCountryList = countryFlagEmoji.list.map((item) => ({
        ...item,
        lowerName: item.name.toLowerCase(),
        lowerCode: item.code.toLowerCase(),
    }))

    const [ method, setMethod ] = useState(initialMethod || 'street')
    const [ selectedCountry, setCountry ] = useState({ label: '🇭🇰 Hong Kong', value: 'HK' })
    const [ streetName, setStreetName ] = useState('')
    const [ latlonCode, setLatLonCode ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (!open) return
        setMethod(initialMethod || 'street')
    }, [open, initialMethod])

    useEffect(() => {
        if (!filtercountry || !filtercountry.countryCode) return
        const country = mappedCountryList.find((item) => item.code === filtercountry.countryCode)
        if (!country) return
        setCountry({
            label: `${country.emoji} ${country.name}`,
            value: country.code,
        })
    }, [filtercountry])

    const loadCountryOptions = (inputValue, callback) => {
        const lower = `${inputValue || ''}`.toLowerCase()
        const filtered = mappedCountryList.filter((item) => (
            item.lowerCode.includes(lower) || item.lowerName.includes(lower)
        ))
        const options = filtered.slice(0, 5).map((item) => ({
            label: `${item.emoji} ${item.name}`,
            value: item.code,
        }))
        callback(options)
    }

    const onSearchStreet = async () => {
        const trimmed = `${streetName || ''}`.trim()
        if (!trimmed) {
            setAlertMessage({ type: 'warning', message: 'Street name cannot be empty' })
            return
        }

        const number = parseInt(trimmed)
        const name = trimmed.replace(number, '').trim().replaceAll(' ', '%20')
        const countryCode = selectedCountry?.value || 'HK'
        const result = await apis.maps.geocode(number, name, countryCode)
        const list = result?.data?.results || []

        if (list.length === 0) {
            setAlertMessage({ type: 'warning', message: 'Cannot find any result' })
            return
        }

        const location = list[0]
        const address = location?.address?.freeformAddress || trimmed
        onFinished(location.position, address, 'street')
    }

    const onSearchLatLon = () => {
        const raw = `${latlonCode || ''}`.trim()
        const code = raw.split(',')

        if (code.length !== 2) {
            setAlertMessage({ type: 'warning', message: 'Use format: lat,lon' })
            return
        }

        const lat = code[0].trim()
        const lon = code[1].trim()
        const latNum = Number(lat)
        const lonNum = Number(lon)

        if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
            setAlertMessage({ type: 'warning', message: 'Latitude/Longitude must be numbers' })
            return
        }

        onFinished({ lat, lon }, '', 'latlon')
    }

    const onSearchHandler = async () => {
        setLoading(true)
        try {
            if (method === 'street') {
                await onSearchStreet()
            } else {
                onSearchLatLon()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Search Location'}
            maxWidth={'lg'}
            handleSubmit={onSearchHandler}
            cancelText={'Cancel'}
            createText={'Search'}
            loading={loading}
            alertMessage={alertMessage}
            clearAlertMessage={() => setAlertMessage(null)}
        >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={method}
                    exclusive
                    onChange={(_, value) => {
                        if (value) setMethod(value)
                    }}
                    size='small'
                    sx={{
                        backgroundColor: '#f3f6fb',
                        borderRadius: '999px',
                        p: 0.5,
                        '& .MuiToggleButton-root': {
                            border: 'none',
                            borderRadius: '999px',
                            px: 2,
                            py: 0.75,
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#4a5b73',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                        },
                        '& .Mui-selected': {
                            backgroundColor: '#11abdb !important',
                            color: '#fff !important',
                            boxShadow: '0 2px 8px rgba(17,171,219,0.35)',
                        },
                    }}
                >
                    <ToggleButton value='street'>
                        <SignpostOutlinedIcon sx={{ fontSize: 18 }} />
                        Street Name
                    </ToggleButton>
                    <ToggleButton value='latlon'>
                        <PinDropOutlinedIcon sx={{ fontSize: 18 }} />
                        Lat, Lon
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {method === 'street' ? (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <div style={{ width: '100%' }}>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                value={selectedCountry}
                                onChange={(value) => setCountry(value)}
                                loadOptions={loadCountryOptions}
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            size='medium'
                            fullWidth
                            label='Street Name'
                            value={streetName}
                            onChange={(e) => setStreetName(e.target.value)}
                        />
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            size='medium'
                            fullWidth
                            label='LatLon Code (lat,lon)'
                            value={latlonCode}
                            onChange={(e) => setLatLonCode(e.target.value)}
                        />
                    </Grid>
                </Grid>
            )}
        </BaseForm>
    )
}

export default connect((state) => ({
    filtercountry: state.marker.filtercountry,
}))(SearchLocationForm)
