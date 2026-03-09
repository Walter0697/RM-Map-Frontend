import React from 'react'
import Grid from '@mui/material/GridLegacy'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'
import FilterButton from './FilterButton'

import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'

function NeedBookingFilter({
    bookingStatus,
    setBookingStatus,
}) {
    return (
        <FilterContainer
            isSmall
        >
            <FilterTitle
                title={'Required Booking'}
            />
            <FilterBorder />
            <Grid container spacing={1} sx={{ px: 1, pt: 0.5 }}>
                <Grid item xs={4}>
                    <FilterButton 
                        icon={(<LocalPhoneIcon />)}
                        showText={false}
                        tooltipText={'Booking'}
                        isActive={bookingStatus === 'booking'}
                        onClickHandler={() => setBookingStatus('booking')}
                    />
                </Grid>
                <Grid item xs={4}>
                    <FilterButton 
                        icon={(<DirectionsWalkIcon />)}
                        showText={false}
                        tooltipText={'Walkin'}
                        isActive={bookingStatus === 'walkin'}
                        onClickHandler={() => setBookingStatus('walkin')}
                    />
                </Grid>
                <Grid item xs={4}>
                    <FilterButton 
                        icon={(<HighlightOffIcon />)}
                        showText={false}
                        tooltipText={'No Filter'}
                        isActive={!bookingStatus}
                        onClickHandler={() => setBookingStatus(null)}
                    />
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default NeedBookingFilter
