import React, { useMemo, useEffect } from 'react'
import countryFlagEmoji from 'country-flag-emoji'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import actions from '../../../../store/actions'

function CountryCodeOption({
    isSelected,
    countryCode,
    countryName,
    onClick,
}) {
    const emoji = countryFlagEmoji.get(countryCode)
    return (
        <div
            style={{
                height: '40px',
                width: '100%',
                paddingTop: '5px',
                paddingLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '5px',
            }}
        >
            <div 
                style={{
                    height: '30px',
                    width: '30%',
                    backgroundColor: isSelected ? '#33333399' : '#33333311',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '5px',
                }}
                onClick={() => onClick(countryCode)}
            >
                {emoji && emoji.emoji}
            </div>
            <div 
                style={{
                    height: '30px',
                    paddingLeft: '10px',
                    width: '60%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    borderRadius: '5px',
                }}
            >{countryName}</div>
        </div>
    )
}

function CountryCodeSelect({
    open,
    setClose,
    countrycodes,
    filtercountry,
    dispatch,
}) {

    const maxHeight = useMemo(() => {
        if (countrycodes.length > 10) { 
            return 450
        }
        return countrycodes.length * 45
    }, [countrycodes])

    const { listHeight, listOpacity } = useSpring({
        config: config.wobbly,
        from: {
            listHeight: 0,
            listOpacity: 0,
        },
        to: {
            listHeight: ( open ) ? maxHeight : 0,
            listOpacity: ( open ) ? 1 : 0,
        },
    })

    const onCountryCodeClick = (code) => {
        const data = {
            countryCode: code,
            countryPart: {
                type: 'all',
            }
        }
        dispatch(actions.resetFilterCountry(data))
        setClose()
    }

    return (
        <animated.div
            style={{
                backgroundColor: '#83c0ff',
                color: '#0808c1',
                position: 'absolute',
                top: '60px',
                height: listHeight,
                opacity: listOpacity,
                width: '55vw',
                borderRadius: '5px',
                pointerEvents: open ? 'auto' : 'none',
                overflow: 'auto'
            }}
        >
            {countrycodes.map((code, index) => (
                <CountryCodeOption 
                    key={code.country_code}
                    isSelected={code.country_code === filtercountry?.countryCode}
                    countryCode={code.country_code}
                    countryName={code.country_name}
                    onClick={onCountryCodeClick}
                />
            ))}
        </animated.div>
    )
}

export default connect(state => ({
    countrycodes: state.marker.countrycodes,
    filtercountry: state.marker.filtercountry,

})) (CountryCodeSelect)