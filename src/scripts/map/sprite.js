import constants from '../../constant'
import TrainImage from '../../images/pin/train.png'

const getPinSprite = (type) => {
    if (type === constants.overlay.station.HKMTR) {
        return TrainImage
    }
    return TrainImage
}

const sprite = {
    getPinSprite,
}

export default sprite