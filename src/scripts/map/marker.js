import tt from '@tomtom-international/web-sdk-maps'

const getMarker = (map, location, onMarkerClick, key) => {
    var div = document.createElement('div')
    div.style.backgroundImage = 'url(https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=pin%7cFC8056%7c000000&.png)'
    div.style.width = '30px'
    div.style.height = '50px'
    div.style.zIndex = '10'
    div.style.backgroundRepeat = 'no-repeat'
    div.addEventListener('click', function(e) {
        onMarkerClick(key)
    })

    var marker = new tt.Marker({
        element: div,
    }).setLngLat(location).addTo(map)

    return marker
}

const getTesting = (map, location, onMarkerClick, key) => {
    var div = document.createElement('div')
    div.style.backgroundImage = 'url(https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=test%7c5680FC%7c000000&.png)'
    div.style.width = '30px'
    div.style.height = '50px'
    div.style.zIndex = '15'
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
    getTesting,
}

export default markers