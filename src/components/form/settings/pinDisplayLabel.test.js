import { getPinDisplayLabel } from './pinDisplayLabel'

describe('getPinDisplayLabel', () => {
    test('uses trimmed label when label is present', () => {
        expect(getPinDisplayLabel({ label: '  Friendly Name  ', value: 'pin-value' })).toBe('Friendly Name')
    })

    test('falls back to value when label is empty', () => {
        expect(getPinDisplayLabel({ label: '   ', value: 'pin-value' })).toBe('pin-value')
    })

    test('handles mixed data with missing label/value safely', () => {
        expect(getPinDisplayLabel({ value: 'fallback' })).toBe('fallback')
        expect(getPinDisplayLabel({ label: '' })).toBe('')
        expect(getPinDisplayLabel(null)).toBe('')
    })
})
