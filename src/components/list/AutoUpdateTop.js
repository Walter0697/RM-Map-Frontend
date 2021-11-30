import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'

import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import FileUploadIcon from '@mui/icons-material/FileUpload'

import dayjs from 'dayjs'

import actions from '../../store/actions'
import graphql from '../../graphql'

function AutoUpdateTop({
    topHeight,
    items,
    listRef,
    itemListRef,
    setBottomPaddingHeight,
    dispatch,
}) {
    // graphql request
    const [ listMarkerGQL, { data: markerData, loading: markerLoading } ] = useLazyQuery(graphql.markers.list, { fetchPolicy: 'no-cache' })
    const [ listScheduleGQL, { data: scheduleData, loading: scheduleLoading } ] = useLazyQuery(graphql.schedules.list, { fetchPolicy: 'no-cache' })
    const [ requested, isRequested ] = useState(false)
    const isRequestLoading = useMemo(() => {
        return markerLoading || scheduleLoading
    }, [markerLoading, scheduleLoading])

    // state variable
    const [ enteringPhrase, setEntering ] = useState(false)
    const [ currentScroll, setScrollTop ] = useState(0)
    
    const updateDataFromServer = () => {
        isRequested(true)
        listMarkerGQL()
        listScheduleGQL({ variables: { time: dayjs().format('YYYY-MM-DD') } })
    }

    // use effect for updating the data
    useEffect(() => {
        if (scheduleData) {
            dispatch(actions.resetSchedules(scheduleData.schedules))
        }
    }, [scheduleData]) 
    
    useEffect(() => {
        if (markerData) {
            dispatch(actions.resetMarkers(markerData.markers))
        }
    }, [markerData])

    useEffect(() => {
        if (!isRequestLoading) {
            isRequested(false)
        }
    }, [isRequestLoading])

    useEffect(() => {
        const onScroll = e => {
            setScrollTop(e.target.scrollTop)
        }

        if (listRef.current) {
            listRef.current.scrollTop = topHeight + 1
            listRef.current.addEventListener('scroll', onScroll)
        }

        if (itemListRef.current.clientHeight > listRef.current.clientHeight + topHeight) {
            setBottomPaddingHeight(0)
        } else {
            setBottomPaddingHeight(listRef.current.clientHeight - itemListRef.current.clientHeight + topHeight)
        }

        return () => listRef.current && listRef.current.removeEventListener('scroll', onScroll)
    }, [listRef, items])

    useEffect(() => {
        let timer = null
        if (currentScroll === 0) {
          if (enteringPhrase) {
            updateDataFromServer()
          }
        }
        else if (currentScroll < topHeight) {
          timer = window.setTimeout(() => {
            listRef.current && listRef.current.scrollBy({
                top: (topHeight + 1) - currentScroll,
                behavior: 'smooth'
            })
          }, 500)
        } else {
          setEntering(true)
        }
       
        return () => timer && window.clearTimeout(timer)
      }, [currentScroll, enteringPhrase])

    return (
        <div
            style={{
                height: topHeight,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#04b4ea',
                opacity: (currentScroll > topHeight) ? 0 : (topHeight - currentScroll) / topHeight,
            }}
        >
            {requested ? (
                <RotateLeftIcon sx={{ fontSize: '40px' }} />
            ) : (
                <FileUploadIcon sx={{ fontSize: '40px' }} />
            )}
        </div>
    )
}


export default connect(state => ({
    eventtypes: state.marker.eventtypes,
  }))(AutoUpdateTop)