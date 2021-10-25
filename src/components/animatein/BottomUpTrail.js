import React from 'react'
import {
    useTrail,
    animated,
} from '@react-spring/web'

function BottomUpTrail({ 
    children,
  }) {
    const items = React.Children.toArray(children)
    const trail = useTrail(items.length, {
        config: { mass: 5, tension: 2000, friction: 200 },
        opacity: 1,
        y: 0,
        from: { opacity: 0, y: 500 },
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
  
export default BottomUpTrail