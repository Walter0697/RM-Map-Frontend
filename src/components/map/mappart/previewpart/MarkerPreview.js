import React from 'react'
import {
    Grid,
} from '@mui/material'

import ImageHeadText from '../../../wrapper/ImageHeadText'

function MarkerPreview({
    imageExist,
    typeIcon,
    label,
    address
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
                        display: 'flex',
                    }}
                >
                    <ImageHeadText
                        iconPath={typeIcon}
                        iconSize='25px'
                        label={label}
                        labelSize='18px'
                        labelColor='#002a89'
                        labelBold
                    />
                </Grid>
                <Grid 
                    item xs={12}
                    style={{
                        fontSize: '15px',
                        color: 'grey',
                    }}
                >
                    {address}
                </Grid>
            </Grid>
        </Grid>
    )
}

export default MarkerPreview