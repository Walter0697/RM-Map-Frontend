import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
    useSpring,
} from '@react-spring/web'
import { connect } from 'react-redux'

import { useLazyQuery } from '@apollo/client'

import dayjs from 'dayjs'

import MapIcon from '@mui/icons-material/Map'

import RandomFadeIn from '../wrapper/RandomFadeIn'
import WrapperBox from '../wrapper/WrapperBox'
import HomeButtonList from './home/HomeButtonList'
import TodaySchedule from './home/TodaySchedule'
import FeatureMarkerItem from './home/FeaturedMarkerItem'

// DECPRECATED
import FeaturedMarkerRow from './home/FeaturedMarkerRow'
import YesterdayUncheckList from './home/YesterdayUncheckList'

import AnimateRedirectOverlay from '../home/AnimateRedirectOverlay'
import HomeButtonBase from './home/base/HomeButtonBase'

import constants from '../../constant'
import markerhelper from '../../scripts/marker'
import filters from '../../scripts/filter'
import graphql from '../../graphql'

function HomeList({
    yesterdaySchedules,
    setYesterdaySchedules,
    openYesterdayStatusForm,
    setSelectedMarker,
    markers,
    schedules,
    eventtypes,
    dispatch,
}) {
    const history = useHistory()

    const [ animateRedirectTo, setAnimateRedirectTo ] = useState(null)
    const { delta } = useSpring({
        config: {
            mass: 80,
            tension: 180,
            friction: 60
        },
        from: { delta: 0 },
        delta: 1,
    })

    // graphql request
    const [ getTodayGQL, { data: todayData, loading: todayLoading, error: todayError } ] = useLazyQuery(graphql.users.today, { fetchPolicy: 'no-cache' })

    // use memo
    const todayMarkersImage = useMemo(() => {
        if (!schedules) return []
        return filters.schedules.get_today_image(schedules, eventtypes)
    }, [schedules, eventtypes])

    useEffect(() => {
        getTodayGQL({ variables: { time: dayjs().format('YYYY-MM-DD') } })
    }, [])

    useEffect(() => {
        if (todayData) {
            let unfinished_event = []
            todayData.today.yesterday_event.forEach(event => {
                if (!event.status) {
                    unfinished_event.push(event)
                }
            })
            setYesterdaySchedules(unfinished_event)
        }
        
        if (todayError) {
            console.log(todayError)
        }
    }, [todayData, todayError])

    const onTodayScheduleClick = () => {
        setAnimateRedirectTo('/schedule/open')
    }
    
    return (
        <>
            <div style={{
                position: 'absolute',
                height: '90%',
                width: '95%',
                paddingLeft: '5%',
                paddingTop: '20px',
                overflow: 'auto',
            }}>
                <RandomFadeIn>
                    <WrapperBox
                        height={80}
                        marginBottom={'15px'}
                    >
                        <HomeButtonBase 
                            width={'100%'}
                            label={'Markers'}
                            fontSize={'20px'}
                            iconScale={'5'}
                            icon={<MapIcon sx={{ color: constants.colors.HomeButtonIcon}} />}
                            onClickHandler={() => setAnimateRedirectTo('/markers')}
                        />
                    </WrapperBox>
                    <WrapperBox
                        height={80}
                        marginBottom={'15px'}
                    >
                        <HomeButtonList setAnimateRedirectTo={setAnimateRedirectTo} />
                    </WrapperBox>
                    {todayMarkersImage.length !== 0 && (
                        <WrapperBox
                            height={100}
                            marginBottom={'15px'}
                        >
                            <TodaySchedule 
                                list={todayMarkersImage}
                                onClickHandler={onTodayScheduleClick}
                            />
                        </WrapperBox>
                    )}

                    <WrapperBox
                        height={'auto'}
                        marginBottom={'20px'}
                    >
                        <FeatureMarkerItem 
                            onClickHandler={setSelectedMarker}
                            eventtypes={eventtypes}
                        />
                    </WrapperBox>
                </RandomFadeIn>
            </div>
            {yesterdaySchedules && yesterdaySchedules.length !== 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '2%',
                    height: '50px',
                    left: '5%',
                    width: '90%',
                }}>
                    <YesterdayUncheckList
                        onClickHandler={openYesterdayStatusForm}
                    />
                </div>
            )}
            <AnimateRedirectOverlay redirectTo={animateRedirectTo} />
        </>
    )
  }

  export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
    schedules: state.schedule.schedules,
})) (HomeList)