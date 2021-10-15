import React, { useState, useRef } from 'react'
import {
    TextField,
    InputAdornment,
    IconButton,
    Button,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ClearIcon from '@mui/icons-material/Clear'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'

import useDebounce from '../../../hooks/useDebounce'

import apis from '../../../apis'

function SearchResultItem({
    text,
    onClickEvent,
}) {
    return (
        <Button
            variant="contained"
            size="middle"
            style={{
                position: 'relative',
                height: '60px',
                width: '88%',
                marginLeft: '1%',
                zIndex: '2',
                background: 'white',
                color: 'black',
                fontWeight: 'normal',
                textTransform: 'none',
                justifyContent: 'start',
            }}
            onClick={() => { onClickEvent(text) }}
        >{text}</Button>
    )
}

function SearchBox({
    searchText,
    setSearch,
    location,
    submitHandler,
    isLoading,
}) {
    const manualInput = useRef(null)
    const [ shouldOpenList, setTyping ] = useState(false)
    const [ resultList, setList ] = useState([])
    const { listTransform, listOpacity } = useSpring({
        config: config.wobbly,
        from: {
            listTransform: `scale(1, 0) translate(0, -100%)`,
            listOpacity: 0,
        },
        to: {
            listTransform: ( shouldOpenList ) ? `scale(1, 1) translate(0, 0%)` : `scale(1, 0) translate(0, -100%)`,
            listOpacity: ( shouldOpenList ) ? 1 : 0,
        },
    })
    
    const onSearchTextKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            // setting this to false so that the prediction won't be fetched
            manualInput.current = false
            setSearch(e.target.value)
            setTyping(false)
            submitHandler(e.target.value)
        }
    }

    const onSearchTextChange = (e) => {
        manualInput.current = true
        setSearch(e.target.value)
        setTyping(false)
    }

    const onTextClickHandler = (text) => {
        manualInput.current = false
        setSearch(text)
        setTyping(false)
        submitHandler(text)
    }

    const clearSearchText = () => {
        setSearch('')
        setTyping(false)
    }

    const onAdornmentClick = () => {
        if (!isLoading) {
            clearSearchText()
        }
    }

    const fetchSearchResult = async () => {
        if (!manualInput.current) return
        if (searchText) {
            let result = await apis.maps.search(searchText, location.lon, location.lat, 5)
            if (result.status === 200) {
                const list = result.data.results
                if (list.length === 0) {
                    setList([])
                    setTyping(false)
                } else {
                    let output = []
                    list.forEach(item => {
                        if (!output.includes(item.poi.name)) {
                            output.push(item.poi.name)
                        }
                    });
                    setList(output)
                    setTyping(true)
                }
            } else {
                // if the request failed, then just simply don't show the list
                setList([])
                setTyping(false)
            }
        } else {
            setList([])
            setTyping(false)
        }
    }
    useDebounce(fetchSearchResult, 1000, [searchText, manualInput])

    return (
        <>
            <TextField
                variant="outlined"
                label="Search..."
                style={{
                    width: '90%',
                    background: 'white',
                    boxShadow: '2px 2px 6px',
                    zIndex: 5,
                }}
                value={searchText}
                onChange={onSearchTextChange}
                onKeyDown={onSearchTextKeyDown}
                InputProps={{
                    endAdornment: (searchText !== '' && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={onAdornmentClick}
                                edge="end"
                            >
                                {isLoading ? <HourglassEmptyIcon /> : <ClearIcon />}
                            </IconButton>
                        </InputAdornment>
                    ))
                }}
            />

            <animated.div
                style={{
                    width: '100%',
                    opacity: listOpacity,
                    transform: listTransform,
                }}
            >
                {resultList.map((result) => (
                    <SearchResultItem
                        key={result}
                        text={result}
                        onClickEvent={onTextClickHandler}
                    />
                ))}
            </animated.div>            
        </>
    )
}

export default SearchBox