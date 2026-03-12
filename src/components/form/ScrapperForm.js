import React, { useState, useEffect, useMemo } from 'react'
import { useMutation } from '@apollo/client'
import {
    Grid,
    Button,
} from '@mui/material'

import BaseForm from './BaseForm'
import OpenriceScrap from './scrapper/OpenriceScrap'
import YelpScrap from './scrapper/YelpScrap'
import TabelogScrap from './scrapper/TabelogScrap'
import RestaurantCard from '../card/RestaurantCard'

import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'

import graphql from '../../graphql'

function ScrapperForm({
    open,
    handleClose,
    source,
    copied_value,
    value,
    setValue,
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
            case 'yelp':
                return 'Scrap Yelp'
            case 'tabelog':
                return 'Scrap Tabelog'
            default:
                return 'Scrapping...'
        }
    }, [source])

    useEffect(() => {
        if (open) {
            if (copied_value) {
                setLoading(true)
                setSuccess(false)
                setContent(copied_value)
            } else {
                if (value) {
                    setData(value)
                    setLoading(false)
                    setSuccess(true)
                } else {
                    setData(null)
                    setLoading(false)
                    setSuccess(false)
                    // only try when there is no value
                    getClipboardMessage()
                }
            }
        } else {
            setData(null)
            setLoading(false)
            setSuccess(false)
            setSourceId('')
            setContent('')
            setLink('')
        }
    }, [open, value])

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
        setLoading(true)
        if (!navigator?.clipboard?.readText) {
            setLoading(false)
            setAlertMessage({
                type: 'warning',
                message: 'Clipboard access is unavailable in this browser/context.',
            })
            return
        }
        let text = ''
        try {
            text = await navigator.clipboard.readText()
        } catch (error) {
            setLoading(false)
            setAlertMessage({
                type: 'warning',
                message: 'Unable to read clipboard content.',
            })
            return
        }
        if (text === copyContent) {
            setLoading(false)
        }
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

    const onDataSame = () => {
        setLoading(false)
        setAlertMessage({
            type: 'warning',
            message: 'data is the same',
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
                    onDataSame={onDataSame}
                    sourceId={source_id}
                />
            )
        } else if (source === 'yelp') {
            return (
                <YelpScrap
                    content={copyContent}
                    setFetchInfo={setFetchInfo}
                    findInfoFailed={findInfoFailed}
                    onDataSame={onDataSame}
                    sourceId={source_id}
                />
            )
        } else if (source === 'tabelog') {
            return (
                <TabelogScrap
                    content={copyContent}
                    setFetchInfo={setFetchInfo}
                    findInfoFailed={findInfoFailed}
                    onDataSame={onDataSame}
                    sourceId={source_id}
                />
            )
        } else {
            return false
        }
    }

    const getInfoCard = () => {
        if (fetchData) {
            if (fetchData.restaurant) {
                return (
                    <RestaurantCard
                        restaurant={fetchData.restaurant}
                    />
                )
            }  
        }
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()
        // Missing restaurant metadata is allowed; caller will simply hide restaurant info.
        setValue(link, fetchData?.restaurant ? fetchData : null)
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
                            width: '100%',
                        }}>
                            <Button
                                variant='contained'
                                onClick={getClipboardMessage}
                                style={{
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}
                            >Paste from clipboard</Button>
                        </Grid>
                    )}
                    
                    <Grid item xs={12} md={12} lg={12} fullWidth>
                        {getScrapContent()}
                    </Grid>
                    <Grid item xs={12} md={12} lg={12} fullWidth>
                        {getInfoCard()}
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default ScrapperForm
