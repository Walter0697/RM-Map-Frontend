import React from 'react'
import {
    useTransition,
    animated
} from '@react-spring/web'

import IconButton from '@mui/material/IconButton'

function SubBarIcon({
    activeIcon,
    parentRoute,
    route,
    path,
    setPath,
}) {

    const transitions = useTransition(path, {
        from: { size: 0, opacity: 0 },
        enter: { size: 1, opacity: 1 },
        leave: { size: 0, opacity: 0 },
        config: {
            tension: 293,
            friction: 15
        },
    })

    const redirectTo = () => {
        setPath(parentRoute)
    }

    return transitions(({ size, opacity }, item) => 
        (item.includes(route)) && (
            <animated.div
                style={{
                    position: 'absolute',
                    scale: size.to({
                        range: [0, 0.5, 1],
                        output: [1, 3, 2],
                    }),
                    opacity: opacity.to({
                        range: [0, 1],
                        output: [0, 1],
                    }),
                }}
            >
                <IconButton size='large'
                    onClick={() => redirectTo()}
                >
                    {activeIcon}
                </IconButton>
            </animated.div>
        )
    )
}

export default SubBarIcon