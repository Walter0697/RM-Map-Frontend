import React from 'react'
import { Badge, Button } from '@mui/material'
import FactCheckIcon from '@mui/icons-material/FactCheck'

function PendingSocialAnalysisButton({ onClickHandler, count = 0 }) {
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
            }}
            onClick={onClickHandler}
        >
            <Badge color='error' badgeContent={count > 0 ? count : 0} invisible={count === 0}>
                <FactCheckIcon />
            </Badge>
            Pending Markers
        </Button>
    )
}

export default PendingSocialAnalysisButton
