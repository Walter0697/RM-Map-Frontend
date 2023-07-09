import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
    useSpring,
} from '@react-spring/web'

import TrainOverlay from './AnimateRedirect/TrainOverlay'
import PlaneOverlay from './AnimateRedirect/PlaneOverlay'
import MarkerOverlay from './AnimateRedirect/MarkerOverlay'
import ScheduleOverlay from './AnimateRedirect/ScheduleOverlay'

function AnimateRedirectOverlay({
    redirectTo,
}) {
    const history = useHistory()

    useEffect(() => {
        let timer = null

        if (redirectTo) {
            timer = window.setTimeout(() => {
                history.push(redirectTo)
            }, 1500)
        }

        return () => {
            timer && window.clearTimeout(timer)
        }
    }, [redirectTo])
    const { delta } = useSpring({
        config: {
            mass: 80,
            tension: 180,
            friction: 60
        },
        from: { delta: 0 },
        delta: redirectTo ? 1 : 0,
    })

    switch(redirectTo) {
        case '/station':
            return (<TrainOverlay delta={delta} />)
        case '/country':
            return (<PlaneOverlay delta={delta} />)
        case '/markers':
            return (<MarkerOverlay delta={delta} />)
        case '/schedule/open':
            return (<ScheduleOverlay delta={delta} />)
    }

    return null
}

export default AnimateRedirectOverlay