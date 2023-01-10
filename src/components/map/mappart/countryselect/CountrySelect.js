import React, { useState, useMemo, useEffect } from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
    Button,
} from '@mui/material'

import countryFlagEmoji from 'country-flag-emoji'

import actions from '../../../../store/actions'
import CountryCodeSelect from './CountryCodeSelect'
import CountryPartSelect from './CountryPartSelect'

function CountrySelect({
    countrycodes,
    countryparts,
    filtercountry,
    dispatch,
}) {
    const location = useLocation()

    const [ countryCodeOpen, setCountryCodeOpen ] = useState(false)
    const [ countryPartOpen, setCountryPartOpen ] = useState(false)

    const displayPartName = useMemo(() => {
        if (filtercountry) {
            if (filtercountry.countryPart.type === 'all') {
                return 'All Areas'
            }
            return filtercountry.countryPart.name
        }
        return ''
    }, [filtercountry])

    useEffect(() => {
        setCountryCodeOpen(false)
        setCountryPartOpen(false)
    }, [location.pathname])

    useEffect(() => {
        if (!filtercountry) {
            if (countrycodes && countrycodes.length !== 0) {
                const data = {
                    countryCode: countrycodes[0].country_code,
                    countryPart: {
                        type: 'all',
                    }
                }

                dispatch(actions.resetFilterCountry(data))
            }
        }
    }, [countrycodes, countryparts, filtercountry])

    const onCountryCodeClick = () => {
        setCountryPartOpen(false)
        setCountryCodeOpen(prev => !prev)
    }

    const onCountryPartClick = () => {
        setCountryCodeOpen(false)
        setCountryPartOpen(prev => !prev)
    }

    const emoji = countryFlagEmoji.get(filtercountry?.countryCode ?? 'HK')

    return (
        <>
            <div
                style={{
                    backgroundColor: '#83c0ff',
                    color: '#0808c1',
                    height: '50px',
                    width: '60vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '5px',
                    backfaceVisibility: 'hidden',
                }}
            >
                <Button 
                    style={{
                        width: '30%',
                        padding: '3px',
                        paddingRight: '0px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'auto',
                    }}
                    onClick={onCountryCodeClick}
                >
                    <div style={{
                        height: '30px',
                        width: '90%',
                        backgroundColor: '#33333311',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>{emoji && emoji.emoji}</div>
                </Button>
                <Button 
                    style={{
                        width: '70%',
                        padding: '3px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'auto',
                    }}
                    onClick={onCountryPartClick}
                >
                    <div style={{
                        height: '30px',
                        width: '90%',
                        backgroundColor: '#33333311',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>{displayPartName}</div>
                </Button>
            </div>  
            
            <CountryCodeSelect 
                open={countryCodeOpen}
                setClose={() => setCountryCodeOpen(false)}
            />
            <CountryPartSelect
                open={countryPartOpen}
                setClose={() => setCountryPartOpen(false)}
            />
        </>
    )
}

export default connect(state => ({
    countrycodes: state.marker.countrycodes,
    countryparts: state.marker.countryparts,
    filtercountry: state.marker.filtercountry,

})) (CountrySelect)