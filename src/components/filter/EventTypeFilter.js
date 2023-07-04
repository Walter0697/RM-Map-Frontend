import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { Grid } from '@mui/material'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'
import FilterButton from './FilterButton'

import constants from '../../constant'

function EventTypeFilter({
    eventtypes,
    selectedEventTypes,
    toggleEventType,
}) {
    const displayEventTypes = useMemo(() => {
        return eventtypes.filter(s => !s.hidden).map(s => ({
            icon: constants.BackendImageLink + s.icon_path,
            label: s.label,
            value: s.value,
        }))
    }, [eventtypes])

    return (
        <FilterContainer>
            <FilterTitle 
                title={'Event Types'}
            />
            <FilterBorder />
            <Grid container fullWidth
                style={{
                    height: '130px',
                    width: '100%',
                    overflowY: 'auto',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                }}
            >
                {displayEventTypes.map((item, index) => (
                    <Grid item
                        xs={6}
                        fullWidth
                        key={index}
                        style={{
                            padding: '4px',
                            height: '50px',
                            marginBottom: '10px',
                        }}    
                    >
                        <FilterButton 
                            imageLink={item.icon}
                            text={item.label}
                            isActive={selectedEventTypes.includes(item.value)}
                            onClickHandler={() => toggleEventType(item.value)}
                        />
                    </Grid>
                ))}
            </Grid>
        </FilterContainer>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (EventTypeFilter)