const sortableDetails = [
    {
        key: 'label',
        name: 'Label',
        asc: 'Label from A to Z',
        dsc: 'Label from Z to A'
    },
    {
        key: 'fromTime',
        name: 'From Time',
        asc: 'From Time from oldest to latest',
        dsc: 'From Time from latest to oldest'
    },
    {
        key: 'toTime',
        name: 'To Time',
        asc: 'To Time from oldest to latest',
        dsc: 'To Time from latest to oldest'
    },
    {
        key: 'eventtype',
        name: 'Type',
        asc: 'Type from top to bottom',
        dsc: 'Type from bottom to top',
    }
]

const getSortableList = () => {
    return sortableDetails.map((s) => {
        return {
            key: s.key,
            name: s.name,
        }
    })
}

const getWordByKey = (key) => {
    const obj = sortableDetails.find(s => s.key === key)
    if (obj) {
        return obj.name
    }
    return ''
}

const getDescriptionBySortObject = (sortObj) => {
    const obj = sortableDetails.find(s => s.key === sortObj.sortType)
    if (obj) {
        if (sortObj.sortOrder === 'ASC') {
            return obj.asc
        }
        return obj.dsc
    }
    return ''
}

const sorts = {
    getSortableList,
    getWordByKey,
    getDescriptionBySortObject,
}

export default sorts