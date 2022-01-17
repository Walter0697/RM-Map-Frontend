import React, { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
} from '@mui/material'

import BaseForm from './BaseForm'
import OpenriceScrap from './scrapper/OpenriceScrap'

import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'

import graphql from '../../graphql'

function ScrapperForm({
    open,
    handleClose,
    source,
    value,
}) {
    const [ websiteScrapGQL, { data: scrapData, loading: scrapLoading, error: scrapError } ] = useMutation(graphql.scrappers.scrap, { errorPolicy: 'all' })

    const [ loading, setLoading ] = useState(false)
    const [ copyContent, setContent ] = useState('')
    const [ source_id, setSourceId ] = useState('')
    const [ link, setLink ] = useState('')
    const [ success, setSuccess ] = useState(false)
    const [ fetchData, setData ] = useState(null)

    const [ alertMessage, setAlertMessage ] = useState(null)

    const submitLoading = useMemo(() => {
        return loading || scrapLoading
    }, [loading, scrapLoading])

    const title = useMemo(() => {
        switch (source) {
            case 'openrice':
                return 'Scrap Openrice'
            default:
                return 'Scrapping...'
        }
    }, [source])

    useEffect(() => {
        setLoading(true)
        if (open) {
            getClipboardMessage()
        }
    }, [open])

    useEffect(() => {
        if (source_id) {
            websiteScrapGQL({ variables: { source, source_id }})
            setLoading(false)
        }
    }, [source_id])

    useEffect(() => {
        if (scrapData) {
            setData(scrapData.websiteScrap)
            setLoading(false)
        }

        if (scrapError) {
            setAlertMessage({
                type: 'error',
                message: scrapError.message,
            })
        }
    }, [scrapData, scrapError])

    const getClipboardMessage = async () => {
        const text = await navigator.clipboard.readText()
        setContent(text)
    }

    const setFetchInfo = (sourceid, link) => {
        setSourceId(sourceid)
        setLink(link)
        setSuccess(true)
    }

    const findInfoFailed = () => {
        setSuccess(false)
        setLoading(false)
        setAlertMessage({
            type: 'warning',
            message: 'pasted content is not valid',
        })
    }

    const getScrapContent = () => {
        if (source === 'openrice') {
            return (
                <OpenriceScrap
                    showInstruction={!success}
                    content={copyContent}
                    setFetchInfo={setFetchInfo}
                    findInfoFailed={findInfoFailed}
                    restaurant={fetchData}
                />
            )
        } else {
            return false
        }
    }

    const onSubmitHandler = () => {

    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={title}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={submitLoading}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Grid container spacing={2}>
                    {submitLoading ? (
                        <Grid item xs={12} md={12} lg={12} fullWidth style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <HourglassBottomIcon />
                        </Grid>
                    ) : (
                        <Grid item xs={12} md={12} lg={12} fullWidth style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Button
                                variant='contained'
                                onClick={getClipboardMessage}
                            >Paste from clipboard</Button>
                        </Grid>
                    )}
                    
                    <Grid item xs={12} md={12} lg={12} fullWidth>
                        {getScrapContent()}
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default ScrapperForm