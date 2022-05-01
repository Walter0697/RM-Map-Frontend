const appendToList = (resultList, appendingList) => {
    appendingList.forEach(item => {
        if (!resultList.some(s => s.id === item.id)) {
            resultList.push(item)
        }
    })
    return resultList
}

const filterByEventType = (markers, selected) => {
    let outputList = []
    for (let i = 0; i < selected.length; i++) {
        let matchList = markers.filter(s => s.type === selected[i])
        appendToList(outputList, matchList)
    }
    return outputList
}

const outputMarkerByFilter = (markers, filterlist, eventtypes) => {
    let outputList = markers

    console.log(markers)
    console.log(filterlist)
    outputList = filterByEventType(outputList, filterlist.eventtypes)
    
    return outputList
}

const filter = {
    parse: outputMarkerByFilter,
}

export default filter