import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
  } from '@react-spring/web'
  import {
      Grid,
      Button,
  } from '@mui/material'

  import { useQuery } from '@apollo/client'
 
  import dayjs from 'dayjs'

  import useBoop from '../../hooks/useBoop'

  import RandomFadeIn from '../wrapper/RandomFadeIn'
  import WrapperBox from '../wrapper/WrapperBox'
  import TodaySchedule from './home/TodaySchedule'
  import FeaturedMarkerRow from './home/FeaturedMarkerRow'
  import YesterdayUncheckList from './home/YesterdayUncheckList'

  import markerhelper from '../../scripts/marker'
  import generic from '../../scripts/generic'
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

    // graphql request
    const { data: todayData, loading: todayLoading, error: todayError } = useQuery(graphql.users.today, { fetchPolicy: 'no-cache' })
    // TODO: feature list can be in redux
    const [ featuredMarkers, setFeatured ] = useState([])

    const todayMarkersImage = useMemo(() => {
        if (!schedules) return []
        console.log(filters.schedules.get_today_image(schedules, eventtypes))
        return filters.schedules.get_today_image(schedules, eventtypes)

    }, [schedules, eventtypes])
    
    useEffect(() => {
        const featured = getFeaturedMarkers(markers)

        setFeatured(featured)
    }, [markers])

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

    const getFeaturedMarkers = (markers) => {
        let featured = []
        let row = { left: null, right: null }
        const ue = markerhelper.find.upcomingEnd(markers)
        if (ue) {
            const item = {
                label: generic.text.feature_text('upcoming'),
                marker: ue,
            }
            
            if (!row.left) {
                row.left = item
            } else {
                row.right = item
                featured.push(row)
                row = { left: null, right: null }
            }
        }

        const lt = markerhelper.find.longTimeCreated(markers)
        if (lt) {
            const item = {
                label: generic.text.feature_text('longtime'),
                marker: lt,
            }
            
            if (!row.left) {
                row.left = item
            } else {
                row.right = item
                featured.push(row)
                row = { left: null, right: null }
            }
        }

        const fl = markerhelper.find.feelingLucky(markers)
        if (fl) {
            const item = {
                label: generic.text.feature_text('lucky'),
                marker: fl,
            }
            
            if (!row.left) {
                row.left = item
            } else {
                row.right = item
                featured.push(row)
                row = { left: null, right: null }
            }
        }

        if (row.left) {
            featured.push(row)
        }
        
        return featured
    }

    const onTodayScheduleClick = () => {
        history.replace('/schedule/open')
    }

    return (
        <>
            <div style={{
                position: 'absolute',
                height: '80%',
                width: '95%',
                paddingLeft: '5%',
                paddingTop: '20px',
                overflow: 'auto',
            }}>
                <RandomFadeIn>
                    {yesterdaySchedules && yesterdaySchedules.length !== 0 && (
                        <WrapperBox
                            height={40}
                            marginBottom={'15px'}
                        >
                            <YesterdayUncheckList
                                onClickHandler={openYesterdayStatusForm}
                            />
                        </WrapperBox>
                    )}
                    
                    <WrapperBox
                        height={100}
                        marginBottom={'15px'}
                    >
                        <TodaySchedule 
                            list={todayMarkersImage}
                            onClickHandler={onTodayScheduleClick}
                        />
                    </WrapperBox>
                    {featuredMarkers.map((item, index) => (
                        <WrapperBox
                            height={250}
                            marginBottom={'20px'}
                            key={index}
                        >
                            <FeaturedMarkerRow
                                row={item}
                                onClickHandler={setSelectedMarker}
                                eventtypes={eventtypes}
                            />
                        </WrapperBox>
                    ))}
                </RandomFadeIn>
            </div>
        </>
    )
  }

  export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
    schedules: state.schedule.schedules,
})) (HomeList)