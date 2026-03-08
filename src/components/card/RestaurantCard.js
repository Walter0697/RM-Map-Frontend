import React, { useMemo } from 'react'
import {
    Grid,
    IconButton,
} from '@mui/material'

import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

function RestaurantCard({
    restaurant,
}) {
    if (!restaurant) return false
    const providerLabel = useMemo(() => {
        const raw = `${restaurant?.source || ''}`.trim().toLowerCase()
        if (!raw) return null
        if (raw === 'openrice') return 'OpenRice'
        if (raw === 'yelp') return 'Yelp'
        if (raw === 'tabelog') return 'Tabelog'
        return raw.charAt(0).toUpperCase() + raw.slice(1)
    }, [restaurant?.source])
    const sourceID = useMemo(() => `${restaurant?.source_id || ''}`.trim(), [restaurant?.source_id])
    const ratingSummary = useMemo(() => {
        if (!restaurant?.rating) return null
        try {
            const parsed = JSON.parse(restaurant.rating)
            if (parsed && typeof parsed === 'object') {
                const rows = []
                if (parsed.like) rows.push(`Like ${parsed.like}`)
                if (parsed.average) rows.push(`Average ${parsed.average}`)
                if (parsed.dislike) rows.push(`Dislike ${parsed.dislike}`)
                return rows.length ? rows.join(' | ') : null
            }
        } catch (error) {
            // Yelp and future providers may return rating as plain text.
        }
        const raw = `${restaurant.rating}`.trim()
        return raw || null
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
        <div
            style={{
                backgroundColor: '#83c0ff',
                color: '#0808c1',
                width: '100%',
                height: 'auto',
                borderRadius: '5px',
                boxShadow: '2px 2px 6px',
                padding: '0',
                paddingTop: '10px',
                paddingBottom: '10px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {restaurant.website && (
                <IconButton
                    aria-label='Open restaurant website'
                    size='small'
                    onClick={() => window.open(restaurant.website, '_blank', 'noopener,noreferrer')}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px',
                        color: '#1f3f85',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        zIndex: 2,
                    }}
                >
                    <OpenInNewIcon fontSize='small' />
                </IconButton>
            )}
            <Grid container spacing={0} style={{ width: '100%', margin: 0 }}>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        fontWeight: 'bold',
                        fontSize: '20px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        paddingLeft: '12px',
                        paddingRight: '48px',
                        lineHeight: 1.2,
                    }}
                >
                    {restaurant.name}
                </Grid>
                {providerLabel && (
                    <Grid
                        item
                        xs={12}
                        md={12}
                        lg={12}
                        style={{
                            textAlign: 'left',
                            paddingLeft: '12px',
                            paddingRight: '12px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            alignItems: 'center',
                        }}
                    >
                        {providerLabel && (
                            <span
                                title={sourceID ? `ID: ${sourceID}` : ''}
                                style={{
                                    backgroundColor: '#2f5fd0',
                                    color: '#fff',
                                    borderRadius: '999px',
                                    padding: '2px 10px',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                }}
                            >
                                {providerLabel}
                            </span>
                        )}
                    </Grid>
                )}
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
                {ratingSummary && (
                    <Grid item xs={12} md={12} lg={12}
                        style={metricRowStyle}
                    >
                        <StarIcon />
                        <span>{ratingSummary}</span>
                    </Grid>
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
        </div>
    )
}

export default RestaurantCard
