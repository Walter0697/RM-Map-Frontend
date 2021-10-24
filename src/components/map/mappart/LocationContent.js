import React, { useState, useEffect } from 'react'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import {
    List,
    ListItem,
    ListItemButton,
    Grid,
    IconButton,
} from '@mui/material'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BookmarkIcon from '@mui/icons-material/Bookmark'

import useBoop from '../../../hooks/useBoop'

import maphelper from '../../../scripts/map'

// children element for list view
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

// location detail
function LocationDetail({
    location,
    onBackHandler,
    openForm,
}) {
    if (!location) return false

    const setLocationToCreateForm = () => {
        const markerReference = maphelper.converts.poiToMarkerForm(location)
        openForm(markerReference)
    }

    return (
        <Grid
            container
            style={{
                height: '100%',
                width: '100%',
                background: '#c3c9c9',
                overflow: 'auto',
                paddingTop: '5px',
                paddingLeft: '15px',
                paddingRight: '15px',
                display: 'flex',
                alignItem: 'flex-start',
            }}
        >
            <Grid 
                item xs={6}
                style={{
                    height: '15%',
                }}
            >
                <IconButton
                    size="middle"
                    style={{
                        boxShadow: '2px 2px 6px',
                        background: '#f5f5f5',
                    }}
                    onClick={onBackHandler}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Grid>
            <Grid 
                item xs={6}
                style={{
                    height: '15%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <IconButton
                    size='middle'
                    style={{
                        boxShadow: '2px 2px 6px',
                        background: '#f5f5f5',
                    }}
                    onClick={setLocationToCreateForm}
                >
                    <BookmarkIcon />
                </IconButton>
            </Grid>
            <Grid 
                item xs={12}
                style={{
                    width: '100%',
                    height: '10%',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#002a89',
                }}
            >
                 {location.title}
            </Grid>
            <Grid 
                item xs={12}
                style={{
                    width: '100%',
                    height: '60%',
                }}
            >
                { maphelper.generic.getAddress(location.details.address) }
                <br/><br/>
                { location.details.poi.categories.join(',') }
            </Grid>
        </Grid>
    )
}

// list view 
function SearchResultList({
    locationList,
    setSelectedIndex,
}) {
    return (
        <List
            style={{
                height: '100%',
                width: '100%',
                overflow: 'auto',
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

// collapsed view
function CollapsedView({
    count,
}) {
    return (
        <div style={{ fontWeight: 'bold' }}>
            Show {count} Result(s)
        </div>
    )
}

function LocationContent({
    locationList,
    shouldShowList,
    setShowList,
    setHideList,
    selectedIndex,
    setSelectedIndex,
    openForm,
}) {
    const [ currentTab, setTab ] = useState('none')
    const [ blink, refresh ] = useBoop(300)

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: blink ? 0 : 1, 
    })

    // use useeffect to detect state value changes
    // for transition animation
    useEffect(() => {
        refresh()

        const timer = window.setTimeout(() => {
            if (!shouldShowList) {
                setTab('collapsed')
                return
            }
            if (shouldShowList) {
                if (selectedIndex !== -1) {
                    setTab('detail')
                    return
                }
            }
            setTab('list')
        }, 200)

        return () => {
            window.clearTimeout(timer)
        }
    }, [locationList, shouldShowList, selectedIndex])
    
    // if the tab is expanded, then close it
    // if not, open it
    const onIconClick = () => {
        if (shouldShowList) {
            setHideList()
        } else {
            setShowList()
        }
    }

    // mainly for clicking main panel
    // since collapsed tab is the only for that has a clickable background
    const setShowListIfNeeded = () => {
        if (!shouldShowList) {
            setShowList()
        }
    }

    // getting correct icon 
    const getCurrentIcon = () => {
        if (shouldShowList) {
            return (
                <ArrowDropDownIcon style={{ color: '#808080' }}/>
            )
        }
        return (
            <ArrowDropUpIcon style={{ color: '#808080' }}/>
        )
    }

    // getting layout for different situation
    const getCurrentLayout = () => {
        switch(currentTab) {
            case 'detail':
                return (
                    <LocationDetail
                        location={locationList.find(s => s.id === selectedIndex)}
                        onBackHandler={() => { setSelectedIndex(-1) }}
                        openForm={openForm}
                    />
                )
            case 'list':
                return (
                    <SearchResultList
                        locationList={locationList}
                        setSelectedIndex={setSelectedIndex}
                    />
                )
            case 'collapsed':
                return (
                    <CollapsedView
                        count={locationList.length}
                    />
                )
            default:
                return (<></>)
        }
    }

    // main layout
    return (
        <Grid
            container
            style={{
                height: '100%',
                width: '100%',
                background: '#c3c9c9',
                boxShadow: '0px -1px 6px 0px',
            }}
        >
            <Grid
                item xs={12}
                alignItems='center'
                justifyContent='center'
                style={{
                    display: 'flex',
                    height: (shouldShowList) ? '10%' : '40%',
                    width: '100%',
                    fontWeight: '5000',
                }}
                onClick={onIconClick}
            >
                {getCurrentIcon()}
            </Grid>
            <Grid 
                item xs={12}
                alignItems='center'
                justifyContent='center'
                style={{
                    display: 'flex',
                    height: (shouldShowList) ? '90%' : '60%',
                    width: '100%',
                }}
                onClick={setShowListIfNeeded}
            >
                <animated.div
                    style={{
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        opacity: x.to({
                            range: [0, 1],
                            output: [0, 1],
                        }),
                    }}
                >
                    {getCurrentLayout()}
                </animated.div>
            </Grid>
        </Grid>
    )
}

export default LocationContent