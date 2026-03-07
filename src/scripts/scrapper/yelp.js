const baseURL = 'https://www.yelp.com/biz/'

const validate = (content) => {
    if (!content) return false
    return content.indexOf(baseURL) !== -1
}

const scrap = (content) => {
    const arrInfo = content.split('\n')
    let linkStr = ''

    for (let i = 0; i < arrInfo.length; i++) {
        const info = arrInfo[i]
        const index = info.indexOf(baseURL)
        if (index !== -1) {
            linkStr = info.substring(index).replace('\n', '').replace('\r', '')
        }
    }

    if (linkStr) {
        try {
            const parsedURL = new URL(linkStr)
            const sourceID = parsedURL.pathname.replace('/biz/', '').replace(/\//g, '').trim()
            if (!sourceID) return false
            return { source_id: sourceID, link: linkStr }
        } catch (error) {
            return false
        }
    }

    return false
}

const yelp = {
    validate,
    scrap,
}

export default yelp
