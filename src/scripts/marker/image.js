const getMarkerDisplayImage = (marker, eventtypes) => {
    if (!marker) return ''

    if (marker.image_link) {
        return marker.image_link
    }

    if (marker.type) {
        const typeObj = eventtypes.find(s => s.value === marker.type)
        if (typeObj) {
            return typeObj.icon_path
        }
    }

    return ''
}

const image = {
    marker_image: getMarkerDisplayImage
}

export default image