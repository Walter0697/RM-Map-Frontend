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
                title={'Script'}
            />
            <FilterBorder />
        </FilterContainer>
    )
}

export default ScriptFilter