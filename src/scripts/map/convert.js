import dayjs from 'dayjs'
import generic from './generic'
import constants from '../../constant'

// this script is to convert different object into the expected json
// then we can use the same object into the target form

// **********************************************
// target object
// {
//   latlon: { lat, lon },
//   address,
//   name,
// }
// **********************************************

// **********************************************
// api object structure
// { 
//   address,
//   category, 
//   details: {
//     address: { country, countryCode, countryCodeISO3, countrySubdivision, freeformAddress, localName, municipality, municipalitySubdivision, streetName, streetNumber },
//     poi: {
//       name,
//       categories: [],
//     },
//   },
//   
//   location: {
//     lat,
//     lon,
//   },
//   title
// }
// there are more but those seem like not necessary
// **********************************************

const poiToMarkerForm = (location) => {
    const address = generic.getAddress(location.details.address)
    return {
        latlon: {
            lat: location.location.lat,
            lon: location.location.lon,
        },
        address: address,
        name: location.details.poi.name,
    }
}

const centerToMarkerForm = (latlon, address) => {
    return {
        latlon: {
            lat: latlon.lat,
            lon: latlon.lon,
        },
        address: address,
    }
}

// for filling in the variables of markers
const fillVariableForMarker = (m) => {
    const marker = Object.assign({}, m)
    // for determine if it is hurry and with schedule
    marker.is_hurry = false
    marker.is_timed = false
    if (marker.to_time) {
        marker.is_timed = true
        const fivedays = dayjs(marker.to_time).add(-5, 'day')
        if (fivedays.isBefore(dayjs())) {
            marker.is_hurry = true
        }
    }

    return marker
}

const convertAPIValueToMapXY = (type, item) => {
    if (type === constants.overlay.station.HKMTR) {
        return {
            lat: item.map_x,
            lon: item.map_y,
        }
    }
}

const converts = {
    poiToMarkerForm,
    centerToMarkerForm,
    fillVariableForMarker,
    convertAPIValueToMapXY,
}

export default converts
