import React, { useMemo } from 'react'
import { Grid } from '@mui/material'

import FilterContainer from './FilterContainer'
import FilterTitle from './FilterTitle'
import FilterBorder from './FilterBorder'

function ScriptFilter({
    scripts,
    openScriptModal,
}) {
    return (
        <FilterContainer
            onClickHandler={openScriptModal}
        >
            <FilterTitle
                title={'Query Script'}
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
                        <div
                            style={{
                                marginRight: '10px',
                                backgroundColor: '#33333311',
                                paddingTop: '10px',
                                paddingBottom: '10px',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >{scripts ? scripts : 'No Query Script filtering...'}</div>
                    </div>
                </Grid>
            </Grid>
        </FilterContainer>
    )
}

export default ScriptFilter