import backend from '../constant/backend'

const StaticColour = {
    CardBackground: '#48acdb',
    ScheduledBorder: 'green',
    CountryLocationBorder: '#77fff5',
}

const BackendImageLink = process.env.REACT_APP_IMAGE_LINK || backend.IMAGE_LINK

const constant = {
    StaticColour,
    BackendImageLink,
}

export default constant
