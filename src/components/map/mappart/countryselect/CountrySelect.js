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
    const selectorWidth = '100%'
    const selectorMaxWidth = '100%'
    const codeButtonWidth = '32%'
    const partButtonWidth = '68%'

    // Dropdown interaction is driven by explicit open/closed state hooks.
    const [ countryCodeOpen, setCountryCodeOpen ] = useState(false)
    const [ countryPartOpen, setCountryPartOpen ] = useState(false)

    const displayPartName = useMemo(() => {
        if (filtercountry) {
            if (filtercountry.countryPart.type === 'viewport') {
                return 'In View'
            }
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
        <div
            data-testid='country-select-root'
            style={{
                position: 'relative',
                pointerEvents: 'none',
                width: selectorWidth,
                maxWidth: selectorMaxWidth,
            }}
        >
            <div
                style={{
                    backgroundColor: '#83c0ff',
                    color: '#0808c1',
                    height: '50px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '5px',
                    backfaceVisibility: 'hidden',
                }}
            >
                <Button 
                    data-testid='country-code-trigger'
                    style={{
                        width: codeButtonWidth,
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
                    data-testid='country-part-trigger'
                    style={{
                        width: partButtonWidth,
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
                menuWidth={selectorWidth}
                menuMaxWidth={selectorMaxWidth}
            />
            <CountryPartSelect
                open={countryPartOpen}
                setClose={() => setCountryPartOpen(false)}
                menuWidth={selectorWidth}
                menuMaxWidth={selectorMaxWidth}
            />
        </div>
    )
}

export default connect(state => ({
    countrycodes: state.marker.countrycodes,
    countryparts: state.marker.countryparts,
    filtercountry: state.marker.filtercountry,

})) (CountrySelect)
