import React from 'react'
import {
    Button,
} from '@mui/material'

function BookmarkButton({
    onClickHandler,
    children,
}) {
    return (
        <Button
            style={{
                backgroundColor: 'white',
                boxShadow: '2px 2px 6px',
                color: 'black',
            }}
            onClick={onClickHandler}
        >
            {children}
        </Button>
    )
}

export default BookmarkButton