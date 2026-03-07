const getMarkerId = (marker) => marker?.id ?? marker?.marker_id ?? marker?.markerId ?? null

const deriveViewportCountrySelection = (markers = [], fallbackCountryCode = 'HK') => {
    const counts = {}
    markers.forEach((marker) => {
        const countryCode = marker?.country_code
        if (!countryCode) return
        counts[countryCode] = (counts[countryCode] || 0) + 1
    })

    const countryCodes = Object.keys(counts)
    if (countryCodes.length === 0) {
        return null
    }

    let dominantCountryCode = countryCodes[0]
    countryCodes.forEach((countryCode) => {
        if (counts[countryCode] > counts[dominantCountryCode]) {
            dominantCountryCode = countryCode
        }
    })

    return {
        countryCode: dominantCountryCode || fallbackCountryCode,
        countryPart: {
            type: 'viewport',
            name: 'In View',
        },
    }
}

const isSameFilterCountry = (left, right) => {
    if (!left || !right) return false
    const leftPart = left.countryPart || {}
    const rightPart = right.countryPart || {}
    return (
        left.countryCode === right.countryCode
        && leftPart.type === rightPart.type
        && leftPart.name === rightPart.name
    )
}

const buildMapLocations = (markers = [], selectedMarkerId = null, maphelper) => {
    return markers.map((item) => ({
        id: item.id,
        type: item.type,
        pin: maphelper.pins.getPinType(item),
        selected: selectedMarkerId !== null && item.id === selectedMarkerId,
        location: {
            lon: item.longitude,
            lat: item.latitude,
        },
    }))
}

const reconcileSelectedMarker = (selectedMarkerId, markers = []) => {
    if (!selectedMarkerId) {
        return {
            marker: null,
            shouldClear: false,
        }
    }

    const marker = markers.find((item) => getMarkerId(item) === selectedMarkerId)
    if (marker) {
        return {
            marker,
            shouldClear: false,
        }
    }

    return {
        marker: null,
        shouldClear: true,
        reason: 'missing_in_latest_dataset',
    }
}

export default {
    deriveViewportCountrySelection,
    isSameFilterCountry,
    buildMapLocations,
    reconcileSelectedMarker,
    getMarkerId,
}
