import constants from '../../constant'

import HKMTRIcon from '../../images/pin/hkmtr.png'
import TORTCCIcon from '../../images/pin/tortcc.png'

const getTrainIcon = (value) => {
    switch (value) {
        case constants.country.stationIdentifier.HK_MTR:
            return HKMTRIcon
        case constants.country.stationIdentifier.TOR_TCC:
            return TORTCCIcon
    }
    return null
}

const getPinSprite = (type, value) => {
    switch (type) {
        case constants.overlay.typeStation:
            return getTrainIcon(value)
    }
    return null
}

const sprite = {
    getPinSprite,
}

export default sprite