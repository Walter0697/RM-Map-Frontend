import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import useBoop from '../../hooks/useBoop'

import ImageHeadText from '../wrapper/ImageHeadText'

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
    closeFilterView,
    filterOption,
    filterValue,
    setFilterValue,
}) {

    const [ isBlinking, setBlink ] = useBoop(500)

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: isBlinking ? 0 : 1,
    })

    const toggleOption = (label, value) => {
        const identifier = `${label}-${value}`
        const currentValue = filterValue ?? {}
        if (currentValue[identifier]) {
            currentValue[identifier] = false
        } else {
            currentValue[identifier] = true
        }
        console.log(currentValue)
        setFilterValue(() => currentValue)
        setBlink()
    }

    const isSelected = (label, value) => {
        const identifier = `${label}-${value}`
        if (filterValue[identifier]) return true
        return false
    }

    return (
        <>
            <animated.div
                style={{
                    height: '100%',
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
                                    {isSelected(item.label, option.value) ? (
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                backgroundColor: '#21cebd',
                                                border: 'thin solid #1ca4ff',
                                                borderRadius: '5px',
                                                paddingTop: '5px',
                                                paddingLeft: '5px',
                                            }}
                                            onClick={() => toggleOption(item.label, option.value)}
                                        >
                                            <ImageHeadText
                                                iconPath={option.icon}
                                                iconSize='25px'
                                                label={option.label}
                                                labelSize='20px'
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                backgroundColor: '#bcddda',
                                                border: 'thin solid black',
                                                borderRadius: '5px',
                                                paddingTop: '5px',
                                                paddingLeft: '5px',
                                            }}
                                            onClick={() => toggleOption(item.label, option.value)}
                                        >
                                            <ImageHeadText
                                                iconPath={option.icon}
                                                iconSize='25px'
                                                label={option.label}
                                                labelSize='20px'
                                            />
                                        </div>
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    </>
                ))}
            </animated.div>
        </>
    )
}

function FilterBox({
    filterOption,
    filterValue,
    setFilterValue,
    isExpanded,
    setExpand,
}) {
    const [ internalExpand, setInternalExpand ] = useState(false)
    const [ blink, refresh ] = useBoop(300)

    const { boxHeight } = useSpring({
        config: config.wobbly,
        from: {
            boxHeight: '50px',
        },
        to: {
            boxHeight: internalExpand ? '300px' : '50px',
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
                            blink={refresh}
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