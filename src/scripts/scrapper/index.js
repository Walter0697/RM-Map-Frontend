import openrice from './openrice'

const validate = (content) => {
    if (openrice.validate(content)) return 'openrice'
    return false
}

const scrapper = {
    validate,
    openrice,
}

export default scrapper