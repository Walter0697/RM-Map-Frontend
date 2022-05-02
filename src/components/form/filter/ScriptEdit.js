import React, { useState, useEffect } from 'react'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

const keywordList = [ 'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'markers', 'hidden' ]

function ScriptEdit({
    open,
    handleClose,
    script,
    onConfirm,
}) {
    const [ value, setValue ] = useState(script)

    useEffect(() => {
        setValue(script)
    }, [script])

    const addKeyword = (word) => {
        let prev = value
        prev += ' ' + word
        setValue(prev)
    }

    const onConfirmHandler = () => {
        onConfirm(value)
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
                        height: '150px',
                        width: '95%',
                        display: 'flex',
                        marginLeft: '2.5%',
                        marginRight: '2.5%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexWrap: 'wrap',
                    }}>
                        {keywordList.map((keyword, index) => (
                            <div
                                key={index}
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
                        ))}
                    </div>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default ScriptEdit