import React from 'react'
import { Button } from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'

function RecipeButton({
    onClickHandler,
}) {
    return (
        <Button
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#9fe1c7',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                color: '#216b4b',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                paddingLeft: '12px',
                paddingRight: '12px',
            }}
            onClick={onClickHandler}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RestaurantMenuIcon />
                Recipe Book
            </span>
        </Button>
    )
}

export default RecipeButton
