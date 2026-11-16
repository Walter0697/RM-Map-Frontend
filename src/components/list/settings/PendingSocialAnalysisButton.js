import React from 'react'
import { Button } from '@mui/material'
import FactCheckIcon from '@mui/icons-material/FactCheck'

function PendingSocialAnalysisButton({ onClickHandler, count = 0 }) {
    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
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
            <FactCheckIcon />
            Pending Markers
            {count > 0 ? (
                <span
                    aria-label={`${count} pending markers`}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        minWidth: '24px',
                        height: '24px',
                        padding: '0 6px',
                        borderRadius: '999px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        lineHeight: 1,
                    }}
                >
                    {count}
                </span>
            ) : null}
        </Button>
    )
}

export default PendingSocialAnalysisButton
