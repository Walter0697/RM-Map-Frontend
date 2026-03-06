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
            return JSON.parse(restaurant.rating)
        }
        return {}
    }, [restaurant])
    const metricRowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        textAlign: 'center',
        paddingTop: '2px',
        paddingBottom: '2px',
    }

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                pointerEvents: 'none',
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
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            <Grid container spacing={0} style={{ width: '100%', margin: 0 }}>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                    }}
                >
                    {restaurant.name}
                </Grid>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        wordWrap: 'break-word',
                        textAlign: 'left',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                    }}
                >
                    {restaurant.address}
                </Grid>
                {restaurant.direction && (
                    <Grid item xs={12} md={12} lg={12}
                        style={{
                            color: '#6e6ee4',
                            textAlign: 'left',
                            paddingLeft: '12px',
                            paddingRight: '12px',
                        }}
                    >
                        {restaurant.direction}
                    </Grid>
                )}
                {restaurant.telephone && (
                    <Grid item xs={12} md={12} lg={12}
                        style={metricRowStyle}
                    >
                        <LocalPhoneIcon />
                        <span>{restaurant.telephone}</span>
                    </Grid>
                )}
                {restaurant.price_range && (
                    <Grid item xs={12} md={12} lg={12}
                        style={metricRowStyle}
                    >
                        <AttachMoneyIcon />
                        <span>{restaurant.price_range}</span>
                    </Grid>
                )}
                {rating && (
                    <>
                        <Grid item xs={12} md={12} lg={12}
                            style={metricRowStyle}
                        >
                            <InsertEmoticonIcon />
                            <span>Like: {rating.like}</span>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}
                            style={metricRowStyle}
                        >
                            <SentimentDissatisfiedIcon />
                            <span>Average: {rating.average}</span>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}
                            style={metricRowStyle}
                        >
                            <MoodBadIcon />
                            <span>Dislike: {rating.dislike}</span>
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
