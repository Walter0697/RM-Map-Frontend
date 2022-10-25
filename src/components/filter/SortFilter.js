import React, { useMemo } from 'react'
import { Grid } from '@mui/material'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'

import sorts from '../../scripts/search/sort'

function SortFilter({
    sortList,
    openSortModel,
}) {
    const displaySort = useMemo(() => {
        if (sortList.length !== 0) {
            return sortList.map((s) => {
                return sorts.getDescriptionBySortObject(s)
            })
        }
        return ['No Sorting Instruction']
    }, [sortList])

    return (
        <FilterContainer
            onClickHandler={openSortModel}
        >
            <FilterTitle
                title={'Sorting'}
            />
            <FilterBorder />
            <Grid container>
                <Grid item xs={12}>
                    <div style={{
                        height: 'auto',
                        width: '95%',
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '10px',
                        marginLeft: '2.5%',
                        marginRight: '2.5%',
                        overflowX: 'auto',
                    }}>
                        {displaySort.map((sort, index) => (
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
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {sort}
                            </div>
                        ))}
                    </div>
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default SortFilter