import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

function HashtagEdit({
    open,
    handleClose,
    selectedHashtag,
    hashtags,
    onConfirm,
}) {
    const [ displayHashtag, setDisplayHashtag ] = useState([])
    const [ selectedList, setSelectedList ] = useState(selectedHashtag)
    const [ searchWord, setSearchWord ] = useState('')

    const filteredHashtag = useMemo(() => {
        return displayHashtag.filter(s => s.includes(searchWord))
    }, [displayHashtag, searchWord])

    useEffect(() => {
        setSelectedList(selectedHashtag)
    }, [selectedHashtag])

    useEffect(() => {
        const list = Object.keys(hashtags)
        setDisplayHashtag(list)
    }, [hashtags])

    const onConfirmHandler = () => {
        onConfirm(selectedList)
    }

    const toggleHashtagValue = (value) => {
        let prev = JSON.parse(JSON.stringify(selectedList))
        if (prev.includes(value)) {
            prev = prev.filter(s => s !== value)
        } else {
            prev.push(value)
        }
        setSelectedList(prev)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Hashtag Edit'}
            maxWidth={'lg'}
            handleSubmit={onConfirmHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={false}
        >
            <Grid container spacing={2}>
                {selectedList && selectedList.length !== 0 && (
                    <Grid item xs={12} md={12} lg={12}>
                        Selected : {selectedList.reduce((prev, current) => prev + ', #' + current, '').substring(1)}
                    </Grid>
                )}
                <Grid item xs={12} md={12} lg={12}>
                    <TextField
                        variant='outlined'
                        size='medium'
                        fullWidth
                        label='Search...'
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <div style={{
                        height: '200px',
                        padding: '10px',
                        overflowY: 'auto',
                        display: 'flex',
                    }}>
                        {filteredHashtag.map((hashtag, index) => (
                            <div
                                key={index}
                                style={{
                                    height: '70px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    marginRight: '10px',
                                }}
                                onClick={() => toggleHashtagValue(hashtag)}
                            >
                                <div
                                    style={{
                                        borderRadius: '15px',
                                        height: '50px',
                                        backgroundColor: '#33333311',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: '10px',
                                        paddingRight: '10px',
                                        color: 'blue',
                                    }}
                                >#{hashtag}</div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                    }}
                                >
                                    {hashtags[hashtag]} markers
                                </div>
                            </div>
                        ))}
                    </div>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default connect(state => ({
    hashtags: state.filter.hashtag,
})) (HashtagEdit)