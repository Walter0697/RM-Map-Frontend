import React, { useState, useEffect } from 'react'

function useBoop(timing) {
    const [ isBooped, setIsBooped ] = useState(false)
    
    useEffect(() => {
        if (!isBooped) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setIsBooped(false)
        }, timing)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [isBooped, timing])

    const shake = () => {
        setIsBooped(true)
    }

    return [ isBooped, shake ]
}

export default useBoop