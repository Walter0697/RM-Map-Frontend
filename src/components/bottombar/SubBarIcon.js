import React from 'react'
import {
    useTransition,
    animated,
} from '@react-spring/web'

import IconButton from '@mui/material/IconButton'

function SubBarIcon({
    activeIcon,
    activeBackgroundColor,
    parentRoute,
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
        setPath(parentRoute)
    }

    return transitions(({ scale, opacity }, item) =>
        (item.includes(route)) && (
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
                    sx={{
                        backgroundColor: activeBackgroundColor,
                        boxShadow: `0 10px 24px ${activeBackgroundColor}55`,
                    }}
                >
                    {activeIcon}
                </IconButton>
            </animated.div>
        )
    )
}

export default SubBarIcon
