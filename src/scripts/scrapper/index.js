import openrice from './openrice'
import tabelog from './tabelog'

const validate = (content) => {
    if (openrice.validate(content)) return 'openrice'
    if (tabelog.validate(content)) return 'tabelog'
    return false
}

const scrapper = {
    validate,
    openrice,
    tabelog,
}

export default scrapper
