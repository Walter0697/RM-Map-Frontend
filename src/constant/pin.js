const regularPin = { identifier: 'regular_pin', name: 'Regular', label: 'regular' }
const favouritePin = { identifier: 'favourite_pin', name: 'Favourite', label: 'favourite' }
const selectedPin = { identifier: 'selected_pin', name: 'Selected', label: 'selected' }
const hurryPin = { identifier: 'hurry_pin', name: 'Hurry', label: 'hurry' }

const pinTypes = [
    regularPin,
    favouritePin,
    selectedPin,
    hurryPin,
]

const defaultPin = process.env.REACT_APP_IMAGE_LINK + '/static/pin.png'

const pins = {
    pinTypes,
    defaultPin,
}

export default pins