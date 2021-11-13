import types from './type'

const onButtonClick = (current, option_type, label, value) => {
    let result = appendLabel(current)
    if (option_type === types.chooseType.multiple) {
        result = onMultipleClick(result, label, value)
    } else if (option_type === types.chooseType.single) {
        result = onSingleClick(result, label, value)
    }

    return removeDuplicateSpecial(removeEdgeSpecial(result))
}

const appendLabel = (current) => {
    if (current === '') return current
    if (current.indexOf('&') === -1 && current.indexOf('=') === -1) {
        return `label=${current}`
    }
    
    return current
}

const onMultipleClick = (current, label, value) => {
    const identifier = `${label}=${value}`
    if (current.includes(identifier)) {
        // filter exist, should remove
        current = current.replace(identifier, '')
    } else {
        // filter does not exist, should append
        current = `${current}&${identifier}`
    }

    return current
}

const onSingleClick = (current, label, value) => {
    const identifier = `${label}=${value}`
    const checker = `${label}=`
    const filterList = current.split('&')
    for (let i = 0; i < filterList.length; i++) {
        if (filterList[i].includes(checker)) {
            if (filterList[i] === identifier) {
                // if it is the current one, remove it
                return current.replace(identifier, '')
            } else {
                // if it is another one, replace it
                return current.replace(filterList[i], identifier)
            }
        }
    }
    
    // if we cannot find anything similar to it, then just append it
    return `${current}&${identifier}`
}

const removeEdgeSpecial = (current) => {
    let start = 0
    let end = current.length
    if (current.charAt(0) === '&') start = 1
    if (current.charAt(current.length - 1) === '&') end = current.length - 1

    return current.substring(start, end)
}

const removeDuplicateSpecial = (str, initial = '', special = '&') => {
    if (str === '') return initial
    if (initial === '') return removeDuplicateSpecial(str.substring(1, str.length), str.charAt(0))

    const nextInit = str.charAt(0)
    const nextSub = str.substring(1, str.length)
    if (nextInit === initial && initial === special) {
        return removeDuplicateSpecial(nextSub, nextInit)
    }
    return initial + removeDuplicateSpecial(nextSub, nextInit)
}

const button = {
    onButtonClick,
}

export default button