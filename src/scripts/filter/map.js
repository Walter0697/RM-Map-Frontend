import types from './type'

const filterByQuery = (markers, query, eventtypes) => {
    let currentList = []
    let isHidden = false
    const hiddenEventTypes = eventtypes.filter(s => s.hidden).map(s => s.value)

    let queryList = query.toLowerCase().split('&')
    if (queryList.includes('hidden')) {
        currentList = markers.filter(s => hiddenEventTypes.includes(s.type))
        queryList = queryList.filter(s => s !== 'hidden')
        isHidden = true
    }
    else currentList = markers.filter(s => !hiddenEventTypes.includes(s.type))

    if (queryList.length === 0) return currentList

    for (let i = 0; i < queryList.length; i++) {
        const key = queryList[i]
        let multiResult = []

        // if it is hidden, we often want to search the type as well
        if (isHidden) {
            const filteredByType = currentList.filter(s => s.type.toLowerCase().includes(key))
            multiResult = appendToList(multiResult, filteredByType)
        }

        const filteredByLabel = currentList.filter(s => s.label.toLowerCase().includes(key))
        multiResult = appendToList(multiResult, filteredByLabel)

        const filteredByAddress = currentList.filter(s => s.address.toLowerCase().includes(key))
        multiResult = appendToList(multiResult, filteredByAddress)

        currentList = multiResult
    }

    return currentList
}

// TODO: maybe need the current location for options as well, but, we might implement that later idk
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
        let filterFunc = null
        if (filterObj) {
            switch (fil.label) {
                case types.options.range:
                    filterFunc = filterByRange
                    break
                // case types.options.label:
                //     filterFunc = filterByLabel
                //     break
                case types.options.booking:
                    filterFunc = filterByBooking
                    break
                default:
                    break
            }

            if (filterFunc) {
                filteredList = filterFunc(filteredList, filterObj.value)
            }
        }
    })

    const multipleFilter = options.filter(s => s.type === types.chooseType.multiple)

    // if there is no multiple filters, you shouldn't just return the array
    // since the initial one is emoty
    let hasMultiFilter = false

    multipleFilter.forEach(fil => {
        const filterArr = filterList.filter(s => s.label === fil.label)
        let filterFunc = null
        switch(fil.label) {
            case types.options.attribute:
                filterFunc = filterByAttribute
                break
            case types.options.eventtype: 
                filterFunc = filterByEventType
                break
            case types.options.estimatetime:
                filterFunc = filterByEstimateTime
                break
            case types.options.pricing:
                filterFunc = filterByPricing
                break
            default:
                break
        }
        if (filterFunc && filterArr.length !== 0) {
            let multiResult = []
            for (let i = 0; i < filterArr.length; i++) {
                hasMultiFilter = true
                const list = filterFunc(filteredList, filterArr[i].value)
                multiResult = appendToList(multiResult, list)
            }
            filteredList = multiResult
        }
    })

    return filteredList
}

const filterByRange = (markers, rangeValue) => {
    return markers
}

const filterByLabel = (markers, searching) => {
    return markers.filter(s => s.label.includes(searching))
}

const filterByAttribute = (markers, attr) => {
    switch (attr) {
        case 'favourite':
            return markers.filter(s => s.is_fav)
        case 'hurry':
            return markers.filter(s => s.is_hurry)
        case 'timed':
            return markers.filter(s => s.is_timed)
        default:
            return []
    }
}

const filterByEventType = (markers, et) => {
    return markers.filter(s => s.type === et)
}

const filterByEstimateTime = (markers, et) => {
    return markers.filter(s => s.estimate_time === et)
}

const filterByPricing = (markers, p) => {
    return markers.filter(s => s.price === p)
}

const filterByBooking = (markers, b) => {
    if (b === 'yes') {
        return markers.filter(s => s.need_booking)
    } else {
        return markers.filter(s => !s.need_booking)
    }
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
    filterByQuery,
    appendToList,
}

export default map