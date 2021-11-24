import React, { useState, useEffect } from 'react'
import useMobileDetect from 'use-mobile-detect-hook'

function Start() {
    const detectMobile = useMobileDetect()

    const isDesktop = detectMobile.isDesktop()

    if (isDesktop) {
        return (
            <div>This app is a PWA, which is intended to work on mobile device instead of desktop. Please try in your mobile device</div>
        )
    }

    const isIos = detectMobile.isIos()
    if (isIos) {
        return (
            <div>Use &quot;Add to Home Screen&quot; to create the app</div>
        )
    }
    return (
        <div>Use &quot;Android method&quot; to put the app into Home screen</div>
    )
}

export default Start