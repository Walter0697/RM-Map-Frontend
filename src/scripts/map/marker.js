import tt from '@tomtom-international/web-sdk-maps'
import constants from '../../constant'
import testing from '../../testing'

import TrainImage from '../../images/pin/train.png'

const getPinImage = (mappin_list, markertype, pintype) => {
    if (markertype) {
        const selected = mappin_list.find(s => s.pinlabel === pintype && s.typelabel === markertype)
        if (selected) 
            return selected.image_path
    } else {
        const selected = mappin_list.find(s => s.pinlabel === pintype && s.typelabel === '')
        if (selected)
            return selected.image_path
    }
    
    return null
}

const getMapPin = (map, location, onMarkerClick, selected, key, markertype, pinStyle, mappins) => {
    const pinType = selected ? 'selected' : pinStyle
    const pinImage = getPinImage(mappins, markertype, pinType)
    let pinImageLink = constants.pins.defaultPin
    if (pinImage) {
        pinImageLink = process.env.REACT_APP_IMAGE_LINK + pinImage
    }
    
    var div = document.createElement('div')
    div.style.zIndex = selected ? '30' : '20'
    div.style.width = '65px'
    div.style.height = '65px'
    div.style.backgroundImage = `url(${pinImageLink})`
    div.style.backgroundSize = 'contain'
    div.style.backgroundRepeat = 'no-repeat'
    div.addEventListener('click', function(e) {
        onMarkerClick(key)
    })

    var marker = new tt.Marker({
        element: div
    }).setLngLat(location).addTo(map)
    
    return marker
}

const getOverlayPin = (map, location, type, onPinClick, identifier) => {
    const div = document.createElement('div')
    div.style.zIndex = '10'
    div.style.width = '30px'
    div.style.height = '30px'
    if (type === 'HK_MTR-station') {
        div.style.backgroundImage = `url(${TrainImage})`
    }
    div.style.backgroundSize = 'contain'
    div.style.backgroundRepeat = 'no-repeat'
    div.addEventListener('click', function(e) {
        onPinClick(identifier)
    })

    var pin = new tt.Marker({
        element: div
    }).setLngLat(location).addTo(map)
    
    return pin
}

const getMarker = (map, location, onMarkerClick, key, type, zIndex) => {
    let pin = testing.pins.searchPin
    if (type === 'selected') {
        pin = testing.pins.selectedPin
    } else if (type === 'center') {
        pin = testing.pins.centerPin
    }

    var div = document.createElement('div')
    div.style.backgroundImage = `url(${pin.url})`
    div.style.width = pin.width
    div.style.height = pin.height
    div.style.zIndex = zIndex
    div.style.backgroundRepeat = 'no-repeat'
    div.addEventListener('click', function(e) {
        onMarkerClick(key)
    })

    var marker = new tt.Marker({
        element: div,
    }).setLngLat(location).addTo(map)

    return marker
}

const markers = {
    getMapPin,
    getMarker,
    getOverlayPin,
}

export default markers