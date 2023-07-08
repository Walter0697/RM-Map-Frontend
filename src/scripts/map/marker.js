import tt from '@tomtom-international/web-sdk-maps'
import constants from '../../constant'
import testing from '../../testing'
import sprite from './sprite'

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
        pinImageLink = constants.BackendImageLink + pinImage
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

const getOverlayPin = (map, location, selected, type, typeValue, onPinClick, identifier) => {
    const div = document.createElement('div')
    div.style.zIndex = selected ? '30' : '10'
    div.style.width = '40px'
    div.style.height = '40px'

    const pinSprite = sprite.getPinSprite(type, typeValue)
    div.style.backgroundImage = `url(${pinSprite})`

    if (selected) {
        div.style.filter = 'hue-rotate(180deg)'
    }
    
    div.style.backgroundSize = 'contain'
    div.style.backgroundRepeat = 'no-repeat'
    div.addEventListener('click', function(e) {
        onPinClick(type, identifier)
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