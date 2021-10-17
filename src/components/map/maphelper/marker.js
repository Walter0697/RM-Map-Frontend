import tt from '@tomtom-international/web-sdk-maps'

const getMarker = (map, location, style = null) => {
    var marker = new tt.Marker().setLngLat(location).addTo(map)

    return marker
}

const getTesting = (map, location) => {
    var div = document.createElement('div')
    // div.style.backgroundColor = 'red'
    // div.style.height = '10px'
    // div.style.width = '10px'
    div.style.backgroundImage = 'url(https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=test%7c5680FC%7c000000&.png)'
    div.style.width = '30px'
    div.style.height = '50px'
    div.style.zIndex = '15'
    div.style.backgroundRepeat = 'no-repeat'


    var marker = new tt.Marker({
        element: div,
    }).setLngLat(location).addTo(map)

    // el.style.backgroundImage ="url(http://localhost:8080/pumpkin.svg)";
    // el.style.width = "25px";
    // el.style.height = "25px";
    // el.style.backgroundRepeat = "no-repeat";
    // el.addEventListener("click", function(e) {
    //   window.alert(`I'm a pumpkin at coordinates ${markerLng},${markerLat}!`);
    // });

    return marker
}

const markers = {
    getMarker,
    getTesting,
}

export default markers