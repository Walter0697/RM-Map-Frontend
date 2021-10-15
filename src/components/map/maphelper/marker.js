import tt from '@tomtom-international/web-sdk-maps'

const getMarker = (map, location, style = null) => {
    // var div = document.createElement('div')
    // div.style.backgroundColor = 'red'
    // div.style.height = '10px'
    // div.style.width = '10px'

    // var marker = new tt.Marker({
    //     element: div,
    // }).setLngLat(location).addTo(map)

    var marker = new tt.Marker().setLngLat(location).addTo(map)

    return marker
}

const markers = {
    getMarker,
}

export default markers