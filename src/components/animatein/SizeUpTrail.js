import React from 'react'
import {
    useTrail,
    config,
    animated,
} from '@react-spring/web'

function SizeUpTrail({
    children,
}) {
    const items = React.Children.toArray(children)
    const trail = useTrail(items.length, {
        config: config.wobbly,
        transform: 'scale(1, 1)',
        opacity: 1,
        from: { opacity: 0 , transform: 'scale(1, 0)'},
    })

    return (
        <div>
        {trail.map(({ ...style }, index) => (
            <animated.div key={index} style={style}>
                {items[index]}
            </animated.div>
        ))}
        </div>
    )
}

export default SizeUpTrail