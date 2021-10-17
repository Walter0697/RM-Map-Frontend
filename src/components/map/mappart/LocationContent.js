import React, { useState, useEffect } from 'react'
import {
    List,
    ListItem,
    ListItemButton,
    Grid,
    Box,
} from '@mui/material'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'

function SearchResultBox({
    id,
    onClickEvent,
    title,
    address,
    category,
}) {
    return (
        <ListItem key={id}>
            <ListItemButton
                style={{
                    height: '85px',
                    width: '100%',
                    borderRadius: '5px',
                    background: '#f5f5f5',
                }}
                onClick={() => onClickEvent(id)}
            >
                <Grid container>
                    <Grid 
                        item 
                        xs={12}
                        style={{
                            fontSize: '18px',
                            paddingLeft: '5px',
                            paddingTop: '5px',
                            color: '#002a89',
                            fontWeight: '500',
                        }}>
                        {title}
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        style={{
                            paddingLeft: '5px',
                            paddingTop: '2px',
                        }}
                    >
                        {address}
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        style={{
                            padding: '5px',
                            color: '#919191',
                        }}
                    >
                        {category}
                    </Grid>
                </Grid>
            </ListItemButton>
        </ListItem>
    )
}

function LocationContent({
    locationList,
    shouldShowList,
    hasContent,
    setShowList,
    selectedIndex,
    setSelectedIndex,
}) {

    if (hasContent && locationList.length !== 0) {
        if (shouldShowList) {
            return (
                <List
                    style={{
                        height: '100%',
                        width: '100%',
                        background: '#c3c9c9',
                        overflow: 'auto',
                        boxShadow: '0px -1px 6px 0px',
                    }}
                >
                    {locationList && locationList.map((location) => (
                        <SearchResultBox
                            key={location.id}
                            id={location.id}
                            onClickEvent={setSelectedIndex}
                            title={location.title}
                            address={location.address}
                            category={location.category}
                        />
                    ))}
                </List>
            )
        } 
        return (
            <Grid
                container
                style={{
                    height: '100%',
                    width: '100%',
                    background: '#c3c9c9',
                    boxShadow: '0px -1px 6px 0px',
                }}
                onClick={setShowList}
            >
                <Grid 
                    item xs={12} 
                    alignItems="center"
                    justifyContent="center"
                    style={{
                        display: 'flex',
                        height: '40%',
                        width: '100%',
                        fontWeight: '5000',
                    }}
                >
                    <ArrowDropUpIcon style={{ color: '#808080' }}/>
                </Grid>
                <Grid 
                    item xs={12} 
                    alignItems="center"
                    justifyContent="center"
                    style={{
                        display: 'flex',
                        height: '60%',
                        width: '100%',
                        fontWeight: 'bold',
                    }}
                >
                    Show {locationList.length} Result(s)
                </Grid>
            </Grid>
        )
    }
    return false
}

export default LocationContent