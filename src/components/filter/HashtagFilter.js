import React, { useMemo } from 'react'
import { Grid } from '@mui/material'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'

function HashtagFilter({
    selectedHashtag,
    openHashtagModal,
}) {
    const displayHashTag = useMemo(() => {
        if (selectedHashtag.length !== 0) {
            return selectedHashtag.map(s => '#' + s)
        }
        return ['No Hashtag to filter']
    }, [selectedHashtag])

    return (
        <FilterContainer
            onClickHandler={openHashtagModal}
        >
            <FilterTitle
                title={'Hashtag'}
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
                        overflowY: 'auto',
                    }}>
                        {displayHashTag.map((hashtag, index) => (
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
                            >{hashtag}</div>
                        ))}
                    </div>
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default HashtagFilter