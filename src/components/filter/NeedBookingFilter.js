import React, { useState } from 'react'
import { Grid } from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'
import FilterButton from './FilterButton'
import FilterLinkButton from './FilterLinkButton'

import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'

function NeedBookingFilter({
    bookingStatus,
    setBookingStatus,
}) {
    const onFilterClick = (value) => {
        value
        setBookingStatus(value)
    }

    return (
        <FilterContainer
            isSmall
        >
            <FilterTitle
                title={'Required Booking'}
            />
            <FilterBorder />
            <Grid container>
                <Grid item xs={12}>
                    <FilterLinkButton 
                        buttonList={[{
                            icon: (<LocalPhoneIcon />),
                            text: 'Booking',
                            value: 'booking',
                        }, {
                            icon: (<DirectionsWalkIcon />),
                            text: 'Walkin',
                            value: 'walkin',
                        }]}
                        currentStatus={bookingStatus}
                        onClickHandler={onFilterClick}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FilterButton 
                        icon={(<HighlightOffIcon />)}
                        text={'No Filter'}
                        isActive={!bookingStatus}
                        onClickHandler={() => setBookingStatus(null)}
                    />
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default NeedBookingFilter