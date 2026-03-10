import React, { useState, useEffect, useMemo } from 'react'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import {
    List,
    ListItem,
    ListItemButton,
    IconButton,
    Typography,
    Box,
    Grid,
} from '@mui/material'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'

import ExtraContentDisplay from './contentpart/ExtraContentDisplay'
import CircleIconButton from '../../field/CircleIconButton'

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
        <ListItem
            key={id}
            disablePadding
            style={{ marginBottom: '14px' }}
        >
            <ListItemButton
                style={{
                    minHeight: '96px',
                    width: '100%',
                    borderRadius: '8px',
                    background: '#f5f5f5',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                }}
                onClick={() => onClickEvent(id)}
            >
                <Box style={{ width: '100%' }}>
                    <Typography
                        style={{
                            fontSize: '18px',
                            color: '#002a89',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            marginBottom: '4px',
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        style={{
                            color: '#2f3b59',
                            fontSize: '13px',
                            lineHeight: 1.35,
                            marginBottom: '4px',
                        }}
                    >
                        {address}
                    </Typography>
                    <Typography
                        style={{
                            color: '#919191',
                            fontSize: '12px',
                            lineHeight: 1.2,
                        }}
                    >
                        {category}
                    </Typography>
                </Box>
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
        <Box
            style={{
                height: '100%',
                width: '100%',
                background: '#c3c9c9',
                overflow: 'auto',
                paddingTop: '12px',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingBottom: '16px',
                boxSizing: 'border-box',
            }}
        >
            <Box
                style={{
                    width: '100%',
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginBottom: '14px',
                    }}
                >
                    <IconButton
                        size='medium'
                        style={{
                            backgroundColor: 'white',
                            boxShadow: '2px 2px 6px',
                            padding: '11px',
                        }}
                        onClick={onBackHandler}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <IconButton
                        size='medium'
                        style={{
                            backgroundColor: 'white',
                            boxShadow: '2px 2px 6px',
                            padding: '11px',
                        }}
                        onClick={setLocationToCreateForm}
                    >
                        <BookmarkIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box
                style={{
                    width: '100%',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#002a89',
                    marginTop: '14px',
                    marginBottom: '14px',
                    lineHeight: 1.2,
                }}
            >
                 {location.title}
            </Box>
            <Box
                style={{
                    width: '100%',
                }}
            >
                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                    <RoomOutlinedIcon
                        sx={{
                            fontSize: 20,
                            color: '#1d4f8c',
                            mt: '2px',
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        style={{
                            fontSize: '16px',
                            color: '#102544',
                            lineHeight: 1.4,
                        }}
                    >
                        { maphelper.generic.getAddress(location.details.address) }
                    </Typography>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                    <CategoryOutlinedIcon
                        sx={{
                            fontSize: 19,
                            color: '#6a7587',
                            mt: '2px',
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        style={{
                            fontSize: '15px',
                            color: '#5a6475',
                            lineHeight: 1.35,
                        }}
                    >
                        { location?.details?.poi?.categories?.join(', ') || 'Unknown category' }
                    </Typography>
                </Box>
            </Box>
        </Box>
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
                padding: '12px',
                boxSizing: 'border-box',
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

function ExtraContentView({
    extraContent,
    onBackHandler,
}) {
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
            }}
        >
            <Grid 
                item xs={12}
                style={{
                    height: '50px',
                }}
            >
                <CircleIconButton
                    onClickHandler={onBackHandler}
                >
                    <ArrowBackIcon />
                </CircleIconButton>
            </Grid>
            <ExtraContentDisplay 
                extraContent={extraContent}
            />
        </Grid>
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
    extraContent,
    cancelExtraContent,
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
            if (extraContent) {
                setTab('extra')
                return
            }
            setTab('list')
        }, 200)

        return () => {
            window.clearTimeout(timer)
        }
    }, [locationList, shouldShowList, selectedIndex, extraContent])
    
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
            case 'extra':
                return (
                    <ExtraContentView 
                        extraContent={extraContent}
                        onBackHandler={cancelExtraContent}
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
