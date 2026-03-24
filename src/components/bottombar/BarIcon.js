import React from 'react'
import {
    useTransition,
    animated,
} from '@react-spring/web'

import IconButton from '@mui/material/IconButton'

function BarIcon({
    activeIcon,
    inactiveIcon,
    route,
    path,
    setPath,
}) {

    const transitions = useTransition(path, {
        from: { scale: 0.86, opacity: 0 },
        enter: { scale: 1, opacity: 1 },
        leave: { scale: 0.86, opacity: 0 },
        config: {
            duration: 220,
        },
    })

    const redirectTo = () => {
        setPath(route)
    }

    return transitions(({ scale, opacity }, item) =>
        (item.includes(route)) ? (
            <animated.div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: scale.to((value) => `translate3d(-50%, -50%, 0) scale(${value})`),
                    opacity,
                    willChange: 'transform, opacity',
                }}
            >
                <IconButton size='large'>
                    {activeIcon}
                </IconButton>
            </animated.div>
        ) : (
            <animated.div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: scale.to((value) => `translate3d(-50%, -50%, 0) scale(${value})`),
                    opacity,
                    willChange: 'transform, opacity',
                }}
            >
                <IconButton
                    size='large'
                    onClick={() => redirectTo()}
                >
                    {inactiveIcon}
                </IconButton>
            </animated.div>
        )
    )
}

export default BarIcon
