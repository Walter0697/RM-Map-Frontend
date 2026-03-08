const baseURL = 'https://www.yelp.com/biz/'
const yelpURLPattern = /https?:\/\/(?:www\.)?yelp\.com\/biz\/[^\s]+/i

const validate = (content) => {
    if (!content) return false
    return yelpURLPattern.test(content)
}

const scrap = (content) => {
    const match = content.match(yelpURLPattern)
    let linkStr = match ? match[0] : ''
    linkStr = linkStr.replace(/[)\],.;]+$/, '')

    if (linkStr) {
        try {
            const parsedURL = new URL(linkStr)
            const pathParts = parsedURL.pathname.split('/').filter(Boolean)
            const bizIndex = pathParts.findIndex((item) => item.toLowerCase() === 'biz')
            const sourceID = bizIndex !== -1 && pathParts[bizIndex + 1] ? pathParts[bizIndex + 1].trim() : ''
            if (!sourceID) return false
            return { source_id: sourceID, link: `${parsedURL.origin}/biz/${sourceID}` }
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
