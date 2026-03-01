import React from 'react'
import Grid from '@mui/material/GridLegacy'

import TrainIcon from '@mui/icons-material/Train'
import FlightIcon from '@mui/icons-material/Flight' 

import constants from '../../../constant'

import HomeButtonBase from './base/HomeButtonBase'

function HomeButtonList({
    setAnimateRedirectTo,
}) {
    return (
            <Grid container spacing={0} style={{
                height: '100%',
                width: '100%',
            }}>
                <Grid item xs={6} style={{ paddingRight: '4px' }}>
                    <HomeButtonBase 
                        width={'100%'}
                        label={'Train Station Map'}
                        icon={<TrainIcon sx={{ color: constants.colors.HomeButtonIcon}} />}
                        onClickHandler={() => setAnimateRedirectTo('/station')}
                    />
                </Grid>
                <Grid item xs={6} style={{ paddingLeft: '4px' }}>
                    <HomeButtonBase 
                        width={'100%'}
                        label={'Country Map'}
                        icon={<FlightIcon sx={{ color: constants.colors.HomeButtonIcon}} />}
                        onClickHandler={() => setAnimateRedirectTo('/country')}
                    />
                </Grid>
            </Grid>
    )
}

export default HomeButtonList
