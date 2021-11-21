import math from './math'

const featuredText = { 
    'upcoming': [
        'it\' about to end!',
        'ending soon!',
        'dont\' miss this!',
    ],
    'longtime': [
        'did you forget this?',
        'once upon a time~',
        'is it still here?',
    ],
    'lucky': [
        'feeling lucky?',
        'today\'s pick!',
        'wanna try this?',
    ],
}

const getPricingDisplay = (pricing) => {
    if (pricing === 'free') return 'free :D'
    if (pricing === 'cheap') return 'cheap $'
    if (pricing === 'middle') return 'middle $$'
    if (pricing === 'expensive') return 'expensive $$$'
    return ''
}

const pickRandomFeaturedText = (type) => {
    const list = featuredText[type]
    if (list) {
        const index = math.rand(list.length)
        return list[index]
    }
    return ''
}

const text = {
    price_display: getPricingDisplay,
    feature_text: pickRandomFeaturedText,
}

export default text