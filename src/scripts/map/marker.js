import tt from '@tomtom-international/web-sdk-maps'
import testing from '../../testing'

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
    getMarker,
}

export default markers