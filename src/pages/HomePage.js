import React from 'react'
import Base from './Base'

import TopBar from '../components/topbar/TopBar'

function HomePage() {
    return (
        <Base>
            <TopBar
                label='Home'
            />
        </Base>
    )
}

export default HomePage