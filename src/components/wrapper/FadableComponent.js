import React from 'react'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

function FadableComponent({
    active,
    children,
}) {
    const { opacity } = useSpring({
        config: config.slow,
        from: { opacity: 0 },
        to: {
            opacity: ( active ) ? 1 : 0,
        },
    })

    return (
        <animated.div
            style={{
                visibility: opacity.interpolate(o => o === 0 ? 'hidden' : 'visible'),
                opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }),
            }}
        >
            {children}
        </animated.div>
    )
}

export default FadableComponent