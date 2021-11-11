const chooseType = {
    multiple: 'multiple',
    single: 'single',
}

const options = {
    name: 'name',
    range: 'range',
    eventtype: 'eventtype',
    attribute: 'attribute',
}

const allow_options = [ 
    options.name,
    options.range,
    options.eventtype,
    options.attribute,
]

const types = {
    chooseType,
    options,
    allow_options,
}

export default types