import React from 'react'
import {
    Button
} from '@mui/material'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'

function TravelPlansButton({
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
            }}
            onClick={onClickHandler}
        >
            <FlightTakeoffIcon sx={{ marginRight: '15px' }} /> Travel Plans
        </Button>
    )
}

export default TravelPlansButton
