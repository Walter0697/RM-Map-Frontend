import dayjs from 'dayjs'
import generic from './generic'

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
const fillVariableForMarker = (marker) => {
    // for determine if it is hurry
    marker.is_hurry = false
    if (marker.to_time) {
        const fivedays = dayjs(marker.to_time).add(5, 'day')
        if (fivedays.isAfter(dayjs(), 'day')) {
            marker.is_hurry = true
        }
    }

    return marker
}

const converts = {
    poiToMarkerForm,
    centerToMarkerForm,
    fillVariableForMarker,
}

export default converts
