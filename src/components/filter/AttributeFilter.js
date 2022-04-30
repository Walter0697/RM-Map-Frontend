import React from 'react'
import { Grid } from '@mui/material'

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
            <Grid container>
                <Grid item xs={12}>
                    <FilterButton 
                        icon={(<StarIcon />)}
                        text={'Favourite'}
                        isActive={selectedAttribute.includes('favourite')}
                        onClickHandler={() => toggleAttribute('favourite')}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FilterButton 
                        icon={(<CalendarMonthIcon />)}
                        text={'Timed'}
                        isActive={selectedAttribute.includes('timed')}
                        onClickHandler={() => toggleAttribute('timed')}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FilterButton 
                        icon={(<AccessAlarmIcon />)}
                        text={'Hurry'}
                        isActive={selectedAttribute.includes('hurry')}
                        onClickHandler={() => toggleAttribute('hurry')}
                    />
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default AttributeFilter