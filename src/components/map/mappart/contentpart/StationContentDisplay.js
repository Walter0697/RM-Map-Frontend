import React from 'react'
import {
    Grid,
} from '@mui/material'

function StationContentDisplay({
    icon,
    localName,
    label,
}) {
    return (
        <>
            <Grid item xs={4} md={4} lg={4}>
                <img 
                    style={{
                        marginLeft: '10px',
                    }}
                    width='80%'
                    src={icon}
                />
            </Grid>
            <Grid item xs={8} md={8} lg={8}>
                <Grid container>
                    <Grid 
                        item xs={12}
                        style={{
                            width: '100%',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#002a89',
                        }}
                    >
                        {localName}
                    </Grid>
                    <Grid 
                        item xs={12}
                        style={{
                            width: '100%',
                        }}
                    >
                        {label}
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}

export default StationContentDisplay