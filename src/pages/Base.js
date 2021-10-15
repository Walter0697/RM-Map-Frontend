import React from 'react'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import useBoop from '../hooks/useBoop'
import BottomBar from '../components/bottombar/BottomBar'
 
import styles from '../styles/bottom.module.css'

function Base({ children }) {
    // variable for blinking animation when switching pages
    const [ blink, refresh ] = useBoop(300)

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: blink ? 0 : 1,
    })
    return (
        <>
            <animated.div
                style={{
                    opacity: x.to({
                        range: [0, 1],
                        output: [0, 1],
                    }),
                }}
                className={styles.base}
            >
                {children}
            </animated.div>
            <BottomBar onChangeClick={refresh}/>
        </>
    )
}

export default Base