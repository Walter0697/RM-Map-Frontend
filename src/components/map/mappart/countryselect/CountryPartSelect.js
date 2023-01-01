import React, { useMemo, useEffect } from 'react'
import countryFlagEmoji from 'country-flag-emoji'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import actions from '../../../../store/actions'

function CountryPartOption({
    isSelected,
    countryPartName,
    onClick,
}) {
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
                    width: '90%',
                    backgroundColor: isSelected ? '#33333399' : '#33333311',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '5px',
                }}
                onClick={() => onClick(countryPartName)}
            >
                {countryPartName}
            </div>
        </div>
    )
}

function CountryPartSelect({
    open,
    setClose,
    countryparts,
    filtercountry,
    dispatch,
}) {
    const selectableParts = useMemo(() => {
        const selectedCountryCode = filtercountry.countryCode
        if (selectedCountryCode) {
            if (countryparts[selectedCountryCode]) {
                return countryparts[selectedCountryCode]
            }
        }

        return []
    }, [filtercountry, countryparts])

    const maxHeight = useMemo(() => {
        if (selectableParts.length + 1 > 10) {
            return 450
        }
        return (selectableParts.length + 1) * 45
    }, [selectableParts])

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

    const onAllAreaClick = () => {
        const data = JSON.parse(JSON.stringify(filtercountry))
        data.countryPart = {
            type: 'all',
        }
        dispatch(actions.resetFilterCountry(data))
        setClose()
    }

    const onCountryPartClick = (code) => {
        const data = JSON.parse(JSON.stringify(filtercountry))
        data.countryPart = {
            type: 'part',
            name: code,
        }
        dispatch(actions.resetFilterCountry(data))
        setClose()
    }

    const selectedCountryPart = useMemo(() => {
        if (filtercountry) {
            if (filtercountry.countryPart) {
                if (filtercountry.countryPart.type !== 'all') {
                    return filtercountry.countryPart.name
                }
            }
        }
        return null
    }, [filtercountry])

    return (
        <animated.div
            style={{
                backgroundColor: '#83c0ff',
                color: '#0808c1',
                position: 'absolute',
                right: '0px',
                top: '60px',
                height: listHeight,
                opacity: listOpacity,
                width: '55vw',
                borderRadius: '5px',
                overflow: 'auto',
                pointerEvents: 'auto',
            }}
        >
            <CountryPartOption 
                    isSelected={!selectedCountryPart}
                    countryPartName={'All Areas'}
                    onClick={onAllAreaClick}
                />
            {selectableParts.map((option, index) => (
                <CountryPartOption 
                    key={option + 'option'}
                    isSelected={option === selectedCountryPart}
                    countryPartName={option}
                    onClick={onCountryPartClick}
                />
            ))}
        </animated.div>
    )
}

export default connect(state => ({
    countryparts: state.marker.countryparts,
    filtercountry: state.marker.filtercountry,

})) (CountryPartSelect)