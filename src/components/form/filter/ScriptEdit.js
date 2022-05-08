import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

import search from '../../../scripts/search'

const keywordList = search.querys.keyword_list
const fieldList = search.querys.field_list

function KeywordBlock({
    addKeyword,
    keyword,
}) {
    return (
        <div
            style={{
                marginRight: '10px',
                backgroundColor: '#33333311',
                height: '40px',
                paddingLeft: '10px',
                paddingRight: '10px',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
            }}
            onClick={() => addKeyword(keyword)}
        >{keyword}</div>
    )
}

function ScriptEdit({
    open,
    handleClose,
    script,
    onConfirm,
    eventtypes,
}) {
    const textRef = useRef(null)

    const [ value, setValue ] = useState(script)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        setValue(script)
    }, [script, open])

    const onTextChangeHandler = (e) => {
        setError(null)
        setValue(e.target.value)
    }

    const addKeyword = (word) => {
        let prev = value
        const typingPosition = textRef.current.selectionStart
        if (prev.length <= typingPosition) {
            prev += ' ' + word
        } else {
            const first = prev.substring(0, typingPosition)
            const last = prev.substring(typingPosition, prev.length)
            prev = first + ' ' + word + last
        }
        setValue(prev)
        textRef.current.focus()
    }

    const onConfirmHandler = () => {
        if (value === '') {
            onConfirm(value)
            return
        }
        const eventtype_list = eventtypes.map(s => {
            return {
                label: s.label,
                value: s.value,
            }
        })
        const result = search.querys.validate(value, eventtype_list)
        if (!result.error) {
            onConfirm(value)
        } else {
            setError(result.error)
        }
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Script Edit'}
            maxWidth={'lg'}
            handleSubmit={onConfirmHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={false}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                    <TextField
                        inputRef={textRef}
                        multiline={true}
                        rows={5}
                        fullWidth
                        name="script"
                        label="script"
                        placeholder="script"
                        autoComplete="off"
                        variant="outlined"
                        value={value}
                        onChange={onTextChangeHandler}
                        error={error}
                    />
                </Grid>
                {error && (
                    <Grid item xs={12} md={12} lg={12}>
                        <div style={{
                            width: '100%',
                            color: 'red',
                        }}>{error}</div>
                    </Grid>
                )}
                <Grid item xs={12} md={12} lg={12}>
                    <div style={{
                        height: '350px',
                        width: '95%',
                        display: 'flex',
                        marginLeft: '2.5%',
                        marginRight: '2.5%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexWrap: 'wrap',
                    }}>
                        {keywordList.map((keyword, index) => (
                            <KeywordBlock
                                key={`keyword${index}`}
                                addKeyword={addKeyword}
                                keyword={keyword}
                            />
                        ))}
                        {fieldList.map((field, index) => (
                            <KeywordBlock
                                key={`field${index}`}
                                addKeyword={addKeyword}
                                keyword={field}
                            />
                        ))}
                        {eventtypes.filter(s => !s.hidden).map((eventtype, index) => (
                            <KeywordBlock
                                key={`eventtype${index}`}
                                addKeyword={addKeyword}
                                keyword={eventtype.label}
                            />
                        ))}
                    </div>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (ScriptEdit)