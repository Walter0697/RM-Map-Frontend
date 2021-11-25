import React from 'react'
import useMobileDetect from 'use-mobile-detect-hook'
import AddIcon from '@mui/icons-material/Add'

function Start() {
    const detectMobile = useMobileDetect()

    const isDesktop = detectMobile.isDesktop()

    if (isDesktop) {
        return (
            <div>This app is a PWA, which is intended to work on mobile device instead of desktop. Please try in your mobile device</div>
        )
    }

    const isIos = detectMobile.isIos()
    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div style={{
                height: '150px',
                width: '150px',
                backgroundColor: '#6f6f6f59',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <AddIcon sx={{ fontSize: '50px', color: '#555555' }}/>
            </div>
            <div style={{
                width: '80%',
                marginTop: '20px',
            }}>
                This is a PWA, please add the app into your home screen
            </div>
            
            {isIos ? (
                <div style={{
                    width: '80%',
                    marginTop: '10px',
                }}>
                    [iOS]Click on the middle icon of your browser, and click on &quot;Add to Home Screen&quot;
                </div>
            ) : (
                <div style={{
                    width: '80%',
                    marginTop: '10px',
                }}>
                    [Android]Click on three dot of your browser, and cilck on &quot;Add to Home Screen&quot;
                </div>
            )}
        </div>
    )
    // if (isIos) {
    //     return (
    //         <div>Use &quot;Add to Home Screen&quot; to create the app</div>
    //     )
    // }
    // return (
    //     <div>Use &quot;Android method&quot; to put the app into Home screen</div>
    // )
}

export default Start