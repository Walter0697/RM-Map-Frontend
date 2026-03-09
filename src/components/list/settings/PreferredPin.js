import React from 'react'
import { Button } from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import backend from '../../../constant/backend'

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
                borderRadius: '8px',
                overflow: 'hidden',
                alignContent: 'stretch',
            }}
        >
            { preferredPinList && preferredPinList.map((pin, index) => (
                <Grid 
                    item xs={6} md={6} lg={6}
                    fullWidth
                    key={index}
                    style={{
                        padding: '6px',
                        minHeight: '50%',
                        display: 'flex',
                    }}
                >
                    <Button 
                        variant='contained'
                        style={{
                            height: '100%',
                            width: '100%',
                            textTransform: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={() => openPreferredPinChange(pin)}
                    >
                        {pin.exist ? (
                            <Grid container fullWidth style={{ minHeight: '150px' }}>
                                <Grid 
                                    item xs={12} 
                                    fullWidth
                                    style={{
                                        height: '110px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img 
                                        src={backend.IMAGE_LINK + pin.image_path}
                                        style={{
                                            maxHeight: '100px',
                                            maxWidth: '82%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} style={{ fontWeight: '600' }}>
                                    {pin.label}
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container fullWidth style={{ minHeight: '150px' }}>
                                <Grid 
                                    item xs={12} 
                                    fullWidth
                                    style={{
                                        height: '110px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img 
                                        src={constants.pins.defaultPin}
                                        style={{
                                            maxHeight: '100px',
                                            maxWidth: '82%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} style={{ fontWeight: '600' }}>
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
