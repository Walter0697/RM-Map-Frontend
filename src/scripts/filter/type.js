const chooseType = {
    multiple: 'multiple',
    single: 'single',
}

const options = {
    label: 'label',
    range: 'range',
    eventtype: 'eventtype',
    attribute: 'attribute',
    estimatetime: 'estimatetime',
    pricing: 'pricing',
}

const allow_options = [ 
    options.label,
    options.range,
    options.eventtype,
    options.attribute,
    options.estimatetime,
    options.pricing,
]

const types = {
    chooseType,
    options,
    allow_options,
}

export default types