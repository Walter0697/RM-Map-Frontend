import React from 'react'
import {
    useTransition,
    config,
} from '@react-spring/web'

function useOpacityTransition(state_value) {
    const transition = useTransition(state_value, {
        from: { position: 'absolute', opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        reverse: state_value,
        config: config.stiff,
    })

    return transition
}

export default useOpacityTransition