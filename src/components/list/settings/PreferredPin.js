import React from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import constants from '../../../constant'

function PreferredPin({
    preferredPinList,
    openPreferredPinChange,
}) {
    return (
        <Grid
            container
            fullWidth
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
            }}
        >
            { preferredPinList && preferredPinList.map((pin, index) => (
                <Grid 
                    item xs={6} md={6} lg={6}
                    fullWidth
                    key={index}
                    style={{
                        padding: '5px',
                    }}
                >
                    <Button 
                        variant='contained'
                        style={{
                            height: '100%',
                            width: '100%',
                        }}
                        onClick={() => openPreferredPinChange(pin)}
                    >
                        {pin.exist ? (
                            <Grid container fullWidth>
                                <Grid 
                                    item xs={12} 
                                    fullWidth
                                    style={{
                                        height: '150px',
                                    }}
                                >
                                    <img 
                                        src={constants.BackendImageLink + pin.image_path}
                                        width='70%'
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {pin.label}
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container fullWidth>
                                <Grid 
                                    item xs={12} 
                                    fullWidth
                                    style={{
                                        height: '150px',
                                    }}
                                >
                                    <img 
                                        src={constants.pins.defaultPin}
                                        width='70%'
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {pin.label}
                                </Grid>
                            </Grid>
                        )}
                    </Button>
                </Grid>
            ))}
        </Grid>
    )
}

export default PreferredPin