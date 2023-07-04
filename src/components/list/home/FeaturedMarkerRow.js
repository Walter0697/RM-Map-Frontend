import React, { useState, useEffect, useMemo } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import RoundImage from '../../wrapper/RoundImage'

import markerhelper from '../../../scripts/marker'

function FeaturedMarker({
    item,
    onClickHandler,
    eventtypes,
}) {

    const imageLink = useMemo(() => {
        if (!item || !item.marker) return ''

        return markerhelper.image.marker_image(item.marker, eventtypes)
    }, [item, eventtypes])

    return (
        <Grid 
            item xs={6} md={6} lg={6}
            fullWidth
        >
            <Button
                variant='contained'
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#48acdb',
                    boxShadow: '2px 2px 6px',
                    textTransform: 'none',
                }}
                onClick={() => onClickHandler(item.marker)}
            >
                <Grid 
                    container 
                    fullWidth
                    style={{
                        height: '100%',
                    }}
                >
                    <Grid
                        item xs={12}
                        fullWidth
                        style={{
                            height: '25px',
                            fontSize: '15px',
                            color: '#1c76d2',
                            marginBottom: '8px',
                        }}
                    >
                        {item.label}
                    </Grid>
                    <Grid 
                        item xs={12}
                        fullWidth
                        style={{
                            height: 'auto',
                        }}
                    >
                        <RoundImage 
                            width={'80%'}
                            src={imageLink}
                        />
                    </Grid>
                    <Grid
                        item xs={12}
                        fullWidth
                        style={{
                            height: '25px',
                            fontSize: '15px',
                            color: '#1c76d2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {item.marker?.label}
                    </Grid>
                </Grid>
            </Button>
        </Grid>
    )
}

function FeaturedMarkerRow({
    row,
    onClickHandler,
    eventtypes,
}) {
    return (
      <Grid 
          container 
          fullWidth
          size='large'
          style={{
              height: '100%',
              width: '100%',
          }}
      >
          {row.left && (
              <FeaturedMarker
                item={row.left}
                onClickHandler={onClickHandler}
                eventtypes={eventtypes}
              />
          )}
          {row.right && (
              <FeaturedMarker
                item={row.right}
                onClickHandler={onClickHandler}
                eventtypes={eventtypes}
              />
          )}
      </Grid>
    )
}

export default FeaturedMarkerRow