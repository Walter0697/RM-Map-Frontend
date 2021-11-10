import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
    TextField,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'

import useBoop from '../../hooks/useBoop'

import ImageHeadText from '../wrapper/ImageHeadText'

import filters from '../../scripts/filter'

function FilterView({
    expandFilterView,
}) {
    return (
        <Button 
                style={{
                    height: '100%',
                    width: '100%',
                }}
                onClick={expandFilterView}
            >
                click here for filter
        </Button>
    )
}

function FilterPick({
    confirmFilterValue,
    filterOption,
    filterValue,
    setFilterValue,
}) {

    const [ isBlinking, setBlink ] = useBoop(50)

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: isBlinking ? 0 : 1,
    })

    const toggleOption = (option_type, value) => {
        const next = filters.button.onButtonClick(filterValue, option_type.type, option_type.label, value)
        setFilterValue(() => next)

        setBlink()
    }

    const isSelected = (label, value) => {
        const identifier = `${label}=${value}`
        return filterValue.includes(identifier)
    }

    return (
        <>
            <div
                style={{
                    height: '15%',
                    width: '100%',
                }}
            >
                <TextField
                    variant="filled"
                    label="Search..."
                    style={{
                        marginTop: '15px',
                        width: '90%',
                        marginLeft: '5%',
                    }}
                    value={filterValue}
                    onChange={() => {}}
                />
            </div>
            <animated.div
                style={{
                    height: '80%',
                    width: '100%',
                    padding: '10px',
                    overflow: 'auto',
                    opacity: x,
                }}
            >
                {filterOption.map((item, index) => (
                    <>
                        <div
                            style={{
                                fontSize: '20px',
                                marginBottom: '5px',
                                width: '100%',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                            key={index}
                        >
                            {item.title}
                        </div>
                        {/* for bottom border */}
                        <div
                            style={{
                                height: '1px',
                                display: 'block',
                                background: 'linear-gradient(to right,  rgba(0,0,0,0) 0%,rgba(147,147,147,1) 40%,rgba(147,147,147,1) 60%,rgba(0,0,0,0) 100%)',
                                marginBottom: '5px',
                            }}
                        />
                        <Grid
                            container
                            fullWidth
                        >
                            {item.options.map((option, oindex) => (
                                <Grid item
                                    key={oindex}
                                    fullWidth
                                    xs={option.size === 'small' ? 4 : (option.size === 'large' ? 12 : 6)}
                                    style={{
                                        padding: '5px',
                                        height: '45px',
                                    }}
                                >
                                    <div
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            backgroundColor: isSelected(item.label, option.value) ? '#21cebd' : '#bcddda',
                                            border: isSelected(item.label, option.value) ? 'thin solid #1ca4ff' : 'thin solid black',
                                            borderRadius: '5px',
                                            paddingTop: '5px',
                                            paddingLeft: '5px',
                                        }}
                                        onClick={() => toggleOption(item, option.value)}
                                    >
                                        <ImageHeadText
                                            iconPath={option.icon}
                                            iconSize='25px'
                                            label={option.label}
                                            labelSize='20px'
                                        />
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                ))}
            </animated.div>
            <Grid
                container
                style={{
                    height: '5%',
                    width: '100%',
                }}
            >
                <Grid
                    item xs={12}
                    alignItems='center'
                    justifyContent='center'
                    style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                    }}
                    onClick={confirmFilterValue}
                >
                    <ArrowDropUpIcon style={{ color: '#808080' }}/>
                </Grid>
            </Grid>
        </>
    )
}

function FilterBox({
    filterOption,
    filterValue,
    setFilterValue,
    isExpanded,
    setExpand,
    confirmFilterValue,
}) {
    const [ internalExpand, setInternalExpand ] = useState(false)
    const [ blink, refresh ] = useBoop(300)

    const { boxHeight } = useSpring({
        config: config.wobbly,
        from: {
            boxHeight: '50px',
        },
        to: {
            boxHeight: internalExpand ? '500px' : '50px',
        }
    })

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: blink ? 0 : 1,
    })

    useEffect(() => {
        refresh()
        setTimeout(() => {
            setInternalExpand(isExpanded)
        }, 300)
    }, [isExpanded])

    return (
        <animated.div
            style={{
                height: boxHeight,
                width: '95%',
                backgroundColor: '#c1fdd1',
                color: '#002976',
                boxShadow: '2px 2px 6px',
                zIndex: 5,
                pointerEvents: 'auto',
                opacity: x,
            }}
        >
                {
                    internalExpand ? (
                        <FilterPick 
                            closeFilterView={() => setExpand(false)}
                            filterOption={filterOption}
                            filterValue={filterValue}
                            setFilterValue={setFilterValue}
                            confirmFilterValue={confirmFilterValue}
                        />
                    ) : (
                        <FilterView
                            expandFilterView={() => setExpand(true)}
                        />
                    )
                }
        </animated.div>
    )
}

export default FilterBox