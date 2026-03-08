import openrice from './openrice'
import yelp from './yelp'
import tabelog from './tabelog'

const validate = (content) => {
    if (openrice.validate(content)) return 'openrice'
    if (yelp.validate(content)) return 'yelp'
    if (tabelog.validate(content)) return 'tabelog'
    return false
}

const scrapper = {
    validate,
    openrice,
    yelp,
    tabelog,
}

export default scrapper
