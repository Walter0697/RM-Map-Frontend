import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import PinDropIcon from '@mui/icons-material/PinDrop'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'

import backend from '../../../constant/backend'
import constant from '../../../scripts/constant'

function MarkerGridItem({
    item,
    typeIcon,
    onClickHandler,
}) {
    const [ imageExist, setImageExist ] = useState(false)

    useEffect(() => {
        setImageExist(!!item?.image_link)
    }, [item])

    const shortDescription = (() => {
        const text = item?.description || ''
        if (text.length <= 84) return text
        return `${text.slice(0, 84)}...`
    })()

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
                backgroundColor: constant.StaticColour.CardBackground,
                borderRadius: '8px',
                minHeight: '280px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                padding: '0',
                border: item.status === 'scheduled' ? `3px solid ${constant.StaticColour.ScheduledBorder}` : '',
                alignItems: 'stretch',
                overflow: 'hidden',
            }}
            onClick={onClickHandler}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                }}
            >
                <div
                    style={{
                        height: '164px',
                        background: 'linear-gradient(135deg, #cfe6ff 0%, #edf6ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {imageExist ? (
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            src={backend.IMAGE_LINK + item.image_link}
                            onError={() => setImageExist(false)}
                            alt={`${item.label} marker`}
                        />
                    ) : (
                        <img
                            style={{
                                maxHeight: '92px',
                                maxWidth: '92px',
                                objectFit: 'contain',
                            }}
                            src={backend.IMAGE_LINK + typeIcon}
                            alt={`${item.label} type icon`}
                        />
                    )}
                </div>
                <div
                    style={{
                        padding: '14px',
                        color: '#102146',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        textAlign: 'left',
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            color: '#071c8d',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        {item.type || 'marker'}
                    </div>
                    <div
                        style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: '#111',
                            wordBreak: 'break-word',
                        }}
                    >
                        {item.label}
                    </div>
                    <div
                        style={{
                            color: '#1f2a50',
                            fontSize: '14px',
                            lineHeight: 1.4,
                            minHeight: '40px',
                            wordBreak: 'break-word',
                        }}
                    >
                        {item.address}
                    </div>
                    <div
                        style={{
                            color: '#29456d',
                            fontSize: '14px',
                            lineHeight: 1.45,
                            minHeight: '60px',
                            wordBreak: 'break-word',
                        }}
                    >
                        {shortDescription}
                    </div>
                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#071c8d',
                            minHeight: '24px',
                        }}
                    >
                        {item.permanent && <PinDropIcon fontSize='small' />}
                        {item.need_booking && <LocalPhoneIcon fontSize='small' />}
                    </div>
                </div>
            </div>
            {item.is_fav && (
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                    }}
                >
                    <StarIcon sx={{ color: 'yellow' }}/>
                </div>
            )}
        </Button>
    )
}

export default MarkerGridItem
