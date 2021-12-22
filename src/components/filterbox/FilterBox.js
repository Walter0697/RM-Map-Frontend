import React, { useState, useEffect, useMemo } from 'react'
import {
    Grid,
    Button,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ClearIcon from '@mui/icons-material/Clear'

import useBoop from '../../hooks/useBoop'

import ImageHeadText from '../wrapper/ImageHeadText'

import filters from '../../scripts/filter'

function FilterView({
    expandFilterView,
    customFilterValue,
    finalFilterValue,
}) {

    const labelValue = useMemo(() => {
        if (customFilterValue !== '') {
            const custom = customFilterValue.split('&')
            if (finalFilterValue) {
                return [...custom, ...finalFilterValue]
            }
            return custom
        }
        if (finalFilterValue) {
            return finalFilterValue
        }
        return null
    }, [finalFilterValue, customFilterValue])

    if (!labelValue) {
        return (
            <Button 
                style={{
                    marginTop: '10px',
                    marginBottom: '10px',
                    height: '100%',
                    width: '100%',
                }}
                onClick={expandFilterView}
            >
                    click here for filter
            </Button>
        )
    }
    return (
        <Button 
                style={{
                    marginTop: '10px',
                    width: '100%',
                    display: 'inline-block',
                    textTransform: 'none',
                }}
                onClick={expandFilterView}
            >
            
            {labelValue.map((item, index) => (
                <div
                    key={index}
                    style={{
                        height: 'auto',
                        width: 'auto',
                        marginRight: '5px',
                        marginLeft: '5px',
                        marginBottom: '10px',
                        padding: '6px',
                        borderRadius: '10px',
                        backgroundColor: '#0baabf',
                        float: 'left',
                    }}
                >
                    {item}
                </div>
            ))}
        </Button>
    )
}

function FilterPick({
    confirmFilterValue,
    filterOption,
    filterValue,
    setFilterValue,
    customFilterValue,
    setCustomFilterValue,
}) {

    const [ isBlinking, setBlink ] = useBoop(50)
    const [ error, setError ] = useState('')
    const displayOption = useMemo(() => {
        let eventtypesOption = filterOption.find(s => s.label === 'eventtype')
        if (eventtypesOption) {
            eventtypesOption.options = eventtypesOption.options.filter(s => !s.hidden)
        }
        return filterOption.filter(s => !s.hidden)
    }, [filterOption])

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

    const clearFilterValue = () => {
        setError('')
        setFilterValue('')
    }

    const onFilterValueChange = (e) => {
        setError('')
        //setFilterValue(e.target.value)
        setCustomFilterValue(e.target.value)
    }

    const validateFilterValue = () => {
        const { error: filterError, value: finalValue } = filters.parser.validateCustomFilterValue(filterOption, filterValue)

        if (filterError) {
            setError(filterError)
            return
        }

        setFilterValue(finalValue)
        confirmFilterValue(finalValue)
    }

    return (
        <>
            <div
                style={{
                    height: '80px',
                    width: '100%',
                }}
            >
                <TextField
                    inputProps={{ spellCheck: 'false' }}
                    variant="filled"
                    label="Search..."
                    style={{
                        marginTop: '15px',
                        width: '90%',
                        marginLeft: '5%',
                    }}
                    // value={filterValue}
                    // onChange={onFilterValueChange}
                    value={customFilterValue}
                    onChange={onFilterValueChange}
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        endAdornment: (filterValue && (
                            <InputAdornment position='end'>
                                <IconButton
                                    onClick={clearFilterValue}
                                    edge='end'
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ))
                    }}
                />
            </div>
            <animated.div
                style={{
                    height: 'auto',
                    width: '100%',
                    padding: '5px',
                    opacity: x,
                }}
            >
                {displayOption.map((item, index) => (
                    <>
                        <div
                            style={{
                                fontSize: '15px',
                                marginBottom: '5px',
                                width: '100%',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                            key={'display' + index}
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
                                        padding: '4px',
                                        height: '40px',
                                    }}
                                >
                                    <div
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            backgroundColor: isSelected(item.label, option.value) ? '#21cebd' : '#bcddda',
                                            border: isSelected(item.label, option.value) ? 'thin solid #1ca4ff' : 'thin solid black',
                                            borderRadius: '5px',
                                            paddingTop: '2px',
                                            paddingLeft: '2px',
                                        }}
                                        onClick={() => toggleOption(item, option.value)}
                                    >
                                        <ImageHeadText
                                            iconPath={option.icon}
                                            iconSize='20px'
                                            label={option.label}
                                            labelSize='12px'
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
                    height: '30px',
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
                    onClick={validateFilterValue}
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
    finalFilterValue,
    customFilterValue,
    setCustomFilterValue,
}) {
    const [ internalExpand, setInternalExpand ] = useState(false)
    const [ blink, refresh ] = useBoop(300)

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
                height: 'auto',
                width: '95%',
                backgroundColor: '#b2d2a4',
                color: '#002976',
                boxShadow: '2px 2px 6px',
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
                            customFilterValue={customFilterValue}
                            setCustomFilterValue={setCustomFilterValue}
                        />
                    ) : (
                        <FilterView
                            expandFilterView={() => setExpand(true)}
                            customFilterValue={customFilterValue}
                            finalFilterValue={finalFilterValue}
                        />
                    )
                }
        </animated.div>
    )
}

export default FilterBox