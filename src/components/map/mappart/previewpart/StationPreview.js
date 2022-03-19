import React from 'react'
import {
    Grid,
} from '@mui/material'

function StationPreview({
    imageExist,
    localName,
    label,
}) {
    return (
        <Grid 
            item 
            xs={imageExist ? 8 : 12} 
            md={imageExist ? 8 : 12} 
            lg={imageExist ? 8 : 12} 
            style={{
                paddingLeft: '20px',
                paddingRight: '20px',
            }}  
        >
            <Grid container>
                <Grid 
                    item xs={12}
                    style={{
                        fontSize: '18px',
                        color: '#002a89',
                    }}
                >
                    {localName}
                </Grid>
                <Grid 
                    item xs={12}
                    style={{
                        fontSize: '15px',
                        color: 'grey',
                    }}
                >
                    {label}
                </Grid>
            </Grid>
        </Grid>
    )
}

export default StationPreview