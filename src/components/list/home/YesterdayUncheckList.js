import React, { useEffect } from 'react'
import {
    animated,
    useSpring,
    config,
} from '@react-spring/web'

import useBoop from '../../../hooks/useBoop'

import NotificationImportantIcon from '@mui/icons-material/NotificationImportant'

function YesterdayUncheckList({
    onClickHandler,
}) {
    const [ boop, trigger ] = useBoop(4000)
    const [ shine, grow ] = useBoop(1500)

    const { shineness } = useSpring({
        config: config.wobbly,
        from: { shineness: 0 },
        shineness: shine ? 1 : 0,
    })

    const { delta } = useSpring({
        config: {
            mass: 40,
            tension: 93,
            friction: 60,
            clamp: true,
          },
        from: { delta: 0 },
        delta: boop ? 1 : 0,
    })

    useEffect(() => {
        trigger()
        grow()
        const timer = window.setInterval(() => {
            trigger()
        }, 8000)

        const timer2 = window.setInterval(() => {
            grow()
        }, 3000)

        return () => {
            timer && window.clearInterval(timer)
            timer2 && window.clearInterval(timer2)
        }
    }, [])

    return (
        <animated.div 
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                color: 'yellow',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '5px',
                boxShadow: shineness.to({
                    range: [0, 1],
                    output: [
                        '0 0 1px 1px',
                        '0 0 6px 7px',
                    ],
                })
            }}
            onClick={onClickHandler}
        >
            <animated.div
                style={{
                    transform: delta.to({
                        range: [0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9, 1],
                        output: [
                            'translate(0px, 0px) rotate(0deg)',
                            'translate(0px, -30px) rotate(0deg)',
                            'translate(0px, -29px) rotate(30deg)',
                            'translate(0px, -30px) rotate(-30deg)',
                            'translate(0px, -30px) rotate(30deg)',
                            'translate(0px, -30px) rotate(-30deg)',
                            'translate(0px, -29px) rotate(30deg)',
                            'translate(0px, -30px) rotate(0deg)',
                            'translate(0px, 0px) rotate(0deg)',
                        ],
                    }),
                    scale: delta.to({
                        range: [0, 0.3, 0.4, 0.5, 0.6, 0.9, 1],
                        output: [1, 1, 1.5, 1.5, 1.5, 1, 1],
                    }),
                    transformOrigin: '50% 0%',
                }}
            > 
                <NotificationImportantIcon /> 
            </animated.div>
            <span style={{
                marginLeft: '10px',
            }}>
                Fill in status these!  
            </span>
        </animated.div>
  )
}

export default YesterdayUncheckList