import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'

import FilterAltIcon from '@mui/icons-material/FilterAlt'

import CircleIconButton from '../field/CircleIconButton'

function FilterCircleButton({
    redirectPath,
    filterlist,
}) {
    const history = useHistory()

    const isFilterEmpty = (filters) => {
        if (!filters) return true
        if (Object.keys(filters).length === 0) return true

        let list = Object.keys(filters)
        for (let i = 0; i < list.length; i++) {
            const current = filters[list[i]]
            if (!current) {
                continue
            }

            if (typeof current === 'object') {
                if (current.length !== 0) {
                    return false
                }
            } else if (typeof current === 'string') {
                return false
            }
        }
        return true
    }

    const background = useMemo(() => {
        if (!isFilterEmpty(filterlist)) {
            return 'lightgreen'
        }
        return null
    }, [filterlist])

    return (
        <CircleIconButton
            background={background}
            onClickHandler={() => history.replace(redirectPath)}
        >
            <FilterAltIcon />
        </CircleIconButton>
    )
}

export default connect(state => ({
    filterlist: state.filter.list,
})) (FilterCircleButton)