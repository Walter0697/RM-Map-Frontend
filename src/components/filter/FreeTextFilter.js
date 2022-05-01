import React, { useMemo } from 'react'
import { Grid } from '@mui/material'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'

function FreeTextFilter({
    label,
    openLabelModal,
}) {
    const displayText = useMemo(() => {
        if (label) {
            return label.split('&')
        }
        return []
    }, [label])

    return (
        <FilterContainer
            onClickHandler={openLabelModal}
        >
            <FilterTitle
                title={'Free Text'}
            />
            <FilterBorder />
            <Grid container>
                <Grid item xs={12}>
                    <div style={{
                        height: '50px',
                        width: '95%',
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '2.5%',
                        marginRight: '2.5%',
                        overflowX: 'auto',
                    }}>
                        {displayText.map((text, index) => (
                            <div
                                key={index}
                                style={{
                                    marginRight: '10px',
                                    backgroundColor: '#33333311',
                                    height: '40px',
                                    paddingLeft: '10px',
                                    paddingRight: '10px',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >{text}</div>
                        ))}
                    </div>
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default FreeTextFilter