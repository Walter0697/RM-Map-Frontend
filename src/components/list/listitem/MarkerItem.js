import React, { useState, useEffect } from 'react'
import {
    Button,
} from '@mui/material'
import backend from '../../../constant/backend'

import StarIcon from '@mui/icons-material/Star'
import PinDropIcon from '@mui/icons-material/PinDrop'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'

import ImageHeadText from '../../wrapper/ImageHeadText'
import constant from '../../../scripts/constant'

function MarkerItem({
    item,
    typeIcon,
    onClickHandler,
}) {

    const [ imageExist, setImageExist ] = useState(false)

    useEffect(() => {
        if (item?.image_link) {
        setImageExist(true)
        } else {
        setImageExist(false)
        }
    }, [item])

    const onImageFailedToLoad = () => {
        setImageExist(false)
    }

    const shortDescription = (() => {
        const text = item?.description || ''
        if (text.length <= 56) return text
        return `${text.slice(0, 56)}...`
    })()

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
                backgroundColor: constant.StaticColour.CardBackground,
                borderRadius: '5px',
                height: '100%',
                minHeight: '120px',
                width: '100%',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0',
                border: item.status === 'scheduled' ? `3px solid ${constant.StaticColour.ScheduledBorder}` : '',
                justifyContent: 'flex-start',
            }}
            onClick={onClickHandler}
        >
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                }}
            >
            { imageExist ? (
                <div
                    style={{
                        overflow: 'hidden',
                        width: '34%',
                        minWidth: '110px',
                        maxWidth: '130px',
                        paddingLeft: '12px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        style={{
                            width: '100%',
                            height: '88px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                        }}
                        src={backend.IMAGE_LINK + item.image_link}
                        onError={onImageFailedToLoad}
                    />
                </div>
            ) : (
                <div
                    style={{
                        overflow: 'hidden',
                        width: '34%',
                        minWidth: '110px',
                        maxWidth: '130px',
                        paddingLeft: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        style={{
                            maxHeight: '84px',
                            maxWidth: '92%',
                            objectFit: 'contain',
                        }}
                        src={backend.IMAGE_LINK + typeIcon}
                    />
                </div>
            )}
                <div
                    style={{
                        padding: '12px 12px 10px 12px',
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <ImageHeadText
                            iconPath={backend.IMAGE_LINK + typeIcon}
                            iconSize='20px'
                            label={item.label}
                            labelSize='20px'
                            labelColor='black'
                        />
                </div>
                    <div
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#1f2a50',
                            textAlign: 'left',
                        }}
                    >
                        {item.address}
                    </div>
                    <div
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '5px',
                            marginRight: '10px',
                            color: '#071c8d',
                            whiteSpace: 'nowrap',
                            width: '95%',
                            textAlign: 'left',
                        }}
                    >
                        {item.permanent && (
                            <PinDropIcon />
                        )} 
                        {item.need_booking && (
                            <LocalPhoneIcon />
                        )} 
                        {shortDescription}
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

export default MarkerItem
