import React, { useMemo } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import MoodBadIcon from '@mui/icons-material/MoodBad'

function RestaurantCard({
    restaurant,
}) {
    if (!restaurant) return false
    const rating = useMemo(() => {
        if (restaurant) {
            console.log(restaurant)
            return JSON.parse(restaurant.rating)
        }
        return {}
    }, [restaurant])

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                pointEvent: 'none',
                backgroundColor: '#83c0ff',
                color: '#0808c1',
                width: '100%',
                height: 'auto',
                borderRadius: '5px',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0',
                paddingTop: '10px',
                paddingBottom: '10px',
            }}
        >
            <Grid container spacing={1}>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        paddingLeft: '30px',
                    }}
                >
                    {restaurant.name}
                </Grid>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        wordWrap: 'break-word',
                    }}
                >
                    {restaurant.address}
                </Grid>
                {restaurant.direction && (
                    <Grid item xs={12} md={12} lg={12}
                        style={{
                            color: '#6e6ee4',
                        }}
                    >
                        {restaurant.direction}
                    </Grid>
                )}
                {restaurant.telephone && (
                    <Grid item xs={12} md={12} lg={12}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <LocalPhoneIcon sx={{ marginRight: '10px'}} />
                        {restaurant.telephone} 
                    </Grid>
                )}
                {restaurant.price_range && (
                    <Grid item xs={12} md={12} lg={12}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AttachMoneyIcon sx={{ marginRight: '10px'}} />
                        {restaurant.price_range} 
                    </Grid>
                )}
                {rating && (
                    <>
                        <Grid item xs={4} md={4} lg={4}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <InsertEmoticonIcon sx={{ marginRight: '10px'}} />
                            {rating.like}
                        </Grid>
                        <Grid item xs={4} md={4} lg={4}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <SentimentDissatisfiedIcon sx={{ marginRight: '10px'}} />
                            {rating.average}
                        </Grid>
                        <Grid item xs={4} md={4} lg={4}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MoodBadIcon sx={{ marginRight: '10px'}} />
                            {rating.dislike}
                        </Grid>
                    </>
                )}
                {restaurant.other_info && (
                    <Grid item xs={12} md={12} lg={12} fullWidth>
                        {restaurant.other_info.split('/').map((info, index) => (
                            <div key={index}
                                style={{
                                    background: '#6389fb',
                                    width: 'auto',
                                    padding: '5px',
                                    display: 'inline-block',
                                    borderRadius: '5px',
                                    margin: '5px',
                                }}
                            >
                                {info}
                            </div>
                        ))}
                    </Grid>
                )}
                {restaurant.introduction && (
                    <Grid item xs={12} md={12} lg={12} fullWidth
                        style={{
                            wordWrap: 'break-word',
                            padding: '10px',
                        }}
                    >
                        {restaurant.introduction}
                    </Grid>
                )}
            </Grid>
        </Button>
    )
}

export default RestaurantCard