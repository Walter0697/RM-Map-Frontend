import React from 'react'
import Grid from '@mui/material/GridLegacy'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'
import FilterButton from './FilterButton'

import StarIcon from '@mui/icons-material/Star'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

function AttributeFilter({
    selectedAttribute,
    toggleAttribute,
}) {
    return (
        <FilterContainer
            isSmall
        >
            <FilterTitle
                title={'Attribute'}
            />
            <FilterBorder />
            <Grid container spacing={1} sx={{ px: 1, pt: 0.5 }}>
                <Grid item xs={4}>
                    <FilterButton 
                        icon={(<StarIcon />)}
                        showText={false}
                        tooltipText={'Favourite'}
                        isActive={selectedAttribute.includes('favourite')}
                        onClickHandler={() => toggleAttribute('favourite')}
                    />
                </Grid>
                <Grid item xs={4}>
                    <FilterButton 
                        icon={(<CalendarMonthIcon />)}
                        showText={false}
                        tooltipText={'Timed'}
                        isActive={selectedAttribute.includes('timed')}
                        onClickHandler={() => toggleAttribute('timed')}
                    />
                </Grid>
                <Grid item xs={4}>
                    <FilterButton 
                        icon={(<AccessAlarmIcon />)}
                        showText={false}
                        tooltipText={'Hurry'}
                        isActive={selectedAttribute.includes('hurry')}
                        onClickHandler={() => toggleAttribute('hurry')}
                    />
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default AttributeFilter
