import React from 'react'

import Logo from '../../images/logo.png'
import { version } from '../../../package.json'

import constants from '../../constant'

function HomeTop() {
    return (
         <div style={{
            width: '100%',
            height: '12%',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
        }}>
            <img src={Logo} height={'100%'}/>
            <div style={{
                fontSize: '25px',
                paddingTop: '25px',
                fontWeight: 'bold',
                fontStyle: 'italic',
                color: constants.colors.HomeTitleFontColor,
            }}>Roroad Map</div>
            <div style={{
                fontSize: '10px',
                marginLeft: '10px',
                marginTop: '32px',
                padding: '3px 10px 3px 10px',
                borderRadius: '50px',
                backgroundColor: constants.colors.VersionBadgeBackground,
            }}>v{version}</div>
        </div>
    )
}

export default HomeTop