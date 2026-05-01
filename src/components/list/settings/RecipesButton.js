import React from 'react'
import { Button } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'

function RecipesButton({
    onClickHandler,
}) {
    return (
        <Button
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                color: '#1c76d2',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                paddingLeft: '12px',
                paddingRight: '12px',
            }}
            onClick={onClickHandler}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <MenuBookIcon />
                Saved Recipes
            </span>
        </Button>
    )
}

export default RecipesButton
