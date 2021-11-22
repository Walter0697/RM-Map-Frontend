const getPricingDisplay = (pricing) => {
    if (pricing === 'free') return 'free :D'
    if (pricing === 'cheap') return 'cheap $'
    if (pricing === 'middle') return 'middle $$'
    if (pricing === 'expensive') return 'expensive $$$'
    return ''
}

const text = {
    price_display: getPricingDisplay,
}

export default text