import filter from './filter'

describe('search filter country handling', () => {
    const markers = [
        { id: 1, label: 'a', type: 'food', country_code: 'HK', country_part: 'Kowloon', description: '' },
        { id: 2, label: 'b', type: 'food', country_code: 'CA', country_part: 'Ontario', description: '' },
    ]
    const filterList = {
        freetext: '',
        eventtypes: [],
        attribute: [],
        booking: null,
        hashtag: [],
        script: '',
        sort: [],
    }
    const eventtypes = [{ value: 'food', hidden: false, priority: 1 }]

    test('filters by country code in normal mode', () => {
        const output = filter.parse(markers, filterList, eventtypes, {
            countryCode: 'HK',
            countryPart: { type: 'all' },
        })
        expect(output.map((item) => item.id)).toEqual([1])
    })

    test('does not filter by country when in viewport mode', () => {
        const output = filter.parse(markers, filterList, eventtypes, {
            countryCode: 'HK',
            countryPart: { type: 'viewport', name: 'In View' },
        })
        expect(output.map((item) => item.id)).toEqual([1, 2])
    })
})
