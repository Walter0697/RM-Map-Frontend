import React, { useState, useEffect, useRef } from 'react'
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
}) {
    const textRef = useRef(null)

    const [ value, setValue ] = useState(script)

    useEffect(() => {
        setValue(script)
    }, [script, open])

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
        const valid = search.querys.validate(value)
        console.log(valid)
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
                        onChange={e => setValue(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <div style={{
                        height: '100px',
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
                    </div>
                    <div style={{
                        height: '150px',
                        width: '95%',
                        display: 'flex',
                        marginLeft: '2.5%',
                        marginRight: '2.5%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexWrap: 'wrap',
                    }}>
                        {fieldList.map((field, index) => (
                            <KeywordBlock
                                key={`field${index}`}
                                addKeyword={addKeyword}
                                keyword={field}
                            />
                        ))}
                    </div>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default ScriptEdit