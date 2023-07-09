import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import StarIcon from '@mui/icons-material/Star'
import PinDropIcon from '@mui/icons-material/PinDrop'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'

import ImageHeadText from '../../wrapper/ImageHeadText'
import RoundImage from '../../wrapper/RoundImage'
import constants from '../../../constant'

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

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
                backgroundColor: constants.colors.CardBackground,
                borderRadius: '5px',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0',
                border: item.status === 'scheduled' ? `3px solid ${constants.colors.ScheduledBorder}` : '',
            }}
            onClick={onClickHandler}
        >
            <Grid
                container
                fullWidth
            >
            { imageExist ? (
                <Grid 
                    item xs={4}
                    style={{ marginTop: '15px', overflow: 'hidden', paddingLeft: '15px', borderRadius: '5px' }}
                >
                    <RoundImage 
                        height={'90px'}
                        src={item.image_link}
                        onError={onImageFailedToLoad}
                    />
                </Grid>
            ) : (
                <Grid 
                    item xs={4}
                    style={{ marginTop: '15px', overflow: 'hidden', paddingLeft: '15px' }}
                >
                    <RoundImage 
                        height={'90px'}
                        src={typeIcon}
                        onError={onImageFailedToLoad}
                    />
                </Grid>
            )}
                <Grid 
                    item 
                    xs={8}
                    style={{
                        marginTop: '15px',
                        paddingLeft: '15px',
                    }}
                >
                <Grid container fullWidth>
                    <Grid 
                    item xs={12} md={12} lg={12} fullWidth
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                    }}
                    >
                        <ImageHeadText
                            iconPath={constants.BackendImageLink + typeIcon}
                            iconSize='20px'
                            label={item.label}
                            labelSize='20px'
                            labelColor='black'
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12} fullWidth>
                    <div
                        style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#455295',
                        }}
                    >
                        {item.address}
                    </div>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12} fullWidth>
                        <div
                            style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '5px',
                            marginRight: '10px',
                            color: '#071c8d',
                            display: 'flex',
                            flexDirection: 'flex-start',
                            width: '95%',
                            }}
                        >
                            {item.permanent && (
                                <PinDropIcon />
                            )} 
                            {item.need_booking && (
                                <LocalPhoneIcon />
                            )} 
                            {item.description}
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
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