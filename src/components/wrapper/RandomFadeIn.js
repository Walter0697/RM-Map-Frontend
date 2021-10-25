import React from 'react'

import BottomUpTrail from '../animatein/BottomUpTrail'
import SizeUpTrail from '../animatein/SizeUpTrail'
import LeftRightSlideTrail from '../animatein/LeftRightSlideTrail'

import generic from '../../scripts/generic'

function RandomFadeIn({
    children,
}) {
    const index = generic.math.rand(3)

    if (index === 2) {
        return (
            <BottomUpTrail>
                {children}
            </BottomUpTrail>
        )
    }

    if (index === 1) {
        return (
            <LeftRightSlideTrail>
                {children}
            </LeftRightSlideTrail>
        )
    }

    return (
        <SizeUpTrail>
            {children}
        </SizeUpTrail>
    )
}

export default RandomFadeIn