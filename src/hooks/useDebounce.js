import React, { useEffect } from 'react'

function useDebounce(callback, time, watchValues) {
    useEffect(() => {
        const timer = window.setTimeout(() => {
            callback()
        }, time)

        return () => clearTimeout(timer)
    }, watchValues)
}

export default useDebounce