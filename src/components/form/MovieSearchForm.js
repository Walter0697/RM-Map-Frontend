import React, { useState } from 'react'
import { 
    Grid,
    TextField,
    Button,
} from '@mui/material'

import BaseForm from './BaseForm'

function TypeOptionSelect({
    searchQuery,
    toggleSearchingType,
    toggleSearchingLocation,
}) {
    return (
        <>
            <Grid item xs={12} md={12} lg={12}>
                <Button
                    variant='contained'
                    size='large'
                    style={{
                        backgroundColor: '#48acdb',
                        borderRadius: '5px',
                        height: '50px',
                        width: '100%',
                        boxShadow: '2px 2px 6px',
                        alignItems: 'center',
                        textTransform: 'none',
                        padding: '0',
                    }}
                    onClick={toggleSearchingType}
                >
                    Searching Type: {searchQuery.type === 'nowplaying' ? 'Now Playing' : 'Upcoming'}
                </Button>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                <Button
                    variant='contained'
                    size='large'
                    style={{
                        backgroundColor: '#48acdb',
                        borderRadius: '5px',
                        height: '50px',
                        width: '100%',
                        boxShadow: '2px 2px 6px',
                        alignItems: 'center',
                        textTransform: 'none',
                        padding: '0',
                    }}
                    onClick={toggleSearchingLocation}
                >
                    Searching Location: {searchQuery.location === 'HK' ? 'Hong Kong' : 'Everywhere'}
                </Button>
            </Grid>
        </>
    )
}

function KeywordSelect({
    searchQuery,
    onKeywordHandler,
}) {
    return (
        <>
            <Grid item xs={12} md={12} lg={12}>
                <TextField
                    variant='outlined'
                    fullWidth
                    required
                    label='keyword'
                    value={searchQuery.query}
                    onChange={onKeywordHandler}
                />
            </Grid>
        </>
    )
}

function MovieSearchForm({
    currentValue,
    setValue,
    open,
    handleClose,
}) {
    const [ searchQuery, setSearchQuery ] = useState(currentValue)

    const toggleSearchingMethod = () => {
        const targetQuery = (searchQuery.type === 'search') ? 'nowplaying' : 'search'
        setSearchQuery(() => {
            return {
                ...searchQuery,
                type: targetQuery,
            }
        })
    }

    const toggleSearchingType = () => {
        const targetQuery = (searchQuery.type === 'upcoming') ? 'nowplaying' : 'upcoming'
        setSearchQuery(() => {
            return {
                ...searchQuery,
                type: targetQuery,
            }
        })
    }

    const toggleSearchingLocation = () => {
        const targetLocation = searchQuery.location ? null : 'HK'
        setSearchQuery(() => {
            return {
                ...searchQuery,
                location: targetLocation,
            }
        })
    }

    const onQueryTextChangeHandler = (e) => {
        setSearchQuery(() => {
            return {
                ...searchQuery,
                query: e.target.value,
            }
        })
    }

    const handleConfirm = () => {
        let result = {
            type: searchQuery.type,
        }

        if (searchQuery.type === 'search') {
            result.query = searchQuery.query
        } else {
            result.location = searchQuery.location
        }

        setValue(result)
        handleClose()
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Movie search'}
                maxWidth={'lg'}
                handleSubmit={handleConfirm}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={false}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <Button
                            variant='contained'
                            size='large'
                            style={{
                                backgroundColor: '#48acdb',
                                borderRadius: '5px',
                                height: '50px',
                                width: '100%',
                                boxShadow: '2px 2px 6px',
                                alignItems: 'center',
                                textTransform: 'none',
                                padding: '0',
                            }}
                            onClick={toggleSearchingMethod}
                        >
                            Searching Method: {searchQuery.type === 'search' ? 'By Keyword' : 'By Type'}
                        </Button>
                    </Grid>
                    {searchQuery.type === 'search' ? (
                        <KeywordSelect 
                            searchQuery={searchQuery}
                            onKeywordHandler={onQueryTextChangeHandler}
                        />
                    ) : (
                        <TypeOptionSelect
                            searchQuery={searchQuery}
                            toggleSearchingType={toggleSearchingType}
                            toggleSearchingLocation={toggleSearchingLocation}
                        />
                    )}
                    
                </Grid>
            </BaseForm>
        </>
    )
}

export default MovieSearchForm