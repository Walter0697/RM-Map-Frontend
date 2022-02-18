const baseURL = 'https://s.openrice.com/'

const validate = (content) => {
    if (!content) return false
    if (content.indexOf(baseURL) === -1) return false
    return true
}

const scrap = (content) => {
    const arrInfo = content.split('\n')
    let linkStr = ''

    // check which row is the row contains an id
    for (let i = 0; i < arrInfo.length; i++) {
        const info = arrInfo[i]
        const index = info.indexOf(baseURL)
        if (index !== -1) {
            linkStr = info.substring(index)
        }
    }

    // get the source id
    if (linkStr) {
        let current_source_id = linkStr.replace(baseURL, '')
        current_source_id = current_source_id.replace('\n', '').replace('\r', '')
        return { source_id: current_source_id, link: linkStr }
    } 
    
    // if no row matches, then return false
    return false
}

const openrice = {
    validate,
    scrap,
}

export default openrice