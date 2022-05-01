// generic utilties
const appendToList = (resultList, appendingList) => {
    appendingList.forEach(item => {
        if (!resultList.some(s => s.id === item.id)) {
            resultList.push(item)
        }
    })
    return resultList
}

const filterByFreeText = (markers, freetext, types) => {
    const hiddenTypes = types.filter(s => s.hidden).map(s => s.value)
    let markerList = markers.filter(s => !hiddenTypes.includes(s.type))
    if (!freetext) return markerList

    const textList = freetext.split('&')
    const textListWithoutHidden = textList.filter(s => s.toLowerCase() !== 'hidden')
    const hiddenAttr = textList.find(s => s.toLowerCase() === 'hidden')
    
    if (hiddenAttr) {
        markerList = markers.filter(s => hiddenTypes.includes(s.type))
    } 

    let outputList = []
    if (textListWithoutHidden.length === 0) {
        return markerList
    }

    for (let i = 0; i < textListWithoutHidden.length; i++) {
        const lowerCase = textListWithoutHidden[i].toLowerCase()
        if (lowerCase === 'hidden') continue
        const labelList = markerList.filter(s => s.label.includes(lowerCase))
        appendToList(outputList, labelList)
        const restaurantList = markerList.filter(s => s.restaurant?.name.includes(lowerCase))
        appendToList(outputList, restaurantList)
        const restaurantTypeList = markerList.filter(s => s.restaurant?.restaurant_type.includes(lowerCase))
        appendToList(outputList, restaurantTypeList)
    }

    return outputList
}

const filterByEventType = (markers, selected) => {
    if (!selected) return markers
    if (selected.length === 0) return markers
    let outputList = []
    for (let i = 0; i < selected.length; i++) {
        let matchList = markers.filter(s => s.type === selected[i])
        appendToList(outputList, matchList)
    }
    return outputList
}

const filterByAttribute = (markers, selected) => {
    if (!selected) return markers
    if (selected.length === 0) return markers
    let outputList = []
    for (let i = 0; i < selected.length; i++) {
        let matchList = markers
        switch (selected[i]) {
            case 'favourite':
                matchList = markers.filter(s => s.is_fav)
                appendToList(outputList, matchList)
                break
            case 'hurry':
                matchList = markers.filter(s => s.is_hurry)
                appendToList(outputList, matchList)
                break
            case 'timed':
                matchList = markers.filter(s => s.is_timed)
                appendToList(outputList, matchList)
                break
        }
    }
    return outputList
}

const filterByBooking = (markers, status) => {
    if (status) {
        if (status === 'booking') {
            return markers.filter(s => s.need_booking)
        } else {
            return markers.filter(s => !s.need_booking)
        }
    }
    return markers
}

const outputMarkerByFilter = (markers, filterlist, eventtypes) => {
    let outputList = markers

    outputList = filterByFreeText(outputList, filterlist.freetext, eventtypes)
    outputList = filterByEventType(outputList, filterlist.eventtypes)
    outputList = filterByAttribute(outputList, filterlist.attribute)
    outputList = filterByBooking(outputList, filterlist.booking)

    return outputList
}

const filter = {
    parse: outputMarkerByFilter,
}

export default filter