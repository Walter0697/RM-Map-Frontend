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

const parser = {
    parseStringToDisplayArr,
}

export default parser