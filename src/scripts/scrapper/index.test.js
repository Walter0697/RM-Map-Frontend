import scrapper from './index'

describe('scrapper provider detection', () => {
    test('detects openrice links', () => {
        const content = 'hello https://s.openrice.com/demo-id world'
        expect(scrapper.validate(content)).toBe('openrice')
    })

    test('detects yelp links', () => {
        const content = 'hello https://www.yelp.com/biz/north-york-cafe world'
        expect(scrapper.validate(content)).toBe('yelp')
    })

    test('detects tabelog links', () => {
        const content = 'hello https://tabelog.com/tokyo/A1304/A130401/13000001/ world'
        expect(scrapper.validate(content)).toBe('tabelog')
    })

    test('returns false for unsupported links', () => {
        expect(scrapper.validate('https://example.com')).toBe(false)
    })
})
