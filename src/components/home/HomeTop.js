import React from 'react'

import Logo from '../../images/logo.png'
import pkg from '../../../package.json'

import constants from '../../constant'

function HomeTop({ pendingCount = 0, onPendingClick }) {
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
            }}>RoroadMap</div>
            <div style={{
                fontSize: '10px',
                marginLeft: '10px',
                marginTop: '32px',
                padding: '3px 10px 3px 10px',
                borderRadius: '50px',
                backgroundColor: constants.colors.VersionBadgeBackground,
            }}>v{pkg.version}</div>
            {onPendingClick && pendingCount > 0 ? (
                <button type='button' onClick={onPendingClick} style={{ marginLeft: '10px', border: 0, background: '#d32f2f', color: 'white', borderRadius: '12px', padding: '3px 8px', fontWeight: 'bold' }}>
                    Pending {pendingCount}
                </button>
            ) : null}
        </div>
    )
}

export default HomeTop
