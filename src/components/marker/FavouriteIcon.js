import React from 'react'

import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

import CircleIconButton from '../field/CircleIconButton'

function FavouriteIcon({
    active,
    onClickHandler,
}) {
    return (
        <CircleIconButton
            onClickHandler={onClickHandler}
        >
            { active ? <StarIcon /> : <StarBorderIcon /> }
        </CircleIconButton>
    )
}

export default FavouriteIcon