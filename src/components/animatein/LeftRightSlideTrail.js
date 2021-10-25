import React from 'react'
import {
    useTrail,
    animated,
} from '@react-spring/web'

function LeftRightSlideTrail({
    children,
}) {
    const items = React.Children.toArray(children)
    const trail = useTrail(items.length, {
        config: { tension: 295, friction: 66 },
        opacity: 1,
        offsetleft: 0,
        offsetright: 0,
        from : { opacity: 0, offsetleft: 300, offsetright: -300 },
    })

    return (
        <div>
            {trail.map(({ opacity, offsetleft, offsetright }, index) => (
                <animated.div key={index} style={{
                    opacity: opacity,
                    x: (index % 2 === 0) ? offsetleft : offsetright,
                }}>
                    {items[index]}
                </animated.div>
            ))}
        </div>
    )
}

export default LeftRightSlideTrail