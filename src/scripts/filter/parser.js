import types from './type'

const parseStringToDisplayArr = (options, valueStr) => {
    let output = []

    const filterList = valueStr.split('&')

    filterList.forEach(filter => {
        const filterParams = filter.split('=')
        const filterType = filterParams[0]
        const filterValue = filterParams[1]

        const optionsList = options.find(s => s.label === filterType).options
        if (optionsList) {
            const valueArr = optionsList.find(s => s.value === filterValue) 
            output.push(valueArr.label)
        } else if (types.allow_options.includes(filterType)) {
            output.push(filterValue)
        } 
    })
    
    return output
}

const validateCustomFilterValue = (options, filterValue) => {
    if (filterValue === '') return { error: '', value: ''}
    // if there is no special characters, we can just append label on it
    if (filterValue.indexOf('&') === -1 && 
        filterValue.indexOf('=') === -1)
        return { error: '', value: `label=${filterValue}` }
        
    const filterList = filterValue.split('&')
    for (let i = 0; i < filterList.length; i++) {
        const filterParams = filterList[i].split('=')
        if (filterParams.length !== 2) 
            return { error: 'invalid format', value: '' }
        const filterType = filterParams[0]
        if (!types.allow_options.includes(filterType))
            return { error: `${filterType} is not alllowed`, value: '' }

        const currentOption = options.find(s => s.label === filterType)
        const filterValue = filterParams[1]
        if (currentOption.options) { // if there is option, inside this object, it can have no option just like 'label'
            if (!currentOption.options.some(s => s.value === filterValue)) {
                return { error: `${filterType} has no ${filterValue}`, value: ''}
            }
        }
    }

    return { error: '', value: filterValue }
}

const parser = {
    parseStringToDisplayArr,
    validateCustomFilterValue,
}

export default parser