import React, { useState } from 'react'
import {
    useLocation,
} from 'react-router-dom'

import Base from './Base'

function Test() {
    const location = useLocation()
    return (
        <Base>
            <h1>testing {location.pathname}</h1>
        </Base>
    )
}

export default Test