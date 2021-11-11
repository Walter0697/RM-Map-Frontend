import types from './type'

const mapMarkerWithFilter = (markers, filter, options) => {
    if (filter === '') return markers
    const filterList = filter.split('&').map((item) => {
        const info = item.split('=')
        return { label: info[0], value: info[1] }
    })

    // filter the single value first
    const singleFilter = options.filter(s => s.type === types.chooseType.single)
    let filteredList = markers
    singleFilter.forEach(fil => {
        const filterObj = filterList.find(s => s.label === fil.label)
        switch(fil.label) {
            case types.options.range: {
                if (filterObj) {
                    filteredList = filterByRange(filteredList, filterObj.value)
                }
                break
            }   
            default:
                break
        }
    })

    const multipleFilter = options.filter(s => s.type === types.chooseType.multiple)
    let finalOutput = []
    multipleFilter.forEach(fil => {
        const filterArr = filterList.filter(s => s.label === fil.label)
        switch(fil.label) {
            case types.options.attribute: {
                for (let i = 0; i < filterArr.length; i++) {
                    const list = filterByAttribute(filteredList, filterArr[i].value)
                    finalOutput = appendToList(finalOutput, list)
                }
                break
            }
            case types.options.eventtype: {
                for (let i = 0; i < filterArr.length; i++) {
                    const list = filterByEventType(filteredList, filterArr[i].value)
                    console.log(list)
                    finalOutput = appendToList(finalOutput, list)
                }
                break
            }
            default:
                break
        }
    })

    return finalOutput
}

const filterByRange = (markers, rangeValue) => {
    return markers
}

const filterByAttribute = (markers, attr) => {
    let result = []
    markers.forEach(element => {
        switch (attr) {
            case 'favourite': {
                if (element.is_fav) {
                    result.push(element)
                }
                break
            }
            case 'hurry': {
                if (element.is_hurry) {
                    result.push(element)
                }
                break
            }
            default:
                break
        }
    })
    return result
}

const filterByEventType = (markers, et) => {
    let result = []
    markers.forEach(element => {
        if (element.type === et) {
            result.push(element)
        }
    })
    return result
}

const appendToList = (resultList, appendingList) => {
    appendingList.forEach(item => {
        if (!resultList.some(s => s.id === item.id)) {
            resultList.push(item)
        }
    })
    return resultList
}

const map = {
    mapMarkerWithFilter,
}

export default map