import React from 'react'
import { Button } from '@mui/material'
import TelegramIcon from '@mui/icons-material/Telegram'

function TalkToRoroadBotButton({
    onClickHandler,
    disabled,
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
            disabled={disabled}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <TelegramIcon />
                Talk to RoroadBot
            </span>
        </Button>
    )
}

export default TalkToRoroadBotButton
