import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { Grid } from '@mui/material'

import ImageHeadText from '../wrapper/ImageHeadText'
import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'

function EventTypeFilter({
    eventtypes,
    selectedEventTypes,
    toggleEventType,
}) {
    const displayEventTypes = useMemo(() => {
        return eventtypes.filter(s => !s.hidden).map(s => ({
            icon: process.env.REACT_APP_IMAGE_LINK + s.icon_path,
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
                    marginTop: '10px',
                    height: '120px',
                    width: '100%',
                    overflowY: 'auto',
                    padding: '10px',
                }}
            >
                {displayEventTypes.map((item, index) => (
                    <Grid item
                        xs={4}
                        fullWidth
                        key={index}
                        style={{
                            padding: '4px',
                            height: '40px',
                        }}    
                    >
                        <div 
                            style={{
                                height: '100%',
                                width: '100%',
                                backgroundColor: selectedEventTypes.includes(item.value) ? '#21cebd' : '#bcddda',
                                border: selectedEventTypes.includes(item.value) ? 'thin solid #1ca4ff' : 'thin solid black',
                                borderRadius: '5px',
                                paddingTop: '2px',
                                paddingLeft: '2px',
                            }}
                            onClick={() => toggleEventType(item.value)}
                        >
                            <ImageHeadText
                                iconPath={item.icon}
                                iconSize='20px'
                                label={item.label}
                                labelSize='12px'
                            />
                        </div>
                    </Grid>
                ))}
            </Grid>
        </FilterContainer>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (EventTypeFilter)