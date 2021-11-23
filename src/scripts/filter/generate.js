import types from './type'

const eventTypeFilter = (eventtypes) => {
    let typefilter = []
    eventtypes.forEach(et => {
        typefilter.push({
            label: et.label,
            value: et.value,
            icon: process.env.REACT_APP_IMAGE_LINK + et.icon_path,
            size: 'small',
        })
    })
    return {
        title: 'Event Types',
        label: types.options.eventtype,
        options: typefilter,
        type: types.chooseType.multiple,
    }
}

const rangeFilter = () => {
    return {
        title: 'Range',
        label: types.options.range,
        options: [{
            label: '< 100m',
            value: '100m',
            icon: false,
            size: 'small',
        },{
            label: '< 250m',
            value: '250m',
            icon: false,
            size: 'small',
        },{
            label: '< 500m',
            value: '500m',
            icon: false,
            size: 'small',
        },{
            label: '< 1000m',
            value: '1000m',
            icon: false,
            size: 'small',
        }],
        type: types.chooseType.single,
    }
} 

const attributeFilter = () => {
    return {
        title: 'Attribute',
        label: types.options.attribute,
        options: [{
            label: 'favourite',
            value: 'favourite',
            icon: false,
            size: 'small',
        }, {
            label: 'hurry',
            value: 'hurry',
            icon: false,
            size: 'small',
        }],
        type: types.chooseType.multiple,
    }
}

const estimateTimeFilter = () => {
    return {
        title: 'Estimate Time',
        label: types.options.estimatetime,
        options: [{
            label: 'Short',
            value: 'short',
            icon: false,
            size: 'small',
        }, {
            label: 'Medium',
            value: 'medium',
            icon: false,
            size: 'small',
        }, {
            label: 'Long',
            value: 'long',
            icon: false,
            size: 'small',
        }],
        type: types.chooseType.multiple,
    }
}

const pricingFilter = () => {
    return {
        title: 'Pricing',
        label: types.options.pricing,
        options: [{
            label: 'Free',
            value: 'free',
            icon: false,
            size: 'middle',
        },{
            label: 'Cheap $',
            value: 'cheap',
            icon: false,
            size: 'middle',
        },{
            label: 'Middle $$',
            value: 'middle',
            icon: false,
            size: 'middle',
        },{
            label: 'Expensive $$$',
            value: 'expensive',
            icon: false,
            size: 'middle',
        }],
        type: types.chooseType.multiple,
    }
}

const labelFilter = () => {
    return {
        label: types.options.label,
        type: types.chooseType.single,
        hidden: true,
    }
}

const generate = {
    eventTypeFilter,
    rangeFilter,
    attributeFilter,
    estimateTimeFilter,
    pricingFilter,
    labelFilter,
}

export default generate