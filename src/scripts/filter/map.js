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
        let filterFunc = null
        if (filterObj) {
            switch (fil.label) {
                case types.options.range:
                    filterFunc = filterByRange
                    break
                // case types.options.label:
                //     filterFunc = filterByLabel
                //     break
                default:
                    break
            }

            if (filterFunc) {
                filteredList = filterByRange(filteredList, filterObj.value)
            }
        }
    })

    const multipleFilter = options.filter(s => s.type === types.chooseType.multiple)
    let finalOutput = []
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
        if (filterFunc) {
            for (let i = 0; i < filterArr.length; i++) {
                const list = filterFunc(filteredList, filterArr[i].value)
                finalOutput = appendToList(finalOutput, list)
            }
        }
    })

    return finalOutput
}

const filterByRange = (markers, rangeValue) => {
    return markers
}

const filterByLabel = (markers, label) => {
    return markers.filter( s => s.label.includes(label))
}

const filterByAttribute = (markers, attr) => {
    switch (attr) {
        case 'favourite':
            return markers.filter(s => s.is_fav)
        case 'hurry':
            return markers.filter(s => s.is_hurry)
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