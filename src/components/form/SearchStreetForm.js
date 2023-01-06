import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    TextField,
} from '@mui/material'

import countryFlagEmoji from 'country-flag-emoji'
import AsyncSelect from 'react-select/async'

import BaseForm from './BaseForm'

import apis from '../../apis'

function SearchStreetForm({
    open,
    handleClose,
    filtercountry,
    onFinished,
}) {
    const mappedCountryList = countryFlagEmoji.list.map(s => {
        return {
            ...s,
            lowerName: s.name.toLowerCase(),
            lowerCode: s.code.toLowerCase(),
        }
    })
    const [ selectedCountry, setCountry ] = useState('HK')

    const [ streetName, setStreetName ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (filtercountry && filtercountry.countryCode) {
            const country = mappedCountryList.find(s => s.code === filtercountry.countryCode)
            setCountry({
                label: `${country.emoji} ${country.name}`,
                value: country.code,
            })
        }
    }, [filtercountry])
    
    const onSearchHandler = async () => {
        setLoading(true)
        const number = parseInt(streetName)
        const name = streetName.replace(number, '').trim().replaceAll(' ', '%20')
        const result = await apis.maps.geocode(number, name, selectedCountry.value)
        if (result.data.results.length === 0) {
            setAlertMessage({ type: 'warning', message: 'Cannot find any result' })
        } else {
            const location = result.data.results[0]
            const address = location.address.freeformAddress ?? streetName
            const lonlat = location.position
            onFinished(lonlat, address)
        }
        setLoading(false)
    }

    const loadCountryOptions = (
        inputValue,
        callback
      ) => {
          const lower = inputValue.toLowerCase()
          const filtered = mappedCountryList.filter(s => s.lowerCode.includes(lower) || s.lowerName.includes(lower))
          const sublist = filtered.splice(0, 5)
          const output = sublist.map(s => {
              return {
                  label: `${s.emoji} ${s.name}`,
                  value: s.code,
              }
          })
          callback(output)
    }

    const setCountryFromSelect = (e) => {
        setCountry(e)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Search By Street Name'}
            maxWidth={'lg'}
            handleSubmit={onSearchHandler}
            cancelText={'Cancel'}
            createText={'Search'}
            loading={loading}
            alertMessage={alertMessage}
            clearAlertMessage={() => setAlertMessage(null)}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                    <AsyncSelect 
                        cacheOptions
                        defaultOptions
                        value={selectedCountry}
                        onChange={setCountryFromSelect}
                        loadOptions={loadCountryOptions} 
                        menuPortalTarget={document.body} 
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
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
        </BaseForm>
    )
}

export default connect(state => ({
    filtercountry: state.marker.filtercountry
})) (SearchStreetForm)