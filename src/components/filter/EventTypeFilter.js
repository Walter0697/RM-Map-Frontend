import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import Grid from '@mui/material/GridLegacy'
import backend from '../../constant/backend'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'
import FilterButton from './FilterButton'

function EventTypeFilter({
    eventtypes,
    selectedEventTypes,
    toggleEventType,
}) {
    const displayEventTypes = useMemo(() => {
        return eventtypes.filter(s => !s.hidden).map(s => ({
            icon: backend.IMAGE_LINK + s.icon_path,
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
                        xs={3}
                        fullWidth
                        key={index}
                        style={{
                            padding: '4px',
                            height: '44px',
                            marginBottom: '8px',
                        }}    
                    >
                        <FilterButton 
                            imageLink={item.icon}
                            showText={false}
                            tooltipText={item.label}
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
